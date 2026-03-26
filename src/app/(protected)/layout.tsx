import { SidebarProvider, SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";
import { cookies } from "next/headers";

type Props = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

const SidebarLayout = async ({ children }: Props) => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SIDEBAR_COOKIE_NAME);
  // Default to open (true) if no cookie, otherwise check if value is "true"
  const defaultOpen = cookie ? cookie.value === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen w-full bg-[#f0f2f7]">
        <AppSidebar />
        <main className="flex-1">
          <Header />
          <div className="min-h-[calc(100vh-80px)]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SidebarLayout;
