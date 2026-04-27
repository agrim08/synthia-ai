/**
 * POST /api/poll-commits
 *
 * Background job to fetch and summarize latest commits from GitHub.
 * Triggered via QStash to ensure completion in serverless environments.
 *
 * Body: { projectId: string }
 */

import { type NextRequest, NextResponse } from "next/server";
import { pollCommits } from "@/lib/github";
import * as Sentry from "@sentry/nextjs";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "synthia-internal";

export const maxDuration = 60; // 60s for Hobby/Pro

export async function POST(req: NextRequest) {
  // Validate secret
  const secret = req.headers.get("x-internal-secret");
  if (secret !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { projectId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId } = body;
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  console.log(`[/api/poll-commits] Starting for project=${projectId}`);

  try {
    await pollCommits(projectId);
    console.log(`[/api/poll-commits] Successfully finished for project=${projectId}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(`[/api/poll-commits] Fatal error for project=${projectId}:`, err);
    Sentry.captureException(err, { extra: { projectId } });
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
