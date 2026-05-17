import useProject from "@/hooks/useProject";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink, GitCommit, Hash, Sparkles, Inbox } from "lucide-react";
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
      <ul className="space-y-7">
        {commits?.map((commit, commitIdx) => {
          const isLast = commitIdx === commits.length - 1;
          return (
            <li
              key={commit.id ?? commit.commitHash}
              className="relative flex gap-5 animate-fade-up"
              style={{ animationDelay: `${Math.min(commitIdx * 70, 400)}ms` }}
            >
              {/* Timeline line */}
              {!isLast && (
                <span className="absolute left-[22px] top-12 bottom-[-28px] w-px bg-gradient-to-b from-ink/20 via-ink/10 to-transparent" />
              )}

              {/* Author Avatar */}
              <div className="relative shrink-0">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-coral to-coral-soft p-[2px] shadow-lg transition-transform duration-300 hover:scale-110 hover:-rotate-6">
                  <img
                    src={commit.commitAuthorAvatar}
                    alt={commit.commitAuthorName}
                    className="h-full w-full rounded-full object-cover ring-2 ring-cream"
                  />
                </div>
              </div>

              {/* Card */}
              <div className="flex-1 group relative rounded-2xl border border-ink/10 bg-white/80 backdrop-blur-sm p-5 hover-lift hover:border-ink/20 hover:shadow-lg transition-all">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
                  <span className="text-sm font-semibold text-ink">
                    {commit.commitAuthorName}
                  </span>
                  <span className="text-ink/20">·</span>
                  <Link
                    href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-md bg-ink/5 text-ink-soft hover:bg-ink hover:text-cream transition-colors"
                  >
                    <Hash className="h-3 w-3" />
                    {commit.commitHash.slice(0, 7)}
                    <ExternalLink className="h-2.5 w-2.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </div>

                <p className="text-ink font-medium leading-snug text-[15px]">
                  {commit.commitMessage.charAt(0).toUpperCase() +
                    commit.commitMessage.slice(1)}
                </p>

                {commit.commitSummary && (
                  <div className="mt-4 rounded-xl bg-gradient-to-br from-butter/30 via-cream-deep/40 to-coral-soft/20 border border-ink/5 p-4">
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-soft">
                      <Sparkles className="h-3 w-3 text-coral" />
                      AI summary
                    </div>
                    <ul className="space-y-1.5">
                      {commit.commitSummary
                        .split("*")
                        .filter((s) => s.trim())
                        .map((point, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-sm text-ink-soft leading-relaxed"
                          >
                            <span className="text-coral mt-1.5 h-1 w-1 rounded-full bg-coral shrink-0" />
                            <span>{point.trim()}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Empty state */}
      {(!commits || commits.length === 0) && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-ink/15 bg-white/50">
          <div className="h-14 w-14 rounded-2xl bg-ink text-cream grid place-items-center shadow-lg mb-4 animate-float">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="font-display text-2xl text-ink">No commits yet</h3>
          <p className="text-sm text-ink-soft mt-1 max-w-xs">
            Link your first project to see an AI-summarized timeline appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommitLogs;
