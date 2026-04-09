/**
 * Incremental GitHub sync: compare last indexed SHA → current HEAD, delete removed
 * files from pgvector, re-embed added/changed paths only. Checkpoints across
 * time-boxed /api/sync-repo chunks (same pattern as full index).
 */

import { Octokit } from "octokit";
import Bottleneck from "bottleneck";
import { db } from "@/server/db";
import { pollCommits } from "@/lib/github";
import {
  shouldIgnoreFile,
  parseGithubRepoUrl,
  getDefaultBranchHeadSha,
  embedOneSourceFile,
  persistProjectIndexedHeadSha,
  type EmbedFileResult,
} from "@/lib/githubRepoLoader";

const githubContentLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 200 });

export type RepoSyncStatePayload = {
  targetHeadSha: string;
  baseSha: string;
  upsertPaths: string[];
  checkpointIndex: number;
};

const isProd = process.env.NODE_ENV === "production";
const SYNC_LIMIT_MS = isProd ? 50_000 : 280_000;

async function fetchFileAtRef(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  refSha: string,
): Promise<string | null> {
  try {
    const { data } = await githubContentLimiter.schedule(() =>
      octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: refSha,
      }),
    );
    if (Array.isArray(data) || data.type !== "file") return null;
    if (data.encoding === "base64" && data.content) {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch (e) {
    console.warn(`[fetchFileAtRef] ${path} @ ${refSha.slice(0, 7)}:`, e);
    return null;
  }
}

function buildCompareWorklist(
  files: Array<{
    filename?: string;
    status?: string;
    previous_filename?: string;
  }>,
  skipUi: boolean,
): { deletePaths: string[]; upsertPaths: string[] } {
  const deleteSet = new Set<string>();
  const upsertSet = new Set<string>();

  for (const f of files) {
    const status = f.status ?? "";
    const name = f.filename;
    const prev = f.previous_filename;

    if (status === "removed") {
      if (name) deleteSet.add(name);
      continue;
    }

    if (status === "renamed" && prev && name) {
      deleteSet.add(prev);
      if (!shouldIgnoreFile(name, skipUi)) upsertSet.add(name);
      continue;
    }

    if (status === "added" || status === "modified" || status === "changed") {
      if (name && !shouldIgnoreFile(name, skipUi)) upsertSet.add(name);
      continue;
    }

    if (status === "copied" && name && !shouldIgnoreFile(name, skipUi)) {
      upsertSet.add(name);
    }
  }

  return {
    deletePaths: [...deleteSet],
    upsertPaths: [...upsertSet].sort(),
  };
}

/**
 * Run one sync chunk. Caller must set indexingStatus to SYNCING before invoking.
 * Updates progress on Project; sets COMPLETED + lastIndexedCommitSha when done.
 * On time or rate limit, sets PARTIAL + syncState for resume.
 */
