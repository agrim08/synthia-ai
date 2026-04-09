import useProject from "@/hooks/useProject";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink, GitCommit, Hash, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

const CommitLogs = () => {
  const { projectId, project } = useProject();
  const { data: commits } = api.project.getCommits.useQuery(
    { projectId: projectId },
    { enabled: !!projectId }
  );

  return (
    <div className="relative">
      <ul className="space-y-5">
        {commits?.map((commit, commitIdx) => {
          return (
            <li key={commitIdx} className="relative flex gap-x-5 group">
              {/* Modern Timeline Line */}
              {commitIdx !== commits.length - 1 && (
                <div className="absolute left-[18px] top-10 -bottom-8 w-0.5 bg-slate-100 rounded-full" />
              )}
              
              {/* Author Avatar Container */}
              <div className="relative flex h-9 w-9 flex-none items-center justify-center">
                <img
                  src={commit.commitAuthorAvatar}
                  alt="commit avatar"
                  className="relative h-9 w-9 rounded-xl border border-white bg-slate-100 shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-110 duration-300"
                />
                <div className="absolute -right-1 -bottom-1 rounded-lg bg-white border border-slate-100 p-0.5 shadow-sm ring-1 ring-slate-200">
                  <GitCommit className="size-2.5 text-indigo-600" />
                </div>
              </div>

              {/* Enhanced Content Card */}
              <div className="flex-auto rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm transition-all hover:bg-slate-50/50 hover:border-indigo-100 hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-900 tracking-tight">
                      {commit.commitAuthorName}
                    </span>
                    <div className="size-1 rounded-full bg-slate-300" />
                    <Link
                      href={`${project?.githubUrl}/commits/${commit?.commitHash}`}
                      target="_blank"
                      className="group/hash flex items-center gap-1 py-0.5 px-2 rounded-lg bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:bg-indigo-700 hover:text-white transition-all border border-slate-100"
                    >
                      <Hash className="size-2.5" />
                      <span className="font-mono">{commit.commitHash.slice(0, 7)}</span>
                    </Link>
                  </div>
                </div>

                <h3 className="text-[14px] font-bold text-slate-900 leading-snug tracking-tight group-hover:text-indigo-700 transition-colors">
                  {commit.commitMessage.charAt(0).toUpperCase() +
                    commit.commitMessage.slice(1)}
                </h3>
                
                {commit.commitSummary && (
                  <div className="mt-4 relative overflow-hidden rounded-xl bg-slate-50/50 p-4 border border-slate-100/60">
                    <div className="space-y-2">
                      {commit.commitSummary.split('*').filter(s => s.trim()).map((point, i) => (
                        <div key={i} className="flex gap-2 text-[12px] leading-relaxed text-slate-600 tracking-tight italic">
                          <span className="text-indigo-400 shrink-0 mt-1">•</span>
                          <p className="text-justify">{point.trim()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Empty State with Style */}
      {(!commits || commits.length === 0) && (
         <div className="flex flex-col items-center justify-center p-10 text-center opacity-40">
            <GitCommit className="size-10 text-slate-200 mb-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Link your first project</p>
         </div>
      )}
    </div>
  );
};

export default CommitLogs;
