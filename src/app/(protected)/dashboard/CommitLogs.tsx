import useProject from "@/hooks/useProject";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

const CommitLogs = () => {
  const { projectId, project } = useProject();
  const { data: commits } = api.project.getCommits.useQuery({
    projectId: projectId,
  });
  return (
    <>
      <ul className="space-y-6">
        {commits?.map((commit, commitIdx) => {
          return (
            <li key={commitIdx} className="relative flex gap-x-4">
              <div
                className={cn(
                  commitIdx === commits.length - 1 ? "h-6" : "bottom-6",
                  "absolute left-0 top-0 flex w-6 justify-center",
                )}
              >
                <div className="w-px translate-x-1 bg-gray-700"></div>
              </div>
              <>
                <img
                  src={commit.commitAuthorAvatar}
                  alt="commit avatar"
                  className="relative mt-4 size-8 flex-none rounded-full"
                />
                <div className="flex-auto rounded-md bg-black p-3 ring ring-inset ring-gray-700">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      href={`${project?.githubUrl}/commits/${commit?.commitHash}`}
                      target="_blank"
                      className="flex py-0.5 text-xs leading-5 text-gray-400"
                    >
                      <span className="font-medium text-gray-100">
                        {commit.commitAuthorName}
                      </span>
                      <div className="w-2"></div>
                      <span className="inline-flex items-center">
                        commited
                        <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                  </div>
                  <span className="font-bold">
                    {commit.commitMessage.charAt(0).toUpperCase() +
                      commit.commitMessage.slice(1)}
                  </span>
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-200">
                    {commit.commitSummary}
                  </pre>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CommitLogs;
