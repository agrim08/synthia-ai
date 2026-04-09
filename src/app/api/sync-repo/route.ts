/**
 * POST /api/sync-repo — incremental embedding sync (compare commits + patch vectors).
 * Internal secret header; same deployment pattern as /api/index-project.
 */

import { type NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import { runIncrementalRepoSync } from "@/lib/githubSync";
import {
  getDefaultBranchHeadSha,
  parseGithubRepoUrl,
} from "@/lib/githubRepoLoader";
import { db } from "@/server/db";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "synthia-internal";

export const maxDuration = 60;

function chainNextChunk(
  req: NextRequest,
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) {
  void fetch(`${req.nextUrl.origin}/api/sync-repo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
    },
    body: JSON.stringify({ projectId, githubUrl, githubToken }),
  }).catch((e) => console.error("[sync-repo] self-trigger failed", e));
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret");
  if (secret !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { projectId: string; githubUrl: string; githubToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId, githubUrl, githubToken } = body;
  if (!projectId || !githubUrl) {
    return NextResponse.json(
      { error: "projectId and githubUrl are required" },
      { status: 400 },
    );
  }

  const project = (await db.project.findUnique({
    where: { id: projectId },
  })) as any;

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (project.indexingStatus === "PENDING" || project.indexingStatus === "INDEXING") {
    return NextResponse.json({ skipped: "initial_indexing" });
  }

  // Initial full index paused (PARTIAL) — must resume via /api/index-project, not sync.
  if (
    !project.lastIndexedCommitSha &&
    project.indexingStatus === "PARTIAL" &&
    project.syncState == null
  ) {
    return NextResponse.json({ skipped: "initial_partial" });
  }

  const parsed = parseGithubRepoUrl(githubUrl);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
  }

  const octokit = new Octokit({
    auth: githubToken ?? process.env.GITHUB_TOKEN,
  });

  let headSha: string;
  try {
    const r = await getDefaultBranchHeadSha(octokit, parsed.owner, parsed.repo);
    headSha = r.sha;
  } catch (e) {
    console.error("[sync-repo] resolve HEAD failed", e);
    return NextResponse.json({ error: "GitHub unreachable" }, { status: 502 });
  }

  // Cold restart left SYNCING — continue or clear.
  if (project.indexingStatus === "SYNCING") {
    if (project.syncState) {
      const result = await runIncrementalRepoSync(
        projectId,
        githubUrl,
        githubToken,
      );
      if (result.status === "PARTIAL") {
        chainNextChunk(req, projectId, githubUrl, githubToken);
      }
      return NextResponse.json({ ok: true, status: result.status });
    }
    await db.project.update({
      where: { id: projectId },
      data: {
        indexingStatus: "COMPLETED",
        indexingError: null,
      },
    });
    return NextResponse.json({ ok: true, recovered: "cleared_stale_syncing" });
  }

  const needsBaseline = !project.lastIndexedCommitSha;
  const ahead =
    needsBaseline ||
    project.lastIndexedCommitSha !== headSha ||
    project.syncState != null;

  if (!ahead) {
    return NextResponse.json({ skipped: "up_to_date" });
  }

  let claimed = false;

  if (needsBaseline) {
    const result = await runIncrementalRepoSync(
      projectId,
      githubUrl,
      githubToken,
    );
    if (result.status === "PARTIAL") {
      chainNextChunk(req, projectId, githubUrl, githubToken);
    }
    return NextResponse.json({ ok: true, status: result.status });
  }

  if (project.indexingStatus === "COMPLETED") {
    const r = await db.project.updateMany({
      where: { id: projectId, indexingStatus: "COMPLETED" },
      data: { indexingStatus: "SYNCING", indexingError: null },
    });
    claimed = r.count > 0;
  } else if (project.indexingStatus === "PARTIAL" && project.syncState != null) {
    const r = await db.project.updateMany({
      where: { id: projectId, indexingStatus: "PARTIAL" },
      data: { indexingStatus: "SYNCING", indexingError: null },
    });
    claimed = r.count > 0;
  }

  if (!claimed) {
    return NextResponse.json({ skipped: "already_running" });
  }

  const result = await runIncrementalRepoSync(
    projectId,
    githubUrl,
    githubToken,
  );

  if (result.status === "PARTIAL") {
    chainNextChunk(req, projectId, githubUrl, githubToken);
  }

  return NextResponse.json({ ok: true, status: result.status });
}
