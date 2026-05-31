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
  Plus,
  ChevronDown,
  Cloud,
  AlertTriangle,
  CreditCard,
  Radio,
  Search,
  Palette,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import InviteTeam from "./InviteTeam";
import TeamMembers from "./TeamMembers";
import IndexingStatusBanner from "@/components/IndexingStatusBanner";
import DeleteProject from "./DeleteProject";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardSkeleton from "./DashboardSkeleton";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  Lock, Database, Terminal, Layers, Cpu, Zap, Sparkles, CheckCircle: CheckCircle2,
  Cloud, AlertTriangle, CreditCard, Radio, Search, FileCode: FileCode2, Palette, GraduationCap,
};

const TOPIC_SUBTEXTS: Record<string, string> = {
  "Authentication & Security": "JWT + Session Handling",
  "Database & ORM": "Schemas + Queries",
  "API Layer": "Routes + Validation",
  "UI Components": "Reusable Components",
  "State Management": "Client & Server State",
  "Testing": "Unit + Integration Tests",
  "Background Jobs": "Asynchronous Workers & Queues",
  "Deployment & DevOps": "Infrastructure + CI/CD",
  "Error Handling": "Boundaries & Monitoring",
  "Payments & Billing": "Stripe & Subscriptions",
  "Real-time Features": "WebSockets & SSE",
  "Search & Indexing": "Vector Embeddings & Queries",
  "File Handling": "Uploads & S3 Storage",
  "AI & Machine Learning": "LLM Inference & Prompts",
  "Styling & Theming": "Tailwind & Themes",
};

const TOPIC_DISPLAY_NAMES: Record<string, string> = {
  "Authentication & Security": "Authentication",
  "Database & ORM": "Database",
  "API Layer": "API Design",
  "UI Components": "UI Components",
  "State Management": "State Management",
  "Testing": "Testing",
  "Background Jobs": "Background Jobs",
  "Deployment & DevOps": "Deployment",
  "Error Handling": "Error Handling",
  "Payments & Billing": "Payments",
  "Real-time Features": "Real-time Features",
  "Search & Indexing": "Search & Indexing",
  "File Handling": "File Handling",
  "AI & Machine Learning": "AI & ML",
  "Styling & Theming": "Styling & Themes",
};

const getTopicPrompt = (topicName: string) => {
  if (topicName.includes("Authentication")) return "Explain authentication flow in this repository";
  if (topicName.includes("Database")) return "Explain database architecture in this repository";
  if (topicName.includes("API")) return "Explain API architecture in this repository";
  if (topicName.includes("UI")) return "Explain UI component architecture in this repository";
  if (topicName.includes("State")) return "Explain state management in this repository";
  if (topicName.includes("Testing")) return "Explain testing setup in this repository";
  if (topicName.includes("Background")) return "Explain background job setup in this repository";
  if (topicName.includes("Deployment")) return "Explain deployment setup in this repository";
  if (topicName.includes("Error")) return "Explain error handling in this repository";
  if (topicName.includes("Payments")) return "Explain payment and billing setup in this repository";
  if (topicName.includes("Real-time")) return "Explain real-time features setup in this repository";
  if (topicName.includes("Search")) return "Explain search and indexing setup in this repository";
  if (topicName.includes("File")) return "Explain file handling in this repository";
  if (topicName.includes("AI")) return "Explain AI and machine learning setup in this repository";
  if (topicName.includes("Styling")) return "Explain styling and theming approach in this repository";
  return `Explain ${topicName.toLowerCase()} in this repository`;
};

