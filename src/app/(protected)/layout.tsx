import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="m-2 w-full">
        <Header />
        <div className="mt-4">
          <div className="mb-6 mt-1 flex w-auto items-center justify-between gap-2 px-4 shadow">
            <input
              type="search"
              placeholder="Search..."
              className="w-3/4 rounded-md border border-sidebar-border bg-transparent p-2 px-4 text-gray-400 placeholder-gray-500 outline-none"
            />
          </div>
        </div>
        <div className="h-full overflow-y-auto rounded-md border border-sidebar-border bg-sidebar p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
