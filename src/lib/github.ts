/*
Flow:

fetchProjectGithubUrl:
-> Retrieve the project details along with its associated GitHub URL using the provided projectId.

gitCommitHash:
-> Parse the GitHub URL to extract the repository owner and name.
-> Use Octokit to fetch the list of recent commits from the repository.
-> Sort and return the latest 10 commits with relevant details (hash, message, author info, date).

filterUnprocessedCommits:
-> Compare fetched commits with those already processed in the database.
-> Filter out commits that have been previously processed to avoid duplicate work.

summarizeCommitFunc:
-> For each unprocessed commit:
a. Fetch the commit's diff using axios from the GitHub commit URL.
b. Pass the diff to the summarizeCommit function (from the Gemini module) to generate a summary.

Save to DB:
-> Map the commit summaries along with the commit details.
-> Use the database client to bulk-create records of these commits in the database.
*/

import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { summarizeCommit } from "./gemini";
import Bottleneck from "bottleneck";

const githubUrl = "https://github.com/agrim08/synthia-ai";

type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const gitCommitHash = async (githubUrl: string): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit?.commit?.message ?? "",
    commitAuthorName: (commit?.commit?.author?.name as string) ?? "",
    commitAuthorAvatar: commit.author.avatar_url as string,
    commitDate: commit.commit.author.date ?? "",
  }));
};

/**
 * Create a limiter for GitHub API calls.
 * Adjust the minTime (and maxConcurrent) as needed.
 */
const githubLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 200, // At least 200ms between GitHub requests
});

/**
 * Create a limiter for Gemini summarization calls.
 * Adjust the minTime (and maxConcurrent) as needed.
 */
const geminiLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 500, // At least 500ms between summarization calls
});

/**
 * Retrieves the diff for a commit from GitHub and passes it to the summarization service.
 * Each external call is scheduled on its own limiter.
 */
const summarizeCommitFunc = async (githubUrl: string, commitHash: string) => {
  // Throttle the GitHub diff request
  const { data } = await githubLimiter.schedule(() =>
    axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
      headers: { Accept: "application/vnd.github.v3.diff" },
    }),
  );

  // Throttle the summarization call
  return (await geminiLimiter.schedule(() => summarizeCommit(data))) || "";
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await gitCommitHash(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) =>
      // Directly call summarizeCommitFunc (which now handles its own throttling)
      summarizeCommitFunc(githubUrl, commit.commitHash),
    ),
  );

  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    } else {
      console.error(`Failed to summarize commit:`, response.reason);
      return "";
    }
  });

  const commits = await db.gitCommit.createMany({
    data: summaries.map((summary, index) => ({
      commitSummary: summary,
      projectId,
      commitHash: unprocessedCommits[index]?.commitHash ?? "",
      commitMessage: unprocessedCommits[index]?.commitMessage ?? "",
      commitAuthorName: unprocessedCommits[index]?.commitAuthorName ?? "",
      commitAuthorAvatar: unprocessedCommits[index]?.commitAuthorAvatar ?? "",
      commitDate: unprocessedCommits[index]?.commitDate ?? "",
    })),
  });

  return commits;
};

const fetchProjectGithubUrl = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });

  if (!project?.githubUrl) {
    throw new Error("Project does not have a GitHub URL");
  }
  return { project, githubUrl: project.githubUrl };
};

const filterUnprocessedCommits = async (
  projectId: string,
  commitHashes: Response[],
) => {
  const processedCommits = await db.gitCommit.findMany({
    where: { projectId },
  });
  return commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );
};