const CommitSummaryAccordion = ({ summary }: { summary: string }) => {
  const [expanded, setExpanded] = React.useState(false);
  const points = summary.split("*").filter((s) => s.trim());
  if (points.length === 0) return null;

  const isLong = summary.length > 200 || points.length > 2;

  const formatPoint = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={idx} className="inline-block bg-ink/5 border border-ink/10 rounded px-1 py-0.5 mx-0.5 text-[9px] font-mono text-ink-soft truncate max-w-[200px] align-bottom">
            {part.slice(1, -1)}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="rounded-xl bg-cream-deep/40 border border-ink/5 px-4 py-3 ml-11 transition-all duration-300">
      <div className="flex items-center gap-1.5 mb-2.5 text-[9px] uppercase tracking-wider font-bold text-ink-soft">
        <Sparkles className="size-3.5 text-coral" />
        AI Commit Summary
      </div>
      <div className={cn(
        "relative overflow-hidden transition-all duration-500",
        expanded ? "max-h-[2000px]" : "max-h-[72px]"
      )}>
        <ul className="space-y-2.5">
          {points.map((point, i) => (
            <li key={i} className="flex gap-2 text-[11px] text-ink-soft leading-relaxed items-start">
              <span className="text-coral mt-1.5 h-1 w-1 rounded-full bg-coral shrink-0" />
              <span className="flex-1 break-words">{formatPoint(point.trim())}</span>
            </li>
          ))}
        </ul>
        {isLong && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
        )}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] font-bold text-coral hover:text-coral-deep transition-colors mt-2 flex items-center gap-1"
        >
          {expanded ? "Show less" : "Show more"}
          <ChevronDown className={cn("size-3 transition-transform", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
};

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

  const { data: intelligence } = api.project.getProjectIntelligence.useQuery(
    { projectId: projectId as string },
    { enabled: !!projectId }
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
          <div className="flex justify-center">
            <CreateProjectDialog>
              <Button className="rounded-xl bg-coral hover:bg-coral-deep text-cream h-11 px-6 font-semibold flex items-center gap-2 transition-all shadow-pop-sm hover:translate-y-[-2px]">
                <Plus className="size-4" />
                Create New Project
              </Button>
            </CreateProjectDialog>
          </div>
        </div>
      </div>
    );
  }

  // Repository stats
  const totalFiles = project.indexingTotal || 0;
  const isSyncing = project.indexingStatus === "INDEXING" || project.indexingStatus === "SYNCING";
  const complexity = intelligence?.complexity || "Medium";
  const topics = intelligence?.topics || [];
  const suggestedQuestions = intelligence?.suggestedQuestions || [];


  return (
    <div className="relative min-h-screen bg-cream text-ink">
      {/* Ambient background blur blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-coral-soft/20 blur-3xl" />
        <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-sky/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-butter/20 blur-3xl" />
      </div>

      {/* Context Navigation Bar */}
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

      {/* Indexing status banner */}
      <IndexingStatusBanner projectId={project.id} />

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        
        {/* Section 1 & 2: Merged Repository Header & AI Insights Card */}
        <div className="relative overflow-hidden rounded-3xl border border-ink/8 bg-cream-deep/35 p-5 md:p-6 shadow-soft animate-fade-up">
          <div className="space-y-4">
            {/* Top row: AI Insights Title & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink/6">
              <div className="flex items-center gap-2 text-coral">
                <Sparkles className="size-3.5" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] font-sans">AI Repository Insights</h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[9px] uppercase font-semibold font-mono text-ink-soft/70">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-coral/10 border border-coral/20 font-black text-coral">
                  Connected
                </span>
                <span>•</span>
                <span>Last Analyzed: {timeAgo(project.updatedAt)}</span>
                <span>•</span>
                <span>Status: <span className="text-sage font-bold">{isSyncing ? "Syncing..." : "Ready"}</span></span>
              </div>
            </div>

            {/* AI Repository Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Project Type */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-ink-soft/70 block font-bold font-sans">Project Type</span>
                <span className="text-xs font-bold text-ink leading-snug block">
                  {intelligence?.architecture && (intelligence.architecture.toLowerCase().includes("next") || intelligence.architecture.toLowerCase().includes("nuxt") || intelligence.architecture.toLowerCase().includes("vite") || intelligence.architecture.toLowerCase().includes("svelte"))
                    ? "Full-Stack Next.js Application"
                    : intelligence?.architecture || "Software Application"}
                </span>
              </div>

              {/* Key Topics */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-ink-soft/70 block font-bold font-sans">Key Topics</span>
                <div className="flex flex-wrap gap-1">
                  {topics.slice(0, 4).map((t: any) => (
                    <span key={t.name} className="text-[9px] font-bold px-2 py-0.5 rounded bg-ink/5 border border-ink/10 text-ink-soft">
                      {TOPIC_DISPLAY_NAMES[t.name] || t.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interview Focus */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-ink-soft/70 block font-bold font-sans">Interview Focus</span>
                <span className="text-xs font-bold text-ink leading-snug block">
                  {topics.length > 0 && topics[0]?.name
                    ? `${TOPIC_DISPLAY_NAMES[topics[0].name] || topics[0].name} Flow`
                    : "System Architecture"}
                </span>
              </div>

              {/* Recommended Next Step */}
              <div className="space-y-2">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-ink-soft/70 block font-bold font-sans">Recommended Next Step</span>
                  <span className="text-xs font-bold text-ink leading-snug block">
                    {intelligence?.recommendedTopic?.title || "Explore Your Codebase"}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    const isPractice = intelligence?.recommendedTopic?.title.includes('Practice') || intelligence?.recommendedTopic?.title.includes('Questions');
                    router.push(`/qa?mode=${isPractice ? 'interview' : 'learn'}&prompt=${encodeURIComponent(intelligence?.recommendedTopic?.prompt || "Give me an overview of this codebase.")}`);
                  }}
                  className="rounded-lg bg-coral hover:bg-coral-deep text-cream hover:scale-[1.02] transition-all font-semibold flex items-center gap-1.5 h-7 px-3 text-[11px] shadow-pop-sm"
                  size="sm"
                >
                  {intelligence?.recommendedTopic?.title.includes('Practice') || intelligence?.recommendedTopic?.title.includes('Questions') ? 'Start Practice' : 'Start Learning'}
                  <ArrowRight className="size-3" />
                </Button>
              </div>
            </div>

            {/* Repository Snapshot Inline Section */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-ink/6 text-[11px] text-ink-soft">
              <span className="font-sans uppercase tracking-[0.1em] text-[9px] font-black text-ink-soft/60 flex items-center gap-1">
                <Code2 className="size-3 text-coral" /> Snapshot:
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-ink">{totalFiles}</span> files indexed
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-ink">{intelligence?.topics?.length || 0}</span> modules
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-ink">{complexity}</span> complexity
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-ink">{commits?.length || 0}</span> commits
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-ink">
                  {commits ? Array.from(new Set(commits.map((c) => c.commitAuthorName))).length : 1}
                </span> contributors
              </span>
              {intelligence?.architecture && (
                <span className="flex items-center gap-1 truncate max-w-[200px]" title={intelligence.architecture}>
                  arch: <span className="font-bold text-ink">{intelligence.architecture}</span>
                </span>
              )}
              {intelligence?.languages && intelligence.languages.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-ink-soft/60">langs:</span>
                  <div className="flex flex-wrap gap-1">
                    {intelligence.languages.map((lang) => (
                      <span key={lang} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-coral/5 text-coral border border-coral/10">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Recommended Next Action */}
        <div className="relative overflow-hidden rounded-[32px] bg-ink text-cream p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 group border border-ink-soft/20 animate-fade-up">
          <div className="absolute right-[-20px] top-[-20px] scale-[1.8] opacity-5 pointer-events-none text-coral">
            <Sparkles className="size-32" />
          </div>

          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/10 border border-coral/20 text-[9px] font-black uppercase tracking-[0.2em] text-coral/80">
              <Sparkles className="size-3 text-coral" />
              Recommended Next Action
            </div>
            <h3 className="text-2xl font-display font-black tracking-tight leading-tight text-cream">
              {intelligence?.recommendedTopic?.title || "Explore Your Codebase"}
            </h3>
            <p className="text-sm text-cream-deep/70 leading-relaxed max-w-2xl">
              {intelligence?.recommendedTopic?.description || "Start asking questions about your repository to understand its architecture."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 shrink-0 border-t md:border-t-0 md:border-l border-cream/10 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
            <span className="text-[10px] uppercase tracking-wider text-cream/50">
              Est. Time: {intelligence?.recommendedTopic?.estTime || 5} mins
            </span>
            <Button
              onClick={() => {
                const isPractice = intelligence?.recommendedTopic?.title.includes('Practice') || intelligence?.recommendedTopic?.title.includes('Questions');
                router.push(`/qa?mode=${isPractice ? 'interview' : 'learn'}&prompt=${encodeURIComponent(intelligence?.recommendedTopic?.prompt || "Give me an overview of this codebase.")}`);
              }}
              className="rounded-xl bg-coral hover:bg-coral-deep text-cream hover:scale-[1.03] transition-all font-semibold flex items-center gap-2 h-11 px-6 shadow-pop-sm"
              size="default"
            >
              {intelligence?.recommendedTopic?.title.includes('Practice') || intelligence?.recommendedTopic?.title.includes('Questions') ? 'Start Practice' : 'Start Learning'}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Section 4: Interview Intelligence Section */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 animate-fade-up">
          {/* Left Column (70% width): Expected Interview Questions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-4 text-coral" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink-soft/80">Expected Interview Questions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedQuestions.length > 0 ? (
                suggestedQuestions.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col justify-between p-5 rounded-2xl border border-ink/8 bg-card/75 shadow-sm min-h-[140px] hover:border-ink/15 transition-all hover-lift">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-[13px] font-bold text-ink leading-snug">{item.question}</h3>
                      <span className={cn(
                        "shrink-0 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                        item.difficulty === "Hard" || item.difficulty === "Advanced"
                          ? "bg-coral/10 text-coral border-coral/20"
                          : item.difficulty === "Medium" || item.difficulty === "Intermediate"
                          ? "bg-butter/10 text-butter border-butter/20"
                          : "bg-sage/10 text-sage border-sage/20"
                      )}>
                        {item.difficulty}
                      </span>
                    </div>
                    <Button
                      onClick={() => router.push(`/qa?mode=interview&prompt=${encodeURIComponent(item.question)}`)}
                      className="w-full text-xs font-bold bg-cream-deep hover:bg-coral border border-ink/8 hover:border-coral hover:text-cream text-ink transition-all rounded-xl h-9"
                    >
                      Practice Question
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl border border-dashed border-ink/15 bg-card/50">
                  <span className="text-sm font-bold text-ink">No questions generated yet.</span>
                  <p className="text-xs text-ink-soft mt-1">Questions will appear once repository indexing processes the codebase.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (30% width): Topics Found */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-coral" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink-soft/80">Topics Found</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              {topics.slice(0, 5).map((topic: any) => {
                const Icon = ICON_MAP[topic.icon] || Sparkles;
                const displayName = TOPIC_DISPLAY_NAMES[topic.name] || topic.name;
                const subtext = TOPIC_SUBTEXTS[topic.name] || topic.description;
                const learnPrompt = getTopicPrompt(topic.name);
                
                return (
                  <div
                    key={topic.name}
                    onClick={() => router.push(`/qa?mode=learn&prompt=${encodeURIComponent(learnPrompt)}`)}
                    className="group flex items-center justify-between p-3.5 rounded-2xl border border-ink/8 bg-card/75 hover:border-coral/30 hover:bg-coral/[0.02] cursor-pointer transition-all hover-lift"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-xl bg-coral/5 text-coral flex items-center justify-center border border-coral/10 group-hover:scale-105 transition-transform shrink-0">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-ink truncate leading-snug">{displayName}</h4>
                        <p className="text-[10px] text-ink-soft truncate mt-0.5">{subtext}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-coral group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                      [Learn]
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 5: Recent Engineering Changes */}
        <section className="space-y-4 animate-fade-up">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-coral" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink-soft/80">Recent Engineering Changes</h2>
          </div>

          <div className="space-y-4">
            {commits && commits.length > 0 ? (
              commits.slice(0, 5).map((commit, commitIdx) => {
                const commitQuestions = getCommitQuestions(commit.commitMessage, commit.commitSummary || "");
                return (
                  <div key={commit.id ?? commit.commitHash} className="p-6 rounded-3xl border border-ink/8 bg-card/75 shadow-sm flex flex-col md:flex-row gap-6 justify-between hover:border-ink/12 transition-all hover-lift">
                    {/* Left: Commit overview */}
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={commit.commitAuthorAvatar}
                          alt={commit.commitAuthorName}
                          className="h-8 w-8 rounded-full object-cover border border-ink/10"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-ink leading-tight">
                              {commit.commitMessage.charAt(0).toUpperCase() + commit.commitMessage.slice(1)}
                            </h4>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-coral/5 border border-coral/10 text-[9px] font-bold text-coral">
                              Mini Case Study
                            </span>
                          </div>
                          <span className="text-[11px] text-ink-soft font-medium">
                            By {commit.commitAuthorName} · {timeAgo(commit.commitDate)}
                          </span>
                        </div>
                      </div>

                      {commit.commitSummary && (
                        <CommitSummaryAccordion summary={commit.commitSummary} />
                      )}
                    </div>

                    {/* Right: Potential Questions */}
                    <div className="w-full md:w-80 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-ink/6 pt-4 md:pt-0 md:pl-6 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-ink-soft/70 font-bold block mb-2">
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
                        className="w-full text-xs font-bold bg-coral hover:bg-coral-deep text-cream rounded-xl h-9 flex items-center justify-center gap-1 transition-all shadow-pop-sm"
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
