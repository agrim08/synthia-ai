/**
 * This module handles the process of loading a GitHub repository's source code,
 * generating embeddings from code summaries, and storing the processed data in a database.
 *
 * The flow of the code is as follows:
 *
 * 1. Loading Repository Content:
 *    - `loadGithubRepo`: Uses the `GithubRepoLoader` to fetch the contents of a GitHub repository.
 *      It supports recursive loading, excludes certain files (e.g., lock files, package manifests),
 *      and allows specifying a branch and concurrency settings.
 *
 * 2. Generating and Indexing Embeddings:
 *    - `indexGithubRepo`: Orchestrates the process by first calling `loadGithubRepo` to obtain the documents.
 *      It then processes each document to generate embeddings and summaries via the `generateEmbeddings` function.
 *      Each embedding, along with its summary, source code, and file metadata, is stored in the database.
 *      A raw SQL query is used to update the vector field for embeddings since Prisma doesn't natively support vector types.
 *
 * 3. Processing Documents for Embeddings:
 *    - `generateEmbeddings`: For each document, this function generates a summary using `summariseCode`
 *      and then computes an embedding with `loadEmbedding`. It returns an object containing the summary,
 *      embedding, source code, and file name for further processing.
 */

import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { loadEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";
import Bottleneck from "bottleneck";

// Create a limiter for GitHub API requests
const githubLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 300, // Adjust based on your rate limit
});

const getFileCount = async (
  path: string,
  ocktokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  acc: number = 0,
): Promise<number> => {
  // Use the limiter to schedule the API call
  const { data } = await githubLimiter.schedule(() =>
    ocktokit.rest.repos.getContent({
      owner: githubOwner,
      repo: githubRepo,
      path,
    }),
  );

  // Base case: it's a file
  if (!Array.isArray(data) && data.type === "file") {
    return acc + 1;
  }

  // It's a directory
  if (Array.isArray(data)) {
    let fileCount = 0;
    const directories: string[] = [];
    for (const item of data) {
      if (item.type === "dir") {
        directories.push(item.path);
      }
      fileCount++;
    }
    if (directories.length > 0) {
      const dirCounts = await Promise.all(
        directories.map((dirPath) =>
          getFileCount(dirPath, ocktokit, githubOwner, githubRepo, 0),
        ),
      );
      fileCount += dirCounts.reduce((sum, count) => sum + count, 0);
    }
    return acc + fileCount;
  }
  return acc;
};

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
  const ocktokit = new Octokit({ auth: githubToken });
  const githubOwner = githubUrl.split("/")[3];
  const githubRepo = githubUrl.split("/")[4];

  if (!githubOwner || !githubRepo) return 0;

  const fileCount = await getFileCount(
    "",
    ocktokit,
    githubOwner,
    githubRepo,
    0,
  );
  return fileCount;
};

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package.json",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5, // Defaults to 2
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      // console.log(`processing ${index} of ${allEmbeddings.length}`);
      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbeddings.create({
        data: {
          summary: embedding.summary || "",
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      //we need to write raw sql query as prisma does not provide for vector
      await db.$executeRaw`
      UPDATE "SourceCodeEmbeddings"
      SET "summaryEmbeddings" = ${embedding.embedding} :: vector
      WHERE "id" = ${sourceCodeEmbedding.id}
    `;
    }),
  );
};

const limiter = new Bottleneck({
  maxConcurrent: 1, // Only one concurrent call at a time
  minTime: 200, // Wait at least 200ms between calls (adjust as needed)
});

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      // Throttle calls to summariseCode and loadEmbedding
      const summary = await limiter.schedule(() => summariseCode(doc));
      const embedding = await limiter.schedule(() =>
        loadEmbedding(summary || ""),
      );
      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
};

// console.log(await loadGithubRepo("https://github.com/agrim08/Food-Mania"));
