"use client";

import useProject from "@/hooks/useProject";
import {
  Github,
  MoreHorizontal,
  Settings,
  FolderArchive,
  Activity,
  GitBranch,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLogs from "./CommitLogs";
import AskOwnYourCodeHero from "./AskOwnYourCodeHero";
import AudioUploadBtn from "./AudioUploadBtn";
import ArchiveProject from "./ArchiveProject";
import InviteTeam from "./InviteTeam";
import TeamMembers from "./TeamMembers";
import IndexingStatusBanner from "@/components/IndexingStatusBanner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DashboardSkeleton from "./DashboardSkeleton";

const DashboardPage = () => {
  const { project, isLoading } = useProject();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="relative min-h-screen bg-cream text-ink">
      {/* Decorative ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-coral-soft/40 blur-3xl animate-blob" />
        <div
          className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-sky/30 blur-3xl animate-blob"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-butter/40 blur-3xl animate-blob"
          style={{ animationDelay: "6s" }}
        />
      </div>

      {/* 1. Sticky Context Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-cream/75 border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft/70 font-medium">
                Repository
              </p>
              {project ? (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  className="text-sm font-semibold truncate underline-grow"
                >
                  {project.githubUrl.split("/").pop()}
                </Link>
              ) : (
                <span className="text-sm text-ink-soft">No project selected</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              {/* <AudioUploadBtn /> */}
              <InviteTeam />
            </div>
            <TeamMembers />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:text-ink hover:bg-stone-100 transition-all hover:rotate-90 duration-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-cream border-ink/10 rounded-xl shadow-md w-52 mt-5"
              >
                <DropdownMenuItem className="rounded-lg cursor-pointer hover:text-black/80">
                  <Settings className="mr-2 h-4 w-4" />
                  Project Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    document.getElementById("archive-trigger")?.click();
                  }}
                  className="rounded-lg cursor-pointer text-coral focus:text-coral focus:bg-coral-soft/30"
                >
                  <FolderArchive className="mr-2 h-4 w-4" />
                  Archive Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden">
              <ArchiveProject />
            </div>
          </div>
        </div>
      </div>

      {/* Indexing status banner */}
      {project?.id && <IndexingStatusBanner projectId={project.id} />}

      <div className="relative mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Hero (kept commented as in original) */}
        {/* <AskOwnYourCodeHero /> */}

        {/* Activity Timeline */}
        <section className="animate-fade-up">
          <div className="flex items-end justify-between mb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-soft/70 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse-soft" />
                Live activity
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-ink leading-[1.05]">
                Commits <span className="marker-highlight">history</span>
              </h2>
              <p className="text-ink-soft text-sm max-w-md">
                Skim what changed without opening the diff.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-ink-soft bg-white/60 backdrop-blur border border-ink/10 rounded-full px-3 py-1.5 shadow-soft">
              <GitBranch className="h-3.5 w-3.5" />
              main
            </div>
          </div>

          <div className="relative rounded-3xl border border-ink/10 bg-white/70 backdrop-blur-sm shadow-soft p-6 md:p-8 hover-lift transition-all">
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 bg-ink text-cream text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-pop-sm">
              <Activity className="h-3 w-3" />
              Timeline
            </div>
            <CommitLogs />
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
