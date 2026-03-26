"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import useProject from "@/hooks/useProject";
import { cn } from "@/lib/utils";
import {
  Bot,
  ChevronRight,
  CreditCard,
  Hash,
  LayoutDashboard,
  Plus,
  Presentation,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const AppSidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();

  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Q&A", url: "/qa", icon: Bot },
    { title: "Meetings", url: "/meetings", icon: Presentation },
    { title: "Billings", url: "/billing", icon: CreditCard },
  ];

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/60 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.02)]"
    >
      <SidebarHeader className={cn("px-4 py-8", !open && "px-0 items-center justify-center")}>
        <Link href="/" className="flex items-center gap-3">
          <Logo width={open ? 34 : 40} height={open ? 34 : 40} />
          {open && (
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Synthia
              </span>
              <span className="mt-1 text-[10px] font-bold text-indigo-700 uppercase tracking-widest leading-none">
                AI Intelligence
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className={cn("px-4", !open && "px-0")}>
        {/* Workspace Navigation */}
        <SidebarGroup className={cn("py-4", !open && "px-0")}>
          <SidebarMenu className="gap-2.5">
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={!open ? item.title : undefined}
                  className={cn(
                    "h-12 rounded-2xl transition-all duration-300",
                    pathname === item.url
                      ? "bg-indigo-700 text-white hover:bg-indigo-800 shadow-xl shadow-indigo-100"
                      : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900",
                    !open && "size-12 justify-center px-0 mx-auto"
                  )}
                >
                  <Link href={item.url} className={cn(
                     "flex items-center w-full",
                     open ? "justify-start px-4" : "justify-center px-0"
                  )}>
                    <item.icon className={cn(
                      "size-[20px] shrink-0",
                      open ? "mr-4" : "mx-0",
                      pathname === item.url ? "text-indigo-300" : "text-slate-400"
                    )} />
                    {open && <span className="font-bold text-[14px] tracking-tight">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup className={cn(!open && "px-0 items-center")}>
          <div className={cn("flex items-center justify-between px-2 mb-6 w-full", !open && "justify-center")}>
            {open && (
              <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Connected Projects
              </SidebarGroupLabel>
            )}
            <Link href="/create-project" className={cn(
              "p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200",
              !open && "hidden"
            )}>
               <Plus className="size-3.5 text-slate-400" />
            </Link>
            {!open && (
               <div className="h-px w-6 bg-slate-100" />
            )}
          </div>
          
          <div className={cn("space-y-3", open ? "px-1" : "flex flex-col items-center")}>
            {projects?.map((project) => (
              <button
                key={project.id}
                onClick={() => setProjectId(project.id)}
                className={cn(
                  "group relative flex items-center transition-all duration-300",
                  open ? "w-full gap-3.5 rounded-[20px] p-2 hover:bg-slate-50" : "size-12 rounded-xl justify-center",
                  project.id === projectId && open ? "bg-slate-50 ring-1 ring-slate-100 border-l-[3px] border-indigo-700 rounded-l-none" : ""
                )}
                title={project.name}
              >
                <div className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl border font-bold text-[13px] shadow-sm transition-all",
                  project.id === projectId
                    ? "border-indigo-700 bg-white text-indigo-700 ring-4 ring-indigo-50"
                    : "border-slate-100 bg-white text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600",
                  !open && "size-10 mx-auto"
                )}>
                  {project.name[0].toUpperCase()}
                </div>

                {open && (
                  <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
                    <span className={cn(
                      "w-full truncate text-[13px] font-bold tracking-tight",
                      project.id === projectId ? "text-slate-900" : "text-slate-500"
                    )}>
                      {project.name}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter opacity-40">Codebase</span>
                  </div>
                )}
              </button>
            ))}

            {(!projects || projects.length === 0) && open && (
               <div className="px-6 py-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 mx-2">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-loose italic">Initializing Engines...</span>
               </div>
            )}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn("p-4 mb-4", !open && "p-2 mb-0 flex items-center justify-center")}>
        <Link href="/create-project" className="w-full h-full flex items-center justify-center">
          <Button
            className={cn(
               "w-full h-8 rounded-2xl bg-indigo-700 text-white transition-all hover:bg-indigo-800 hover:scale-[1.02] shadow-2xl shadow-indigo-100/40",
               !open && "size-8 p-0 rounded-2xl"
            )}
            size={!open ? "icon" : "default"}
          >
            {open ? (
              <div className="flex items-center gap-2">
                 <Plus className="size-4" />
                 <span>New Project</span>
              </div>
            ) : (
              <Plus className="size-6" />
            )}
          </Button>
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
