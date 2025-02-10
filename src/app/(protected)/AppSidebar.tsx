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
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Q&A",
      url: "/qa",
      icon: Bot,
    },
    {
      title: "Meetings",
      url: "/meetings",
      icon: Presentation,
    },
    {
      title: "Billings",
      url: "/billing",
      icon: CreditCard,
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-3 space-x-6">
          <Image
            src="/logo_cropped.png"
            alt="Synthia Logo"
            width={53}
            height={53}
            className="rounded-lg shadow-sm"
          />
          {open && (
            <div className="flex flex-col space-y-1">
              <div className="text-2xl font-bold text-indigo-400 underline">
                SYNTHIA
              </div>
              <div className="text-[9px] font-medium leading-tight text-gray-400">
                - "Bringing Intelligence <br />
                to Your Workflow."
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                return (
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => {
                return (
                  <SidebarMenuItem key={project.name}>
                    <SidebarMenuButton asChild>
                      <div
                        onClick={() => {
                          setProjectId(project.id);
                        }}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            "flex size-6 items-center justify-center rounded-sm border bg-black text-sm text-primary",
                            {
                              "bg-primary text-black": project.id === projectId,
                            },
                          )}
                        >
                          {project.name[0]}
                        </div>
                        <span className="ml-2">{project.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <div className="h-4"></div>
              {open && (
                <SidebarMenuItem>
                  <Link href={"/create-project"}>
                    <Button
                      className="w-fit bg-inherit"
                      variant={"outline"}
                      size="sm"
                    >
                      <Plus className="ml-2" />
                      Create New Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