export async function runIncrementalRepoSync(
  projectId: string,
  githubUrl: string,
  githubToken?: string,
): Promise<{ status: string }> {
  const startTime = Date.now();
  const parsed = parseGithubRepoUrl(githubUrl);
  if (!parsed) {
    await (db.project as any).update({
      where: { id: projectId },
      data: {
        indexingStatus: "FAILED",
        indexingError: "Invalid GitHub URL for sync",
      },
    });
    return { status: "FAILED" };
  }

  const { owner, repo } = parsed;
  const octokit = new Octokit({ auth: githubToken ?? process.env.GITHUB_TOKEN });

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      lastIndexedCommitSha: true,
      skipUiComponents: true,
      syncState: true,
    } as any,
  });

  if (!project) return { status: "NOT_FOUND" };

  const skipUi = (project as any).skipUiComponents ?? false;
  let syncState = (project as any).syncState as RepoSyncStatePayload | null;

  // Do not block embedding on commit summarization (same as /api/index-project).
  void pollCommits(projectId).catch((err) => {
    console.warn(`[runIncrementalRepoSync] pollCommits:`, err);
  });

  let headSha: string;
  try {
    const remote = await getDefaultBranchHeadSha(octokit, owner, repo);
    headSha = remote.sha;
  } catch (e) {
    console.error(`[runIncrementalRepoSync] HEAD fetch failed:`, e);
    await (db.project as any).update({
      where: { id: projectId },
      data: {
        indexingStatus: "FAILED",
        indexingError: "Could not read repository from GitHub (check access / URL).",
        syncState: null,
      },
    });
    return { status: "FAILED" };
  }

  // Baseline legacy projects: assume current tree matches DB once, then future pushes sync incrementally.
  if (!(project as any).lastIndexedCommitSha) {
    await (db.project as any).update({
      where: { id: projectId },
      data: {
        lastIndexedCommitSha: headSha,
        indexingStatus: "COMPLETED",
        syncState: null,
        indexingError: null,
      },
    });
    console.log(
      `[runIncrementalRepoSync] Baseline lastIndexedCommitSha for project=${projectId}`,
    );
    return { status: "COMPLETED" };
  }

  const baseSha = (project as any).lastIndexedCommitSha as string;

  if (baseSha === headSha && !syncState) {
    await (db.project as any).update({
      where: { id: projectId },
      data: {
        indexingStatus: "COMPLETED",
        indexingError: null,
      },
    });
    return { status: "COMPLETED" };
  }

  // Remote moved while we had a partial checkpoint — recompute diff from last successful base.
  if (
    syncState &&
    (syncState.targetHeadSha !== headSha || syncState.baseSha !== baseSha)
  ) {
    console.log(
      `[runIncrementalRepoSync] Invalidating checkpoint (remote or base moved)`,
    );
    syncState = null;
    await (db.project as any).update({
      where: { id: projectId },
      data: { syncState: null },
    });
  }

  let upsertPaths: string[] = [];
  let checkpointIndex = 0;

  if (!syncState) {
    let comparison: {
      status: string;
      files?: Array<Record<string, unknown>>;
    };
    try {
      const res = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: baseSha,
        head: headSha,
      });
      comparison = res.data as typeof comparison;
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      console.error(`[runIncrementalRepoSync] compare failed:`, msg);
      // Force-push or missing SHAs: realign to current HEAD without deleting embeddings.
      if (e?.status === 404 || /404|not found/i.test(msg)) {
        await persistProjectIndexedHeadSha(projectId, githubUrl, githubToken).catch(
          () => undefined,
        );
        await (db.project as any).update({
          where: { id: projectId },
          data: {
            indexingStatus: "COMPLETED",
            indexingError:
              "Git history changed; re-aligned sync cursor. Re-index from the UI if answers seem stale.",
            syncState: null,
          },
        });
        return { status: "COMPLETED" };
      }
      await (db.project as any).update({
        where: { id: projectId },
        data: {
          indexingStatus: "FAILED",
          indexingError: `Sync compare failed: ${msg}`,
          syncState: null,
        },
      });
      return { status: "FAILED" };
    }

    if (comparison.status === "identical" || !comparison.files?.length) {
      await persistProjectIndexedHeadSha(projectId, githubUrl, githubToken).catch(
        () => undefined,
      );
      await (db.project as any).update({
        where: { id: projectId },
        data: {
          indexingStatus: "COMPLETED",
          indexingError: null,
          syncState: null,
        },
      });
      return { status: "COMPLETED" };
    }

    if (comparison.files.length >= 300) {
      console.warn(
        `[runIncrementalRepoSync] Large compare (${comparison.files.length} files); GitHub may truncate the file list.`,
      );
    }

    const { deletePaths, upsertPaths: upsert } = buildCompareWorklist(
      comparison.files as any[],
      skipUi,
    );

    if (deletePaths.length > 0) {
      await db.sourceCodeEmbeddings.deleteMany({
        where: { projectId, fileName: { in: deletePaths } },
      });
    }

    upsertPaths = upsert;
    checkpointIndex = 0;

    await (db.project as any).update({
      where: { id: projectId },
      data: {
        indexingTotal: upsertPaths.length,
        indexingProgress: 0,
        indexingError: null,
      },
    });

    if (upsertPaths.length === 0) {
      await persistProjectIndexedHeadSha(projectId, githubUrl, githubToken).catch(
        () => undefined,
      );
      await (db.project as any).update({
        where: { id: projectId },
        data: {
          indexingStatus: "COMPLETED",
          syncState: null,
          indexedAt: new Date(),
        },
      });
      return { status: "COMPLETED" };
    }

    await (db.project as any).update({
      where: { id: projectId },
      data: {
        syncState: {
          targetHeadSha: headSha,
          baseSha,
          upsertPaths,
          checkpointIndex: 0,
        } satisfies RepoSyncStatePayload,
      },
    });
    syncState = {
      targetHeadSha: headSha,
      baseSha,
      upsertPaths,
      checkpointIndex: 0,
    };
  } else {
    upsertPaths = syncState.upsertPaths;
    checkpointIndex = syncState.checkpointIndex;
    await (db.project as any).update({
      where: { id: projectId },
      data: {
        indexingTotal: upsertPaths.length,
        indexingProgress: checkpointIndex,
      },
    });
  }

  // Process upserts from checkpoint
  for (let i = checkpointIndex; i < upsertPaths.length; i++) {
    if (Date.now() - startTime > SYNC_LIMIT_MS) {
      const nextState: RepoSyncStatePayload = {
        targetHeadSha: headSha,
        baseSha,
        upsertPaths,
        checkpointIndex: i,
      };
      await (db.project as any).update({
        where: { id: projectId },
        data: {
          indexingStatus: "PARTIAL",
          indexingProgress: i,
          indexingTotal: upsertPaths.length,
          syncState: nextState,
          indexingError:
            "Sync paused (time limit). Will resume automatically or tap Resume.",
        },
      });
      return { status: "PARTIAL" };
    }

    const path = upsertPaths[i]!;
    const code = await fetchFileAtRef(octokit, owner, repo, path, headSha);
    if (code === null) {
      await db.sourceCodeEmbeddings.deleteMany({
        where: { projectId, fileName: path },
      });
    } else {
      const result: EmbedFileResult = await embedOneSourceFile(
        projectId,
        path,
        code,
      );
      if (result.kind === "rate_limited") {
        const nextState: RepoSyncStatePayload = {
          targetHeadSha: headSha,
          baseSha,
          upsertPaths,
          checkpointIndex: i,
        };
        await (db.project as any).update({
          where: { id: projectId },
          data: {
            indexingStatus: "PARTIAL",
            indexingProgress: i,
            indexingTotal: upsertPaths.length,
            syncState: nextState,
            indexingError:
              "Sync paused (rate limit). Will resume automatically or tap Resume.",
          },
        });
        return { status: "PARTIAL" };
      }
    }

    const done = i + 1;
    await (db.project as any).update({
      where: { id: projectId },
      data: {
        indexingProgress: done,
        syncState: {
          targetHeadSha: headSha,
          baseSha,
          upsertPaths,
          checkpointIndex: done,
        } satisfies RepoSyncStatePayload,
      },
    });
  }

  await persistProjectIndexedHeadSha(projectId, githubUrl, githubToken).catch(
    () => undefined,
  );
  await (db.project as any).update({
    where: { id: projectId },
    data: {
      indexingStatus: "COMPLETED",
      indexingProgress: upsertPaths.length,
      indexingTotal: upsertPaths.length,
      syncState: null,
      indexingError: null,
      indexedAt: new Date(),
    },
  });

  console.log(`[runIncrementalRepoSync] DONE project=${projectId}`);
  return { status: "COMPLETED" };
}
