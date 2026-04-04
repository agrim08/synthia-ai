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

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "synthia-internal";

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

    // 2. Poll commits (summaries can take a few seconds)
    await pollCommits(projectId).catch(err => {
      console.warn(`[/api/index-project] pollCommits error (non-fatal):`, err);
    });

    // 3. Index the repo (slow – AI calls per file)
    await indexGithubRepo(projectId, githubUrl, githubToken);

    console.log(
      `[/api/index-project] Completed background indexing for project=${projectId}`,
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(
      `[/api/index-project] Fatal error for project=${projectId}:`,
      err,
    );
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
