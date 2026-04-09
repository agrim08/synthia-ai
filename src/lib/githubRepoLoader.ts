/**
 * githubRepoLoader.ts
 *
 * Handles loading a GitHub repository, generating embeddings, and storing them.
 * Supports:
 * - Comprehensive file filtering (ignores build artefacts, lockfiles, media, etc.)
 * - Exponential backoff when hitting Gemini rate limits (429)
 * - Checkpoint / resume: skips files already indexed for this project
 * - Progress tracking in DB so the UI can show a live progress bar
 */

import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { loadEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";
import Bottleneck from "bottleneck";

// ---------------------------------------------------------------------------
// File-extension / filename filter
// ---------------------------------------------------------------------------

/**
 * Extensions we never want to embed – these add noise with zero semantic value
 * and burn API quota fast.
 */
const IGNORED_EXTENSIONS = new Set([
  // Lockfiles / package managers
  ".lock",
  ".lockb",
  // Compiled / binary output
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".wasm",
  ".pyc",
  ".pyo",
  // Images & media
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".webp",
  ".bmp",
  ".tiff",
  ".mp4",
  ".mp3",
  ".wav",
  ".ogg",
  ".avi",
  ".mov",
  ".webm",
  // Fonts
  ".ttf",
  ".otf",
  ".woff",
  ".woff2",
  ".eot",
  // Archives
  ".zip",
  ".tar",
  ".gz",
  ".rar",
  ".7z",
  // Documents
  ".pdf",
  ".docx",
  ".xlsx",
  ".pptx",
  // Certificates / keys
  ".pem",
  ".key",
  ".crt",
  ".p12",
  // Database dumps / migrations that are just data
  ".sql",
  // Source maps
  ".map",
  // Minified output
  ".min.js",
  ".min.css",
]);

/**
 * Exact filenames (case-sensitive) that are always irrelevant.
 */
const IGNORED_FILENAMES = new Set([
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "composer.lock",
  "Gemfile.lock",
  "Cargo.lock",
  "postcss.config.js",
  "postcss.config.mjs",
  "tsconfig.json",
  "tsconfig.node.json",
  ".env",
  ".env.local",
  ".env.example",
  ".env.development",
  ".env.production",
  ".gitignore",
  ".gitattributes",
  ".eslintignore",
  ".prettierignore",
  ".dockerignore",
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  ".editorconfig",
  "CHANGELOG.md",
  "LICENCE",
  "LICENSE",
  "LICENSE.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  ".nvmrc",
  ".node-version",
]);

/**
 * Directory segments that are always noise when found anywhere in the path.
 */
const IGNORED_PATH_SEGMENTS = new Set([
  "node_modules",
  ".git",
  ".github",
  "dist",
  "build",
  "out",
  ".next",
  ".nuxt",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  "coverage",
  ".nyc_output",
  "vendor",
  "venv",
  ".venv",
  "env",
  "target", // Rust / Java build output
  ".turbo",
  ".vercel",
  ".cache",
  "tmp",
  "temp",
  ".idea",
  ".vscode",
  ".DS_Store",
  "storybook-static",
  "public/static", // pre-built static assets
]);

const UI_BOILERPLATE_PATTERN = /\b(card|button|charts|sidebar|footer|header|sheet|input)\b/i;

export function shouldIgnoreFile(filePath: string, skipUi = false): boolean {
  const lower = filePath.toLowerCase();
  const segments = lower.replace(/\\/g, "/").split("/");

  // 1. Check folder segments
  for (const seg of segments) {
    if (IGNORED_PATH_SEGMENTS.has(seg)) return true;
    if (skipUi && seg === "ui") return true; // Skip 'ui' folders
  }

  // 2. Check UI boilerplate names in JSX/TSX
  if (skipUi && (lower.endsWith(".jsx") || lower.endsWith(".tsx"))) {
    const filename = segments[segments.length - 1] ?? "";
    if (UI_BOILERPLATE_PATTERN.test(filename)) return true;
  }

  // 3. Check exact filename
  const filename = segments[segments.length - 1] ?? "";
  if (IGNORED_FILENAMES.has(filename)) return true;

  // 4. Check extension(s) – handle double extensions like ".min.js"
  const dotParts = filename.split(".");
  if (dotParts.length >= 3) {
    // e.g. "foo.min.js" → check ".min.js"
    const doubleExt = `.${dotParts.slice(-2).join(".")}`;
    if (IGNORED_EXTENSIONS.has(doubleExt)) return true;
  }
  if (dotParts.length >= 2) {
    const ext = `.${dotParts[dotParts.length - 1]}`;
    if (IGNORED_EXTENSIONS.has(ext)) return true;
  }

  return false;
}

/** Max source code characters we send to the AI per file (keeps tokens sane) */
const MAX_CODE_CHARS = 8_000;

/** After this many chars of source we skip embedding entirely (file too large to summarise meaningfully) */
const SKIP_EMBEDDING_ABOVE_CHARS = 80_000;


// ---------------------------------------------------------------------------
// Rate-limit-aware Gemini caller with exponential backoff
// ---------------------------------------------------------------------------

const MAX_RETRIES = 6;
const BASE_DELAY_MS = 5_000; // 5 s initial wait on 429

async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  label: string,
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      const is429 =
        err?.status === 429 ||
        (err?.message ?? "").includes("429") ||
        (err?.message ?? "").toLowerCase().includes("quota");

      if (is429 && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[rateLimitRetry] 429 on "${label}" — waiting ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`,
        );
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
        continue;
      }
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// GitHub file-count helper (used for credit calc)
// ---------------------------------------------------------------------------

const githubLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 300 });

const getFileCount = async (
  path: string,
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  acc: number = 0,
  skipUi = false,
): Promise<number> => {
  const response = await githubLimiter.schedule(() =>
    octokit.rest.repos.getContent({
      owner: githubOwner,
      repo: githubRepo,
      path,
    }),
  );
  const data = response.data as any;

  if (!Array.isArray(data) && data.type === "file") return acc + 1;

  if (Array.isArray(data)) {
    let fileCount = 0;
    const directories: string[] = [];
    for (const item of data) {
      if (item.type === "dir") directories.push(item.path);
      // Only count files we would actually embed (respect skipUi flag)
      if (item.type === "file" && !shouldIgnoreFile(item.path, skipUi)) fileCount++;
    }
    if (directories.length > 0) {
      const dirCounts = await Promise.all(
        directories.map((dirPath) =>
          getFileCount(dirPath, octokit, githubOwner, githubRepo, 0, skipUi),
        ),
      );
      fileCount += dirCounts.reduce((sum, count) => sum + count, 0);
    }
    return acc + fileCount;
  }
  return acc;
};

export const checkCredits = async (githubUrl: string, githubToken?: string, skipUi = false) => {
  const octokit = new Octokit({ auth: githubToken });
  const githubOwner = githubUrl.split("/")[3];
  const githubRepo = githubUrl.split("/")[4];
  if (!githubOwner || !githubRepo) return 0;
  return getFileCount("", octokit, githubOwner, githubRepo, 0, skipUi);
};


// ---------------------------------------------------------------------------
// Repo loader
// ---------------------------------------------------------------------------

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
  skipUi = false,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      // pass a coarse list; the shouldIgnoreFile fn handles the rest
      "package.json",
      "package-lock.json",
      "*.lock",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 3,
  });

  const allDocs = await loader.load();
  // Apply our fine-grained filter
  const filtered = allDocs.filter(
    (doc) => !shouldIgnoreFile(doc.metadata.source as string),
  );
  console.log(
    `[loadGithubRepo] Loaded ${allDocs.length} docs, kept ${filtered.length} after filtering`,
  );
  return filtered;
};

// ---------------------------------------------------------------------------
// Main indexing function  (checkpoint/resume aware)
// ---------------------------------------------------------------------------

/**
 * Single Bottleneck limiter used for ALL Gemini calls.
 * maxConcurrent=1 + minTime=2000ms ≈ 30 req/min – safely under free-tier limits.
 */
/** ~40 req/min target; override with GEMINI_MIN_INTERVAL_MS if needed */
const GEMINI_MIN_MS = Number(process.env.GEMINI_MIN_INTERVAL_MS) || 1_500;
const geminiLimiter = new Bottleneck({ maxConcurrent: 1, minTime: GEMINI_MIN_MS });

// ---------------------------------------------------------------------------
// GitHub URL + HEAD helpers (also used by incremental sync)
// ---------------------------------------------------------------------------

export function parseGithubRepoUrl(
  githubUrl: string,
): { owner: string; repo: string } | null {
  try {
    const normalized = githubUrl.trim().replace(/\.git$/i, "");
    const u = new URL(normalized.includes("://") ? normalized : `https://${normalized}`);
    const parts = u.pathname
      .replace(/^\/+/, "")
      .split("/")
      .filter(Boolean)
      .map((p) => p.replace(/\.git$/i, ""));
    if (parts.length < 2) return null;
    return { owner: parts[0]!, repo: parts[1]! };
  } catch {
    return null;
  }
}

