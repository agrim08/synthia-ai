"use client";

import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import {
  Github,
  MoreHorizontal,
  Settings,
  Trash2,
  Activity,
  GitBranch,
  Sparkles,
  Clock,
  Link2,
  FileCode2,
  Layers,
  Database,
  Cpu,
  BookOpen,
  ArrowRight,
  Terminal,
  Lock,
  Zap,
  HelpCircle,
  Code2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import InviteTeam from "./InviteTeam";
import TeamMembers from "./TeamMembers";
import IndexingStatusBanner from "@/components/IndexingStatusBanner";
import DeleteProject from "./DeleteProject";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardSkeleton from "./DashboardSkeleton";

// Helper function to format timestamp relative to current time
const timeAgo = (date: Date | string | null | undefined) => {
  if (!date) return "Never";
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
};

// Heuristic questions for commits
const getCommitQuestions = (title: string, summary: string) => {
  const lower = (title + " " + summary).toLowerCase();
  if (lower.includes("auth") || lower.includes("clerk") || lower.includes("login") || lower.includes("sign")) {
    return [
      "Why was refresh token rotation introduced?",
      "How does session recovery work?",
      "What security issue was solved?"
    ];
  }
  if (lower.includes("db") || lower.includes("database") || lower.includes("prisma") || lower.includes("postgres") || lower.includes("sql")) {
    return [
      "Why was PostgreSQL/Neon chosen over alternatives?",
      "How do you handle database migrations in production?",
      "How is data consistency guaranteed in database transactions?"
    ];
  }
  if (lower.includes("api") || lower.includes("route") || lower.includes("trpc") || lower.includes("fetch")) {
    return [
      "How is API validation and typesafety handled?",
      "What error handling strategies are in place for API failures?",
      "Why trpc over standard REST/GraphQL?"
    ];
  }
  return [
    "What were the key trade-offs in this implementation?",
    "How would you test this change?",
    "How does this code scale under high load?"
  ];
};

const DashboardPage = () => {
  const { project, projectId, isLoading } = useProject();
  const router = useRouter();

  const { data: commits } = api.project.getCommits.useQuery(
    { projectId: projectId as string },
    { 
      enabled: !!projectId,
      refetchInterval: (project?.indexingStatus === "INDEXING" || project?.indexingStatus === "SYNCING") ? 3000 : false 
    }
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Fallback for no project selected
  if (!project) {
    return (
      <div className="relative min-h-screen bg-cream text-ink flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-card rounded-[32px] border border-ink/8 p-8 shadow-soft animate-fade-up">
          <div className="size-16 mx-auto rounded-2xl bg-coral/10 text-coral flex items-center justify-center mb-6">
            <Sparkles className="size-8" />
          </div>
          <h2 className="text-2xl font-display font-black text-ink mb-2">Welcome to OwnYourCode</h2>
          <p className="text-sm text-ink-soft mb-8 leading-relaxed">
            Link a repository to start analyzing your codebase, discovering topics, and preparing for your technical interviews.
          </p>
          <div className="text-xs font-semibold text-ink-soft bg-cream-deep/40 rounded-xl py-3 px-4 border border-ink/6">
            Use the <strong>New Project</strong> button in the sidebar to get started.
          </div>
        </div>
      </div>
    );
  }

  // Repository stats
  const totalFiles = project.indexingTotal || 0;
  const isSyncing = project.indexingStatus === "INDEXING" || project.indexingStatus === "SYNCING";
  const complexity = totalFiles < 15 ? "Low" : totalFiles < 50 ? "Medium" : "High";

  // Topics Discovered based on project characteristics
  const topics = [
    {
      name: "Authentication & Security",
      icon: Lock,
      desc: "User access management, session logic, and secure routing inside protected layouts.",
      prompt: "Explain how authentication and security are implemented in this repository.",
    },
    {
      name: "Database Schema & Models",
      icon: Database,
      desc: "Prisma data models, entity relationships, and Neon PostgreSQL queries.",
      prompt: "Explain the database design, schema models, and relationships in this repository.",
    },
    {
      name: "API Design & Router",
      icon: Terminal,
      desc: "Typesafe endpoint logic, bridging server mutations and React client hooks.",
      prompt: "Explain the API layer design and how client-server communication is handled in this codebase.",
    },
    {
      name: "Background Tasks",
      icon: Zap,
      desc: "Event queues and background execution handlers enqueued via QStash workflows.",
      prompt: "Explain how background indexing and syncing processes are structured in this repository.",
    },
    {
      name: "Error Logging & Tracking",
      icon: Cpu,
      desc: "Sentry integration and custom error boundaries tracking pipeline failures.",
      prompt: "Explain the logging, error handling, and debugging setup in this project.",
    },
    {
      name: "UI Component Architecture",
      icon: Layers,
      desc: "Design system components, responsive navigation sidebars, and Tailwind CSS tokens.",
      prompt: "Explain the modular structure of the UI components and how styling tokens are set up.",
    },
  ];

  // Suggested Interview Questions
  const suggestedQuestions = [
    {
      question: "How is database schema typesafety maintained between Prisma and the client application?",
      diff: "Intermediate",
      diffColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30",
    },
    {
      question: "What is the background tasks architecture and how does it prevent race conditions?",
      diff: "Advanced",
      diffColor: "text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30",
    },
    {
      question: "Why was tRPC chosen over traditional REST or GraphQL APIs in this system design?",
      diff: "Intermediate",
      diffColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30",
    },
    {
      question: "How would you optimize the indexing pipeline performance as repository size scales?",
      diff: "Advanced",
      diffColor: "text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30",
    },
  ];

  return (
    <div className="relative min-h-screen bg-cream text-ink">
      {/* Ambient background blur blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-coral-soft/20 blur-3xl" />
        <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-sky/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-butter/20 blur-3xl" />
      </div>

      {/* 1. Context Navigation Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-cream/75 border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft/70 font-medium">
                Active Repository
              </p>
              {project.githubUrl ? (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  className="text-sm font-semibold truncate hover:text-coral transition-colors flex items-center gap-1.5"
                >
                  {project.githubUrl.split("/").pop()}
                  <Link2 className="size-3 text-ink-soft" />
                </Link>
              ) : (
                <span className="text-sm font-semibold truncate text-ink">{project.name}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <InviteTeam />
            </div>
            <TeamMembers />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:text-ink hover:bg-cream-deep transition-all duration-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-cream border-ink/10 rounded-xl shadow-md w-52 mt-5"
              >
                <DropdownMenuItem className="rounded-lg cursor-pointer hover:text-ink">
                  <Settings className="mr-2 h-4 w-4" />
                  Project Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    document.getElementById("delete-trigger")?.click();
                  }}
                  className="rounded-lg cursor-pointer text-coral focus:text-coral focus:bg-coral-soft/30"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden">
              <DeleteProject id="delete-trigger" />
            </div>
          </div>
        </div>
      </div>

      {/* Indexing status banner (kept, just showing visual status on top) */}
      <IndexingStatusBanner projectId={project.id} />

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        
        {/* Section 1: Repository Header Card & Section 6: Recommended Starting Point */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
          {/* Header Card */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-[32px] border border-ink/10 bg-card p-6 md:p-8 shadow-soft">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/10 border border-coral/20 text-[10px] font-black uppercase tracking-widest text-coral">
                  Connected
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-black text-ink tracking-tight">
                  {project.name}
                </h1>
                <p className="text-sm font-mono text-ink-soft break-all select-all">
                  {project.githubUrl || "Local ZIP Import"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-ink/6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-ink-soft/70 block">Last Analyzed</span>
                <span className="text-sm font-bold text-ink flex items-center gap-1.5 mt-0.5">
                  <Clock className="size-3.5 text-coral" />
                  {timeAgo(project.updatedAt)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-ink-soft/70 block">Repository Status</span>
                <span className="text-sm font-bold text-ink flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="size-3.5 text-sage" />
                  {isSyncing ? "Syncing..." : "Ready"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 6: Recommended Starting Point CTA */}
          <div className="relative overflow-hidden rounded-[32px] bg-ink text-cream p-6 md:p-8 shadow-md flex flex-col justify-between group">
            <div className="absolute right-[-20px] top-[-20px] scale-[1.8] opacity-5 pointer-events-none text-coral">
              <Sparkles className="size-32" />
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-coral/80">
                <Sparkles className="size-3 text-coral" />
                Recommended Next Step
              </span>
              <h3 className="text-2xl font-display font-black tracking-tight leading-tight text-cream">
                Practice API Design Questions
              </h3>
              <p className="text-xs text-cream-deep/70 leading-relaxed max-w-[220px]">
                Test your knowledge of typesafe tRPC endpoints and schema validations in mock mode.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-cream/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-cream/50">Est. Time: 8 min</span>
              <Button
                onClick={() => router.push(`/qa?mode=interview&prompt=${encodeURIComponent("How is API validation and typesafety handled in this project?")}`)}
                className="rounded-xl bg-coral hover:bg-coral-deep text-cream hover:scale-[1.03] transition-all font-semibold flex items-center gap-1 text-xs"
                size="sm"
              >
                Start Practice
                <ArrowRight className="size-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Section 2: Repository Overview Factoids */}
        <section className="space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-coral" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink-soft/80">Repository Intelligence</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-ink/8 bg-card/60 p-4">
              <span className="text-[10px] uppercase tracking-wider text-ink-soft/70 block">Files Indexed</span>
              <span className="text-2xl font-display font-black text-ink mt-1 block">{totalFiles}</span>
            </div>
            <div className="rounded-2xl border border-ink/8 bg-card/60 p-4">
              <span className="text-[10px] uppercase tracking-wider text-ink-soft/70 block">Languages</span>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-sky/10 text-sky border border-sky/20">TS</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-coral/10 text-coral border border-coral/20">CSS</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-sage/10 text-sage border border-sage/20">Prisma</span>
              </div>
            </div>
            <div className="rounded-2xl border border-ink/8 bg-card/60 p-4">
              <span className="text-[10px] uppercase tracking-wider text-ink-soft/70 block">Complexity</span>
              <span className="text-2xl font-display font-black text-ink mt-1 block">{complexity}</span>
            </div>
            <div className="rounded-2xl border border-ink/8 bg-card/60 p-4">
              <span className="text-[10px] uppercase tracking-wider text-ink-soft/70 block">Commits Logged</span>
              <span className="text-2xl font-display font-black text-ink mt-1 block">{commits?.length || 0}</span>
            </div>
            <div className="col-span-2 md:col-span-4 lg:col-span-1 rounded-2xl border border-ink/8 bg-card/60 p-4">
              <span className="text-[10px] uppercase tracking-wider text-ink-soft/70 block">Primary Architecture</span>
              <span className="text-[13px] font-bold text-ink mt-2 block truncate">Next.js Web App</span>
            </div>
          </div>
        </section>

        {/* Section 3: Topics Discovered */}
        <section className="space-y-4 animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-coral" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink-soft/80">Codebase Topics Discovered</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <div key={topic.name} className="flex flex-col justify-between p-5 rounded-2xl border border-ink/8 bg-card/70 hover:border-coral/20 transition-all hover-lift">
                <div>
                  <div className="size-9 rounded-xl bg-coral/5 text-coral flex items-center justify-center mb-3.5 border border-coral/10">
                    <topic.icon className="size-4" />
                  </div>
                  <h3 className="text-sm font-bold text-ink mb-1.5">{topic.name}</h3>
                  <p className="text-xs text-ink-soft leading-relaxed mb-4">{topic.desc}</p>
                </div>
                <Button
                  onClick={() => router.push(`/qa?mode=learn&prompt=${encodeURIComponent(topic.prompt)}`)}
                  variant="ghost"
                  className="w-full text-xs font-bold text-coral border border-coral/20 hover:bg-coral hover:text-white rounded-xl h-9.5"
                >
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Suggested Interview Questions */}
        <section className="space-y-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2">
            <HelpCircle className="size-4 text-coral" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink-soft/80">Expected Interview Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedQuestions.map((item, idx) => (
              <div key={idx} className="flex flex-col justify-between p-5 rounded-2xl border border-ink/8 bg-card/70 shadow-sm min-h-[140px]">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-[13px] font-bold text-ink leading-snug">{item.question}</h3>
                  <span className={`shrink-0 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${item.diffColor}`}>
                    {item.diff}
                  </span>
                </div>
                <Button
                  onClick={() => router.push(`/qa?mode=interview&prompt=${encodeURIComponent(item.question)}`)}
                  className="w-full text-xs font-bold bg-cream-deep hover:bg-coral border border-ink/8 hover:border-coral hover:text-cream text-ink transition-all rounded-xl h-9.5"
                >
                  Practice Question
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Recent Engineering Changes */}
        <section className="space-y-4 animate-fade-up" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-coral" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink-soft/80">Recent Engineering Changes</h2>
          </div>

          <div className="space-y-4">
            {commits && commits.length > 0 ? (
              commits.slice(0, 5).map((commit, commitIdx) => {
                const commitQuestions = getCommitQuestions(commit.commitMessage, commit.commitSummary || "");
                return (
                  <div key={commit.id ?? commit.commitHash} className="p-6 rounded-2xl border border-ink/8 bg-card/70 shadow-sm flex flex-col md:flex-row gap-6 justify-between hover-lift">
                    {/* Left: Commit overview */}
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={commit.commitAuthorAvatar}
                          alt={commit.commitAuthorName}
                          className="h-8 w-8 rounded-full object-cover border border-ink/10"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-ink leading-tight">
                            {commit.commitMessage.charAt(0).toUpperCase() + commit.commitMessage.slice(1)}
                          </h4>
                          <span className="text-[11px] text-ink-soft font-medium">
                            By {commit.commitAuthorName} · {timeAgo(commit.commitDate)}
                          </span>
                        </div>
                      </div>

                      {commit.commitSummary && (
                        <div className="rounded-xl bg-cream-deep/40 border border-ink/5 p-4">
                          <div className="flex items-center gap-1.5 mb-2.5 text-[9px] uppercase tracking-wider font-bold text-ink-soft">
                            <Sparkles className="size-3.5 text-coral" />
                            AI Commit Summary
                          </div>
                          <ul className="space-y-1.5">
                            {commit.commitSummary
                              .split("*")
                              .filter((s) => s.trim())
                              .map((point, i) => (
                                <li key={i} className="flex gap-2 text-xs text-ink-soft leading-relaxed">
                                  <span className="text-coral mt-1.5 h-1 w-1 rounded-full bg-coral shrink-0" />
                                  <span className="flex-1 break-words">{point.trim()}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Right: Potential Questions */}
                    <div className="w-full md:w-80 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-ink/6 pt-4 md:pt-0 md:pl-6 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-ink-soft/70 font-semibold block mb-2">
                          Potential Interview Questions
                        </span>
                        <div className="space-y-2">
                          {commitQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => router.push(`/qa?mode=interview&prompt=${encodeURIComponent(q)}`)}
                              className="w-full text-left text-xs text-ink hover:text-coral font-medium py-1 px-1.5 rounded hover:bg-coral/5 transition-colors border border-transparent block truncate"
                              title={q}
                            >
                              • {q}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push(`/qa?mode=interview&prompt=${encodeURIComponent(commitQuestions[0]!)}`)}
                        className="w-full text-xs font-bold bg-coral hover:bg-coral-deep text-cream rounded-xl h-9 flex items-center justify-center gap-1"
                      >
                        Practice this Change
                        <ArrowRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-ink/15 bg-card/50">
                <span className="text-sm font-bold text-ink">No commits tracked yet.</span>
                <p className="text-xs text-ink-soft mt-1">Commits will appear once background indexing processes git logs.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;
