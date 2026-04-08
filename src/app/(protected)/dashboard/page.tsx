"use client";

import useProject from "@/hooks/useProject";
import { Github, MoreHorizontal, Settings, FolderArchive } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLogs from "./CommitLogs";
import AskSynthiaHero from "./AskSynthiaHero";
import AudioUploadBtn from "./AudioUploadBtn";
import ArchiveProject from "./ArchiveProject";
import InviteTeam from "./InviteTeam";
import TeamMembers from "./TeamMembers";
import IndexingStatusBanner from "./IndexingStatusBanner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardPage = () => {
  const { project } = useProject();
  
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* 1. Slim Sticky Context Bar (56px) */}
      <div className="sticky top-20 z-40 bg-[#f0f2f7]/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-3 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm transition-all hover:bg-indigo-700 hover:text-white">
            <Github className="size-4" />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={project?.githubUrl ?? ""}
              target="_blank"
              className="text-xs font-medium text-slate-400 hover:text-indigo-700 transition-colors truncate max-w-[150px]"
            >
              {project?.githubUrl?.split("/").pop() || "repository"}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-2">
            <TeamMembers />
            <AudioUploadBtn />
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <InviteTeam />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200">
                  <Settings className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 shadow-xl p-1">
                <DropdownMenuItem className="rounded-lg gap-2 text-slate-600 focus:text-indigo-700 focus:bg-indigo-50 cursor-pointer py-2">
                  <Settings className="size-4" />
                  <span className="font-semibold text-xs">Project Settings</span>
                </DropdownMenuItem>
                <div className="h-px bg-slate-100 my-1 mx-1" />
                <DropdownMenuItem 
                  className="rounded-lg gap-2 text-red-500 focus:text-red-700 focus:bg-red-50 cursor-pointer py-2"
                  onSelect={(e) => {
                    e.preventDefault();
                    document.getElementById('archive-trigger')?.click();
                  }}
                >
                  <FolderArchive className="size-4" />
                  <span className="font-semibold text-xs">Archive Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Hidden actual archive component to reuse its logic */}
            <div className="hidden">
               <ArchiveProject id="archive-trigger" />
            </div>
          </div>
        </div>
      </div>

      {/* Indexing status banner — polls until COMPLETED */}
      {project?.id && <IndexingStatusBanner projectId={project.id} />}

      <div className="w-full mx-auto px-6 py-8 space-y-6">
        {/* 2. Ask Synthia Hero */}
        {/* <AskSynthiaHero /> */}

        {/* 3. Activity Timeline */}
        <section className="space-y-8 pt-4">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Commits History</h2>
             </div>
          </div>
          <div className="max-w-full">
             <CommitLogs />
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