export async function getDefaultBranchHeadSha(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<{ sha: string; branch: string }> {
  const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });
  const branch = repoInfo.default_branch;
  const { data: branchRef } = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch,
  });
  const sha = branchRef.commit.sha;
  if (!sha) throw new Error("Could not resolve default branch HEAD");
  return { sha, branch };
}

export async function persistProjectIndexedHeadSha(
  projectId: string,
  githubUrl: string,
  githubToken?: string,
): Promise<void> {
  const parsed = parseGithubRepoUrl(githubUrl);
  if (!parsed) {
    console.warn(`[persistProjectIndexedHeadSha] Bad URL: ${githubUrl}`);
    return;
  }
  const octokit = new Octokit({ auth: githubToken ?? process.env.GITHUB_TOKEN });
  const { sha } = await getDefaultBranchHeadSha(
    octokit,
    parsed.owner,
    parsed.repo,
  );
  await (db.project as any).update({
    where: { id: projectId },
    data: { lastIndexedCommitSha: sha },
  });
  console.log(
    `[persistProjectIndexedHeadSha] project=${projectId} → ${sha.slice(0, 7)}`,
  );
}

export type EmbedFileResult =
  | { kind: "embedded" }
  | { kind: "oversized" }
  | { kind: "rate_limited" }
  | { kind: "error"; message: string };

