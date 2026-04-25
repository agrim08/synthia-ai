"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import useProject from "@/hooks/useProject";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";

// Muted, professional single-tone colors — no gradients
const PROJECT_COLORS = [
  { bg: "bg-indigo-50",   text: "text-indigo-700" },
  { bg: "bg-indigo-100",  text: "text-indigo-700" },
  { bg: "bg-sky-50",      text: "text-sky-700" },
  { bg: "bg-blue-50",    text: "text-blue-700" },
  { bg: "bg-rose-50",     text: "text-rose-700" },
  { bg: "bg-violet-50",   text: "text-violet-700" },
];

function getProjectColor(name: string) {
  const idx = name.charCodeAt(0) % PROJECT_COLORS.length;
  return PROJECT_COLORS[idx];
}

function ProjectAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const color = getProjectColor(name);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md font-semibold tracking-tight select-none",
        color.bg,
        color.text,
        size === "md" ? "size-7 text-[11px]" : "size-6 text-[10px]"
      )}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export const AppSidebar = () => {
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-100 bg-white"
    >
      {/* Header */}
      <SidebarHeader
        className={cn(
          "h-14 border-b border-slate-100",
          open ? "px-4" : "items-center justify-center px-0"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 mt-3 h-full",
            !open && "justify-center"
          )}
        >
          <Logo width={32} height={32} />
          {open && (
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">
              Synthia
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className={cn("py-4", open ? "px-3" : "px-2")}>
        <SidebarGroup>
          {/* Section label */}
          {open && (
            <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Projects
            </p>
          )}

          <div className={cn("space-y-0.5", !open && "flex flex-col items-center gap-1")}>
            {projects?.map((project) => {
              const isActive = project.id === projectId;

              return (
                <button
                  key={project.id}
                  onClick={() => setProjectId(project.id)}
                  title={project.name}
                  className={cn(
                    "group flex w-full items-center rounded-md transition-colors duration-150",
                    open
                      ? "gap-2.5 px-2 py-1.5"
                      : "size-9 justify-center",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold ring-1 ring-indigo-100/50"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 h-4 w-1 rounded-r-full bg-indigo-600" />
                  )}
                  <ProjectAvatar name={project.name} size="md" />

                  {open && (
                    <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
                      <span
                        className={cn(
                          "w-full truncate text-[13px] font-medium leading-tight",
                          isActive ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                        )}
                      >
                        {project.name}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter
        className={cn(
          "border-t border-slate-100 p-3",
          !open && "flex items-center justify-center"
        )}
      >
        <CreateProjectDialog>
          <Button
            variant="ghost"
            className={cn(
              "h-8 w-full rounded-md border border-indigo-400 bg-white text-slate-600 text-[13px] font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors",
              !open && "size-8 p-0"
            )}
            size={!open ? "icon" : "default"}
          >
            {open ? (
              <div className="flex items-center gap-1.5">
                <Plus className="size-3.5" />
                <span>New Project</span>
              </div>
            ) : (
              <Plus className="size-4 text-indigo-700 font-semibold" />
            )}
          </Button>
        </CreateProjectDialog>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};