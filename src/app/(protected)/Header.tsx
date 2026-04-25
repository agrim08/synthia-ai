"use client";

import { UserButton } from "@clerk/nextjs";
import useProject from "@/hooks/useProject";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { project } = useProject();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { title: "Dashboard", url: "/dashboard" },
    { title: "Q&A", url: "/qa" },
    { title: "Meetings", url: "/meetings" },
    { title: "Billing", url: "/billing" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="size-8 text-slate-400 transition-colors hover:text-slate-900" />
          
          <div className="h-4 w-px bg-slate-100 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-[300px] tracking-tight">
              {project?.name || "No project selected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "text-[13px] font-medium tracking-tight transition-colors",
                  pathname === item.url
                    ? "text-indigo-600"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 pl-4 border-l border-slate-100">
            {/* Mobile Hamburger */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-500 hover:bg-slate-100">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="w-full p-0 border-b border-slate-100 shadow-xl rounded-b-2xl">
                  <SheetHeader className="px-6 py-4 border-b border-slate-50 flex flex-row items-center justify-between">
                    <SheetTitle className="text-left text-sm font-bold">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col p-2 bg-white">
                    {navItems.map((item) => (
                      <Link
                        key={item.url}
                        href={item.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "px-4 py-3 rounded-lg text-[14px] font-medium transition-all",
                          pathname === item.url
                            ? "bg-slate-50 text-indigo-600"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <UserButton
               appearance={{
                 elements: {
                   userButtonAvatarBox: "size-7 rounded-lg ring-2 ring-slate-100 transition-all hover:ring-indigo-100",
                   userButtonPopoverCard: "rounded-xl border-none shadow-xl",
                   userButtonPopoverActionButton: "hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-all",
                 },
               }}
             />
          </div>
        </div>
      </div>
    </header>
  );
}
