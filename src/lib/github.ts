import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githuburl = "https://github.com/agrim08/synthia-ai";

type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const gitCommitHash = async (githuburl: string): Promise<Response[]> => {
  const { data } = await octokit.rest.repos.listCommits({
    owner: "agrim08",
    repo: "synthia-ai",
  });
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 15).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit?.commit?.message ?? "",
    commitAuthorName: (commit?.commit?.author?.name as string) ?? "",
    commitAuthorAvatar: commit.author.avatar_url as string,
    commitDate: commit.commit.author.date ?? "",
  }));
};

console.log(await gitCommitHash(githuburl));