/**
 * Replace (or create) embeddings for a single file path. Used by full index and incremental sync.
 */
export async function embedOneSourceFile(
  projectId: string,
  fileName: string,
  code: string,
): Promise<EmbedFileResult> {
  await db.sourceCodeEmbeddings.deleteMany({ where: { projectId, fileName } });

  if (code.length > SKIP_EMBEDDING_ABOVE_CHARS) {
    console.warn(
      `[embedOneSourceFile] Skipping oversized file (${code.length} chars): ${fileName}`,
    );
    return { kind: "oversized" };
  }

  const truncatedCode = code.slice(0, MAX_CODE_CHARS);
  const meta = { source: fileName };

  try {
    const summary = await geminiLimiter.schedule(() =>
      withRateLimitRetry(
        () =>
          summariseCode(
            new Document({
              pageContent: truncatedCode,
              metadata: meta,
            }),
          ),
        `summariseCode:${fileName}`,
      ),
    );

    const embeddingValues = await geminiLimiter.schedule(() =>
      withRateLimitRetry(
        () => loadEmbedding(summary ?? ""),
        `loadEmbedding:${fileName}`,
      ),
    );

    const record = await db.sourceCodeEmbeddings.create({
      data: {
        summary: summary ?? "",
        sourceCode: JSON.parse(JSON.stringify(truncatedCode)),
        fileName,
        projectId,
      },
    });

    await db.$executeRawUnsafe(
      `UPDATE "SourceCodeEmbeddings" SET "summaryEmbeddings" = $1::vector WHERE "id" = $2`,
      `[${embeddingValues.join(",")}]`,
      record.id,
    );

    return { kind: "embedded" };
  } catch (err: any) {
    const is429 =
      err?.status === 429 ||
      (err?.message ?? "").includes("429") ||
      (err?.message ?? "").toLowerCase().includes("quota");

    if (is429) {
      console.error(
        `[embedOneSourceFile] Rate limit for ${fileName} — stopping`,
      );
      return { kind: "rate_limited" };
    }

    console.error(
      `[embedOneSourceFile] Non-fatal error on ${fileName}:`,
      err?.message ?? err,
    );
    return { kind: "error", message: String(err?.message ?? err) };
  }
}

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const startTime = Date.now();
  // Vercel Free Plan has a hard 60s limit (Pro has 300s). 
  // For safety, we exit the loop early if approaching the limit.
  const isProd = process.env.NODE_ENV === "production";
  const limitMs = isProd ? 50_000 : 280_000; // 50s for prod (leaving 10s margin), 280s for dev

  console.log(`[indexGithubRepo] START project=${projectId} (env=${process.env.NODE_ENV}, limit=${limitMs/1000}s)`);

  // Fetch flag from DB
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { skipUiComponents: true }
  });
  const skipUi = project?.skipUiComponents ?? false;

  try {
    const docs = await loadGithubRepo(githubUrl, githubToken, skipUi);

    // ---- Checkpoint: find files already embedded for this project ----
    const alreadyIndexed = await db.sourceCodeEmbeddings.findMany({
      where: { projectId },
      select: { fileName: true },
    });
    const alreadyIndexedSet = new Set(alreadyIndexed.map((r) => r.fileName));

    const pendingDocs = docs.filter(
      (doc) => !alreadyIndexedSet.has(doc.metadata.source as string),
    );

    const totalFiles = alreadyIndexed.length + pendingDocs.length;
    let processed = alreadyIndexed.length;

    console.log(
      `[indexGithubRepo] ${alreadyIndexed.length} already done, ${pendingDocs.length} pending, ${totalFiles} total`,
    );

    // Update totals
    await (db.project as any).update({
      where: { id: projectId },
      data: { indexingTotal: totalFiles, indexingProgress: processed },
    });

    if (pendingDocs.length === 0) {
      console.log(`[indexGithubRepo] Nothing new to index, marking COMPLETED`);
      await (db.project as any).update({
        where: { id: projectId },
        data: { indexingStatus: "COMPLETED", indexedAt: new Date() },
      });
      await persistProjectIndexedHeadSha(projectId, githubUrl, githubToken).catch(
        (e) => console.warn(`[indexGithubRepo] persist HEAD (no-op path):`, e),
      );
      return;
    }

    let hadRateLimitError = false;

    // Process sequentially via the limiter to respect rate limits
    for (const doc of pendingDocs) {
      const source = doc.metadata.source as string;
      const code = doc.pageContent;

      // ---- Timeboxed exit check ----
      if (Date.now() - startTime > limitMs) {
        console.warn(`[indexGithubRepo] Time limit reached (${limitMs/1000}s). Saving PARTIAL state for project=${projectId}`);
        await (db.project as any).update({
          where: { id: projectId },
          data: { 
            indexingStatus: "PARTIAL", 
            indexingProgress: processed,
            indexingTotal: totalFiles 
          },
        });
        return; // Exit loop and trigger re-poll from the caller if needed
      }

      const result = await embedOneSourceFile(projectId, source, code);
      if (result.kind === "rate_limited") {
        hadRateLimitError = true;
        console.error(
          `[indexGithubRepo] Rate limit for ${source} — stopping and saving checkpoint`,
        );
        await (db.project as any).update({
          where: { id: projectId },
          data: {
            indexingStatus: "PARTIAL",
            indexingProgress: processed,
            indexingError: `Rate limit hit after processing ${processed}/${totalFiles} files. Re-run to resume.`,
          },
        });
        return;
      }

      processed++;
      await (db.project as any).update({
        where: { id: projectId },
        data: { indexingProgress: processed },
      });

      if (result.kind === "embedded") {
        console.log(
          `[indexGithubRepo] [${processed}/${totalFiles}] Indexed: ${source}`,
        );
      }
    }

    // All done
    const finalStatus = hadRateLimitError ? "PARTIAL" : "COMPLETED";
    await (db.project as any).update({
      where: { id: projectId },
      data: {
        indexingStatus: finalStatus,
        indexingProgress: processed,
        indexedAt: new Date(),
        indexingError: hadRateLimitError
          ? "Some files were skipped due to rate limits. Re-run indexing to complete."
          : null,
      },
    });

    console.log(
      `[indexGithubRepo] DONE — status=${finalStatus}, processed=${processed}/${totalFiles}`,
    );

    if (finalStatus === "COMPLETED") {
      await persistProjectIndexedHeadSha(projectId, githubUrl, githubToken).catch(
        (e) => console.warn(`[indexGithubRepo] persist HEAD:`, e),
      );
    }
  } catch (err: any) {
    console.error(`[indexGithubRepo] Fatal error:`, err);
    await (db.project as any).update({
      where: { id: projectId },
      data: {
        indexingStatus: "FAILED",
        indexingError: err?.message ?? String(err),
      },
    });
    throw err;
  }
};
