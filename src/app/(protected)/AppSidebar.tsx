"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProject from "@/hooks/useProject";
import { cn } from "@/lib/utils";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  Plus,
  Presentation,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const AppSidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();

  const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Q&A", url: "/qa", icon: Bot },
    { title: "Meetings", url: "/meetings", icon: Presentation },
    { title: "Billings", url: "/billing", icon: CreditCard },
  ];

  return (
    // The sidebar occupies the full viewport height and uses a flex layout
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="flex h-screen flex-col"
    >
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Link href={"/"}>
            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
              <div className="text-xs">SYNTHIA</div>
              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                AI
              </div>
            </div>
          </Link>
          {open && (
            <div className="flex flex-col">
              <Link href={"/"}>
                <div className="text-2xl font-bold text-indigo-400 hover:text-indigo-700">
                  SYNTHIA
                </div>
              </Link>
              <div className="text-[9px] font-medium leading-tight text-gray-400">
                - "Bringing Intelligence <br /> to Your Workflow."
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Wrap the remaining content to keep overall sidebar height fixed */}
      <div className="flex-1 overflow-y-hidden">
        <SidebarContent className="flex h-full flex-col">
          {/* Application Section (non-scrolling) */}
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="!rounded-md">
                      <Link
                        href={item.url}
                        className={cn({
                          "!bg-primary !text-black": pathname === item.url,
                        })}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Your Projects Section */}
          <SidebarGroup className="flex flex-1 flex-col">
            <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
            {/* The container below is split into two parts: a scrollable project list and a fixed create button */}
            <div className="flex flex-1 flex-col">
              {/* Scrollable list area */}
              <div className="scrollbar-thin scrollbar-thumb-gray-700 flex-1 overflow-y-auto pr-2">
                <SidebarMenu>
                  {projects?.map((project) => (
                    <SidebarMenuItem key={project.name}>
                      <SidebarMenuButton asChild>
                        <div
                          onClick={() => setProjectId(project.id)}
                          className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-800"
                        >
                          <div
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-sm border bg-black text-sm text-primary",
                              {
                                "bg-primary text-black":
                                  project.id === projectId,
                              },
                            )}
                          >
                            {project.name[0]}
                          </div>
                          <span>{project.name}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
              {/* Fixed create project button */}
              {open && (
                <div className="border-t border-gray-700 p-2">
                  <Link href="/create-project">
                    <Button className="w-full" variant="outline" size="sm">
                      <Plus className="mr-2" />
                      Create New Project
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </Sidebar>
  );
};
