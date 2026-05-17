"use client";

import { UserButton } from "@clerk/nextjs";
import useProject from "@/hooks/useProject";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, Search, MessageSquarePlus, Mic, UserPlus, Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import AudioUploadBtn from "./dashboard/AudioUploadBtn";
import InviteTeam from "./dashboard/InviteTeam";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";

export default function Header() {
  const { project, projects, setProjectId } = useProject();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Navigation for mobile fallback
  const navItems = [
    { title: "Dashboard", url: "/dashboard" },
    { title: "Q&A", url: "/qa" },
    { title: "Meetings", url: "/meetings" },
    { title: "Billing", url: "/billing" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="size-8 text-ink-soft transition-colors hover:text-ink" />
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden flex-1 items-center justify-center px-6 md:flex">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft group-focus-within:text-ink transition-colors" />
            <input
              type="text"
              placeholder="Search projects, chats, prompts..."
              className="h-9 w-full rounded-full border border-ink/15 bg-white pl-9 pr-12 text-sm text-ink placeholder:text-ink-soft/70 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10 transition-all shadow-md"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden rounded bg-cream-deep px-1.5 py-0.5 text-[10px] font-medium text-ink-soft sm:inline-block border border-ink/10">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right side icons & buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CreateProjectDialog>
            <Button title="New Project" variant="ghost" size="icon" className="hidden sm:flex text-ink-soft hover:text-ink hover:bg-ink/5 h-8 w-8 rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </CreateProjectDialog>

          <InviteTeam>
            <Button title="Invite Members" disabled={!project} variant="ghost" size="icon" className="hidden sm:flex text-ink-soft hover:text-ink hover:bg-ink/5 h-8 w-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
              <UserPlus className="h-4 w-4" />
            </Button>
          </InviteTeam>

          <Button title="Notifications" variant="ghost" size="icon" className="text-ink-soft hover:text-ink hover:bg-ink/5 h-8 w-8 rounded-full relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-coral"></span>
          </Button>
          
          <div className="h-4 w-px bg-ink/10 hidden sm:block mx-1" />

          <Link href="/qa" className="hidden sm:flex items-center gap-1.5 rounded-full bg-black hover:bg-black/80 px-4 py-1.5 text-xs font-semibold text-cream shadow-pop-sm transition-all">
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="w-full p-0 border-b border-ink/10 shadow-pop rounded-b-3xl bg-cream">
                <SheetHeader className="px-6 py-4 border-b border-ink/5 flex flex-row items-center justify-between">
                  <SheetTitle className="text-left text-sm font-bold text-ink">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                        pathname === item.url
                          ? "bg-ink/5 text-ink"
                          : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-ink/5" />
                  <Link href="/qa" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-cream">
                    <MessageSquarePlus className="h-4 w-4" />
                    New Chat
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="ml-1 flex items-center">
            <UserButton
               appearance={{
                 elements: {
                   userButtonAvatarBox: "size-8 rounded-full border border-ink/10 transition-all hover:border-ink/30 shadow-pop-sm",
                   userButtonPopoverCard: "rounded-2xl border border-ink/10 shadow-pop",
                   userButtonPopoverActionButton: "hover:bg-cream-deep hover:text-ink rounded-lg transition-all text-sm",
                 },
               }}
             />
          </div>
        </div>
      </div>
    </header>
  );
}
