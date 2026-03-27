"use client";

import { UserButton } from "@clerk/nextjs";
import useProject from "@/hooks/useProject";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Zap, LayoutDashboard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const { project } = useProject();

  return (
    <header className="flex h-20 items-center justify-between px-8 border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-6">
        {/* Modern Sidebar Toggle Re-enabled */}
        <div className="group -ml-4">
           <SidebarTrigger className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 shadow-sm transition-all hover:bg-indigo-700 hover:text-white hover:border-indigo-700 group-active:scale-95" />
        </div>

        <div className="h-6 w-px bg-slate-100 mx-1" />

        {/* Dynamic Breadcrumbs for Context */}
        <div className="flex items-center gap-2.5">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                Project Name
              </span>
              <span className="text-sm font-black text-slate-900 truncate max-w-[180px] tracking-tight">
                {project?.name || ""}
              </span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Modern Utility Search */}
        <div className="hidden items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 h-11 text-slate-400 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 group md:flex cursor-pointer hover:border-slate-200">
          <Search className="size-4 group-hover:text-indigo-700 transition-colors" />
          <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors">Search conversations...</span>
          <div className="ml-auto flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
             <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-sans text-[10px] font-bold text-slate-400">
               <span className="text-xs">⌘</span>K
             </kbd>
          </div>
        </div>
        
        {/* Notifications & Action Bar */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-100">

           <div className="px-2">
             <UserButton
               appearance={{
                 elements: {
                   userButtonAvatarBox: "size-10 rounded-2xl ring-4 ring-indigo-50 transition-all hover:ring-indigo-100 shadow-sm",
                   userButtonPopoverCard: "rounded-3xl border-none shadow-3xl",
                   userButtonPopoverActionButton: "hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all",
                 },
               }}
             />
           </div>
        </div>
      </div>
    </header>
  );
}
