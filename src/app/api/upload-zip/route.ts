/**
 * POST /api/upload-zip
 *
 * Accepts a multipart/form-data upload containing:
 *   - file:             the ZIP archive (max 4.5 MB — Vercel Hobby limit)
 *   - projectId:        the project ID created by createZipProject tRPC mutation
 *
 * Security: validates x-internal-secret header so only our server can call it.
 * After upload, runs indexZipRepo in the background via Next.js 15 after().
 */

import { type NextRequest, NextResponse, unstable_after as after } from "next/server";
import { indexZipRepo, countZipFiles } from "@/lib/githubRepoLoader";
import { db } from "@/server/db";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "ownyourcode-internal";
const MAX_ZIP_BYTES = 4 * 1024 * 1024; // 4 MB hard limit (Vercel body is 4.5 MB)

export const maxDuration = 60;

/**
 * Cleanup and refund helper on failure/abortion.
 */
async function rollbackProject(projectId: string) {
  try {
    console.log(`[/api/upload-zip] Initiating rollback for project=${projectId}`);

    // Fetch project's indexingTotal and the user linked to it
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { indexingTotal: true },
    });

    const userLink = await db.userToProject.findFirst({
      where: { projectId },
      select: { userId: true },
    });

    if (project && userLink) {
      const fileCount = project.indexingTotal ?? 0;

      // Refund credits
      await db.user.update({
        where: { id: userLink.userId },
        data: { credits: { increment: fileCount } },
      });
      console.log(`[/api/upload-zip] Refunded ${fileCount} credits to user=${userLink.userId}`);

      // Cascade delete relations and the project itself
      await db.$transaction([
        db.userToProject.deleteMany({ where: { projectId } }),
        db.project.delete({ where: { id: projectId } }),
      ]);
      console.log(`[/api/upload-zip] Deleted failed project=${projectId}`);
    } else {
      console.log(`[/api/upload-zip] Rollback: project or user link not found for project=${projectId}`);
    }
  } catch (err) {
    console.error(`[/api/upload-zip] Rollback failed for project=${projectId}:`, err);
  }
}

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

  try {
    if (file.size > MAX_ZIP_BYTES) {
      await rollbackProject(projectId);
      return NextResponse.json(
        { error: `File too large. Maximum is 4 MB (received ${(file.size / 1024 / 1024).toFixed(1)} MB).` },
        { status: 413 },
      );
    }

    if (!file.name.endsWith(".zip")) {
      await rollbackProject(projectId);
      return NextResponse.json({ error: "Only .zip files are supported." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const zipBuffer = Buffer.from(arrayBuffer);

    // Validate the ZIP archive structure before responding 200 OK
    try {
      countZipFiles(zipBuffer);
    } catch (zipErr: any) {
      console.error(`[/api/upload-zip] ZIP validation failed:`, zipErr);
      await rollbackProject(projectId);
      return NextResponse.json({ error: "Invalid ZIP file. Could not read entries." }, { status: 400 });
    }

    // Mark project as INDEXING immediately
    await (db.project as any).update({
      where: { id: projectId },
      data: { indexingStatus: "INDEXING", indexingError: null },
    });

    console.log(`[/api/upload-zip] Received ${(zipBuffer.length / 1024).toFixed(0)} KB. Scheduling background indexing for project=${projectId}`);

    // Schedule background indexing
    after(async () => {
      try {
        await indexZipRepo(projectId, zipBuffer);
        console.log(`[/api/upload-zip] Background indexing completed for project=${projectId}`);
      } catch (err: any) {
        console.error(`[/api/upload-zip] Background indexing failed for project=${projectId}:`, err);
      }
    });

    // Return instant success so the modal closes and user is redirected immediately
    return NextResponse.json({ success: true, status: "INDEXING" });
  } catch (err: any) {
    console.error(`[/api/upload-zip] Request execution failed:`, err);
    await rollbackProject(projectId);
    return NextResponse.json({ error: err?.message ?? "Upload processing failed" }, { status: 500 });
  }
}
