import { SidebarProvider, SIDEBAR_COOKIE_NAME, SidebarInset } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";
import { cookies } from "next/headers";

type Props = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";
export const maxDuration = 60;


const SidebarLayout = async ({ children }: Props) => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SIDEBAR_COOKIE_NAME);
  // Default to open (true) if no cookie, otherwise check if value is "true"
  const defaultOpen = cookie ? cookie.value === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="bg-cream text-ink">
        <Header />
        <main className="min-h-[calc(100vh-56px)] w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;
