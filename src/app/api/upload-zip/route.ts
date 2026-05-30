/**
 * POST /api/upload-zip
 *
 * Accepts a multipart/form-data upload containing:
 *   - file:             the ZIP archive (max 4.5 MB — Vercel Hobby limit)
 *   - projectId:        the project ID created by createZipProject tRPC mutation
 *
 * Security: validates x-internal-secret header so only our server can call it.
 * After upload, runs indexZipRepo in the background (same pipeline as GitHub).
 */

import { type NextRequest, NextResponse } from "next/server";
import { indexZipRepo, countZipFiles } from "@/lib/githubRepoLoader";
import { db } from "@/server/db";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "ownyourcode-internal";
const MAX_ZIP_BYTES = 4 * 1024 * 1024; // 4 MB hard limit (Vercel body is 4.5 MB)

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret");
  if (secret !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file || !projectId) {
    return NextResponse.json({ error: "file and projectId are required" }, { status: 400 });
  }

  if (file.size > MAX_ZIP_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum is 4 MB (received ${(file.size / 1024 / 1024).toFixed(1)} MB).` },
      { status: 413 },
    );
  }

  if (!file.name.endsWith(".zip")) {
    return NextResponse.json({ error: "Only .zip files are supported." }, { status: 400 });
  }

  // Mark project as INDEXING immediately
  await (db.project as any).update({
    where: { id: projectId },
    data: { indexingStatus: "INDEXING", indexingError: null },
  });

  const arrayBuffer = await file.arrayBuffer();
  const zipBuffer = Buffer.from(arrayBuffer);

  console.log(`[/api/upload-zip] Received ${(zipBuffer.length / 1024).toFixed(0)} KB for project=${projectId}`);

  try {
    await indexZipRepo(projectId, zipBuffer);
  } catch (err: any) {
    console.error(`[/api/upload-zip] indexZipRepo failed:`, err);
    return NextResponse.json({ error: err?.message ?? "Indexing failed" }, { status: 500 });
  }

  const updated = await (db.project as any).findUnique({
    where: { id: projectId },
    select: { indexingStatus: true },
  });

  console.log(`[/api/upload-zip] Done for project=${projectId}, status=${updated?.indexingStatus}`);
  return NextResponse.json({ success: true, status: updated?.indexingStatus });
}
