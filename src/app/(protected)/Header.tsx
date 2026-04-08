"use client";

import { UserButton } from "@clerk/nextjs";
import useProject from "@/hooks/useProject";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Zap, LayoutDashboard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const { project } = useProject();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-3xl">
      <div className="mx-auto max-w-7xl px-8 flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="group -ml-2">
            <SidebarTrigger className="h-8 w-8 text-slate-400 transition-all hover:bg-slate-100/50 hover:text-slate-900 shadow-sm" />
          </div>

          <div className="h-6 w-px bg-slate-100" />

          <div className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Project
              </span>
              <span className="text-xs font-black text-slate-900 truncate max-w-[200px] tracking-tight">
                {project?.name || "No project selected"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden h-10 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 text-slate-400 transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-100/20 group md:flex cursor-pointer hover:border-indigo-100">
            <Search className="size-3 group-hover:text-indigo-600 transition-colors" />
            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900 transition-colors">Search...</span>
            <div className="ml-8 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-sans text-[10px] font-bold text-slate-400">
                <span className="text-[8px]">⌘</span>K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
            <UserButton
               appearance={{
                 elements: {
                   userButtonAvatarBox: "size-8 rounded-2xl ring-4 ring-slate-100 transition-all hover:ring-indigo-100 shadow-sm",
                   userButtonPopoverCard: "rounded-3xl border-none shadow-3xl",
                   userButtonPopoverActionButton: "hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all",
                 },
               }}
             />
          </div>
        </div>
      </div>
    </header>
  );
}
