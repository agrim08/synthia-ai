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
import { 
  Plus, 
  Home, 
  MessageSquare, 
  Video,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";

// Dark mode friendly project colors
const PROJECT_COLORS = [
  { bg: "bg-coral/20", text: "text-coral" },
  { bg: "bg-sky/20", text: "text-sky" },
  { bg: "bg-sage/20", text: "text-sage" },
  { bg: "bg-butter/20", text: "text-butter" },
  { bg: "bg-white/10", text: "text-cream" },
];

function getProjectColor(name: string) {
  const idx = name.charCodeAt(0) % PROJECT_COLORS.length;
  return PROJECT_COLORS[idx];
}

function ProjectAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const color = getProjectColor(name);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md font-semibold tracking-tight select-none",
        color.bg,
        color.text,
        size === "md" ? "size-6 text-[11px]" : "size-5 text-[10px]"
      )}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

const MAIN_NAV = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Q&A", url: "/qa", icon: MessageSquare },
  { title: "Meetings", url: "/meetings", icon: Video },
];

const BOTTOM_NAV = [
  { title: "Billing", url: "/billing", icon: CreditCard },
];

export const AppSidebar = () => {
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();
  const pathname = usePathname();

  const sortedProjects = projects
    ? [...projects].sort((a, b) => (a.id === projectId ? -1 : b.id === projectId ? 1 : 0))
    : [];

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-ink/10 bg-ink text-cream"
    >
      {/* Header */}
      <SidebarHeader
        className={cn(
          "h-14 border-b border-white/10",
          open ? "px-4" : "items-center justify-center px-0"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 h-full group",
            !open && "justify-center"
          )}
        >
          {/* Logo container */}
          <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-cream transition-colors group-hover:bg-white/20">
             <Logo width={18} height={18} />
          </div>
          {open && (
            <span className="text-sm font-semibold tracking-tight text-white">
              OwnYourCode
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className={cn("py-4", open ? "px-3" : "px-2")}>
        
        {/* Main Navigation */}
        <SidebarGroup>
          <div className={cn("space-y-0.5", !open && "flex flex-col items-center gap-1")}>
            {MAIN_NAV.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  title={item.title}
                  className={cn(
                    "flex items-center rounded-lg transition-all duration-150 group",
                    open ? "gap-3 px-3 py-2" : "size-10 justify-center",
                    isActive
                      ? "bg-white/10 text-white font-medium shadow-pop-sm"
                      : "text-cream/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("shrink-0", open ? "size-4" : "size-5")} />
                  {open && (
                    <span className="text-[13px] truncate">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </SidebarGroup>

        <div className="my-2 px-3">
          <div className="h-px w-full bg-white/10" />
        </div>

        {/* Projects Section */}
        <SidebarGroup>
          {open && (
            <div className="mb-2 flex items-center justify-between px-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-cream/40">
                Projects
              </p>
            </div>
          )}

          <div className={cn("space-y-0.5", !open && "flex flex-col items-center gap-1")}>
            {sortedProjects?.map((project) => {
              const isActive = project.id === projectId;

              return (
                <button
                  key={project.id}
                  onClick={() => setProjectId(project.id)}
                  title={project.name}
                  className={cn(
                    "group relative flex w-full items-center rounded-lg transition-all duration-150",
                    open
                      ? "gap-3 px-3 py-1.5"
                      : "size-10 justify-center",
                    isActive
                      ? "bg-white/5 text-white font-medium"
                      : "text-cream/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && !open && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-coral" />
                  )}
                  {isActive && open && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-1 rounded-r-full bg-coral" />
                  )}
                  
                  <ProjectAvatar name={project.name} size="md" />

                  {open && (
                    <div className="flex flex-1 items-center justify-between overflow-hidden text-left">
                      <span className="truncate text-[13px] leading-tight">
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
      <SidebarFooter className="border-t border-white/10 p-3">
        {/* Bottom Nav Links */}
        <div className={cn("mb-3 space-y-0.5", !open && "flex flex-col items-center gap-1")}>
          {BOTTOM_NAV.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              title={item.title}
              className={cn(
                "flex items-center rounded-lg transition-colors group",
                open ? "gap-3 px-3 py-2" : "size-10 justify-center",
                pathname === item.url
                  ? "bg-white/10 text-white font-medium"
                  : "text-cream/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("shrink-0", open ? "size-4" : "size-5")} />
              {open && <span className="text-[13px]">{item.title}</span>}
            </Link>
          ))}
        </div>

        {/* New Project Button */}
        <CreateProjectDialog>
          <Button
            variant="ghost"
            className={cn(
              "w-full rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all shadow-pop-sm border border-white/5",
              !open ? "size-10 p-0" : "h-9 px-3"
            )}
            size={!open ? "icon" : "default"}
          >
            {open ? (
              <div className="flex items-center justify-center gap-2">
                <Plus className="size-4 text-coral" />
                <span className="text-[13px] font-semibold tracking-tight">New Project</span>
              </div>
            ) : (
              <Plus className="size-5 text-coral" />
            )}
          </Button>
        </CreateProjectDialog>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};