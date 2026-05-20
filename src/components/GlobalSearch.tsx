"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderGit2, MessageSquare, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import useProject from "@/hooks/useProject";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { setProjectId } = useProject();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: projects } = api.project.getProjects.useQuery();
  const { data: questions, isLoading: questionsLoading } = api.project.getAllQuestions.useQuery(
    undefined,
    { enabled: open }
  );

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelectProject = (projectId: string) => {
    setProjectId(projectId);
    setOpen(false);
    setQuery("");
    router.push("/dashboard");
  };

  const handleSelectChat = (projectId: string) => {
    setProjectId(projectId);
    setOpen(false);
    setQuery("");
    router.push("/qa");
  };

  const q = query.toLowerCase();
  const filteredProjects = projects?.filter(p => p.name.toLowerCase().includes(q)) ?? [];
  const filteredQuestions = questions?.filter(chat => chat.question.toLowerCase().includes(q))?.slice(0, 8) ?? [];
  const hasResults = filteredProjects.length > 0 || filteredQuestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60 group-focus-within:text-coral transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          aria-label="Global Search"
          placeholder="Search projects, chats…"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          className={cn(
            "h-9 w-full rounded-full border bg-cream-deep/50 pl-10 pr-12 text-sm text-ink placeholder:text-ink-soft/50",
            "focus:outline-none transition-all duration-200",
            open
              ? "border-coral/40 ring-2 ring-coral/10 bg-cream shadow-soft"
              : "border-ink/10 hover:border-ink/20"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="hidden rounded-md bg-cream-deep px-1.5 py-0.5 text-[10px] font-medium text-ink-soft/70 sm:inline-block border border-ink/8 pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Dropdown Results */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="rounded-2xl border border-ink/10 bg-cream shadow-soft backdrop-blur-xl overflow-hidden max-h-[380px] overflow-y-auto">
            {!hasResults && query.length > 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-ink-soft">No results for &quot;{query}&quot;</p>
              </div>
            )}

            {!hasResults && query.length === 0 && (
              <div className="px-4 py-6 text-center">
                <Search className="h-5 w-5 mx-auto text-ink-soft/40 mb-2" />
                <p className="text-sm text-ink-soft/70">Search across all your projects and chats</p>
              </div>
            )}

            {filteredProjects.length > 0 && (
              <div className="px-2 pt-2 pb-1">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-soft/60">
                  Projects
                </p>
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left hover:bg-coral/8 transition-colors group"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-coral/10 text-coral group-hover:bg-coral/15 transition-colors shrink-0">
                      <FolderGit2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-ink truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {filteredProjects.length > 0 && filteredQuestions.length > 0 && (
              <div className="mx-3 border-t border-ink/6" />
            )}

            {filteredQuestions.length > 0 && (
              <div className="px-2 pt-1 pb-2">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-soft/60">
                  Recent Chats
                </p>
                {filteredQuestions.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.projectId)}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left hover:bg-sky/8 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-sky/10 text-sky group-hover:bg-sky/15 transition-colors shrink-0">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-ink truncate">{chat.question}</span>
                    </div>
                    <span className="text-[10px] font-medium bg-ink/5 text-ink-soft px-2 py-0.5 rounded-full shrink-0 ml-2 group-hover:bg-ink/8 transition-colors">
                      {chat.projectName}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {questionsLoading && open && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-ink-soft/50" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
