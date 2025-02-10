// import { db } from "@/server/db";

// type Response = {
//   commitMessage: string;
//   commitHash: string;
//   commitAuthorName: string;
//   commitAuthorAvatar: string;
//   commitDate: string;
// };

// export const fetchProjectGithubUrl = async (projectId: string) => {
//   const project = await db.project.findUnique({
//     where: { id: projectId },
//     select: { githubUrl: true },
//   });

//   if (!project?.githubUrl) {
//     throw new Error("Project does not have a GitHub URL");
//   }
//   return { project, githubUrl: project.githubUrl };
// };

// export const filterUnprocessedCommits = async (
//   projectId: string,
//   commitHashes: Response[],
// ) => {
//   const processedCommits = await db.gitCommit.findMany({
//     where: {
//       projectId,
//     },
//   });
//   const unprocesedCommits = commitHashes.filter(
//     (commit) =>
//       !processedCommits.some(
//         (processedCommit) => processedCommit.commitHash === commit.commitHash,
//       ),
//   );
//   return unprocesedCommits;
// };
