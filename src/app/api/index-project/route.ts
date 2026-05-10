/**
 * POST /api/index-project
 *
 * Called server-side (fire-and-forget) after a project is created.
 * Runs indexGithubRepo in the background and updates project status in DB.
 *
 * Body: { projectId: string, githubUrl: string, githubToken?: string }
 *
 * Security: validates the secret header so only our own server can call this.
 */

import { type NextRequest, NextResponse } from "next/server";
import { indexGithubRepo } from "@/lib/githubRepoLoader";
import { pollCommits } from "@/lib/github";
import { db } from "@/server/db";
import { enqueueJob } from "@/lib/qstash";
import * as Sentry from "@sentry/nextjs";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "ownyourcode-internal";

export const maxDuration = 60; // 60 seconds max for Hobby plan (limit is 60s)

export async function POST(req: NextRequest) {
  // Validate secret to prevent external abuse
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

  console.log(
    `[/api/index-project] Received request for project=${projectId}`,
  );

  try {
    // 1. Immediately mark project as INDEXING so user sees progress
    await (db.project as any).update({
      where: { id: projectId },
      data: { indexingStatus: "INDEXING", indexingError: null },
    });

    // 2. Commit summaries run in parallel — fire-and-forget is OK here because
    //    pollCommits is called BEFORE indexGithubRepo, so the Lambda is still
    //    alive during the await below. Failures are non-fatal.
    pollCommits(projectId).catch((err) => {
      console.warn(`[/api/index-project] pollCommits error (non-fatal):`, err);
    });

    // 3. Index the repo (time-boxed: will exit at ~50s)
    await indexGithubRepo(projectId, githubUrl, githubToken);

    // 4. Check if we need to continue (self-invoke)
    const updatedProject = await (db.project as any).findUnique({
      where: { id: projectId },
      select: { indexingStatus: true }
    });

    if (updatedProject?.indexingStatus === "PARTIAL") {
      console.log(`[/api/index-project] PARTIAL limit reached for project=${projectId}, re-enqueuing via QStash...`);
      // Enqueue next chunk BEFORE returning the response (guaranteed delivery via QStash)
      await enqueueJob(
        `${req.nextUrl.origin}/api/index-project`,
        { projectId, githubUrl, githubToken },
        { retries: 3 },
      );
    }

    console.log(
      `[/api/index-project] Finished chunk for project=${projectId} (status=${updatedProject?.indexingStatus})`,
    );
    return NextResponse.json({ success: true, status: updatedProject?.indexingStatus });
  } catch (err: any) {
    console.error(
      `[/api/index-project] Fatal error for project=${projectId}:`,
      err,
    );
    Sentry.captureException(err, {
      extra: { projectId, githubUrl },
    });
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
