"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="border-b border-sidebar-border bg-sidebar shadow-md dark:bg-sidebar">
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4">
          <Link
            href="/"
            className="text-2xl font-bold text-indigo-400 hover:text-indigo-700"
          >
            SYNTHIA
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/dashboard"
              className="text-gray-400 transition-colors hover:text-gray-200"
            >
              Dashboard
            </Link>
            <Link
              href="/qa"
              className="text-gray-400 transition-colors hover:text-gray-200"
            >
              Q&A
            </Link>
            <Link
              href="/meetings"
              className="text-gray-400 transition-colors hover:text-gray-200"
            >
              Meetings
            </Link>
            <Link
              href="/billing"
              className="text-gray-400 transition-colors hover:text-gray-200"
            >
              Billings
            </Link>
            <UserButton />
          </nav>
          {/* Mobile Navigation Menu */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
        {isMobileMenuOpen && (
          <nav className="flex flex-col gap-2 p-4 md:hidden">
            <Link
              href="/dashboard"
              className="text-gray-400 transition-colors hover:text-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/qa"
              className="text-gray-400 transition-colors hover:text-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Q&A
            </Link>
            <Link
              href="/meetings"
              className="text-gray-400 transition-colors hover:text-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Meetings
            </Link>
            <Link
              href="/billing"
              className="text-gray-400 transition-colors hover:text-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Billings
            </Link>
            <UserButton />
          </nav>
        )}
      </div>
    </header>
  );
}
