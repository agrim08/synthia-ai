"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  Github,
  ExternalLink,
  Menu,
  X,
  Play,
  Cpu,
  Brain,
  Code,
  Mic,
  CreditCard,
  Circle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: { id: string; label: string }[];
}

// ─── Navigation structure ─────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    group: "Introduction",
    icon: Play,
    sections: [
      { id: "overview", label: "Overview" },
      { id: "connect-repo", label: "Connect a Repository" },
      { id: "first-index", label: "Your First Index" },
      { id: "local-setup", label: "Local Development" },
    ],
  },
  {
    id: "code-indexing",
    label: "Codebase Indexing",
    group: "Core Concepts",
    icon: Cpu,
    sections: [
      { id: "how-it-works", label: "How It Works" },
      { id: "chunking", label: "File Chunking" },
      { id: "embeddings", label: "Vector Embeddings" },
      { id: "incremental", label: "Incremental Sync" },
    ],
  },
  {
    id: "codebase-qa",
    label: "Codebase Q&A",
    group: "Features",
    icon: Brain,
    sections: [
      { id: "rag-overview", label: "RAG Pipeline" },
      { id: "asking-questions", label: "Asking Questions" },
      { id: "file-references", label: "File References" },
      { id: "conversation-history", label: "Conversation History" },
    ],
  },
  {
    id: "commit-intelligence",
    label: "Commit Intelligence",
    group: "Features",
    icon: Code,
    sections: [
      { id: "commit-summaries", label: "AI Summaries" },
      { id: "webhooks", label: "GitHub Webhooks" },
      { id: "author-analytics", label: "Author Analytics" },
    ],
  },
  {
    id: "meetings",
    label: "Meeting Synthesis",
    group: "Features",
    icon: Mic,
    sections: [
      { id: "upload", label: "Uploading Recordings" },
      { id: "transcription", label: "Transcription" },
      { id: "issue-extraction", label: "Issue Extraction" },
    ],
  },
  {
    id: "billing",
    label: "Billing & Credits",
    group: "Account",
    icon: CreditCard,
    sections: [
      { id: "credit-model", label: "Credit Model" },
      { id: "pricing", label: "Pricing" },
      { id: "top-up", label: "Topping Up" },
    ],
  },
];

// ─── Content map ──────────────────────────────────────────────────────────

const PAGE_CONTENT: Record<string, React.ReactNode> = {
  "getting-started": <GettingStartedPage />,
  "code-indexing": <CodeIndexingPage />,
  "codebase-qa": <CodebaseQAPage />,
  "commit-intelligence": <CommitIntelPage />,
  meetings: <MeetingsPage />,
  billing: <BillingPage />,
};

// ─── Root Component ───────────────────────────────────────────────────────

export default function DocumentationPage() {
  const [activeId, setActiveId] = useState("getting-started");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const activeItem = NAV_ITEMS.find((n) => n.id === activeId)!;

  // Filter nav based on search
  const filtered =
    search.trim() === ""
      ? NAV_ITEMS
      : NAV_ITEMS.filter(
          (n) =>
            n.label.toLowerCase().includes(search.toLowerCase()) ||
            n.group.toLowerCase().includes(search.toLowerCase()) ||
            n.sections.some((s) =>
              s.label.toLowerCase().includes(search.toLowerCase())
            )
        );

  // Group filtered items
  const groups = Array.from(new Set(filtered.map((n) => n.group)));

  // Scroll to top of content on page change
  const handleNav = useCallback(
    (id: string) => {
      setActiveId(id);
      setSidebarOpen(false);
      setActiveSectionId("");
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    []
  );

  // Intersection observer for in-page TOC
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const headings = el.querySelectorAll("h2[id], h3[id]");
    if (!headings.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveSectionId(visible.target.id);
      },
      { root: el, rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [activeId]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-foreground text-background shadow transition-transform group-hover:-rotate-6">
              <Logo width={18} height={18} />
            </span>
            <span className="text-sm font-semibold text-foreground">OwnYourCode</span>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">docs</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="https://github.com/agrim08/ownyourcode-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-90"
          >
            Dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* ── Body: sidebar + content + toc ────────────────────────────── */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* ── Left sidebar ──────────────────────────────────────────────── */}
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-20 bg-foreground/20 lg:hidden"
            />
          )}
        </AnimatePresence>

        <aside
          className={[
            "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-background pt-14 transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:pt-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {/* Search */}
          <div className="shrink-0 border-b border-border px-4 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search docs…"
                className="w-full rounded-md border border-border bg-muted py-2 pl-8 pr-3 text-xs text-foreground placeholder-zinc-600 outline-none transition-colors focus:border-zinc-600"
              />
            </div>
          </div>

          {/* Nav tree */}
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Documentation navigation">
            {filtered.length === 0 && (
              <p className="px-2 text-xs text-muted-foreground">No results</p>
            )}
            {groups.map((group) => (
              <div key={group} className="mb-5">
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group}
                </p>
                <ul className="space-y-0.5">
                  {filtered
                    .filter((n) => n.group === group)
                    .map((item) => {
                      const isActive = item.id === activeId;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => handleNav(item.id)}
                            className={[
                              "relative w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                              isActive
                                ? "bg-muted font-medium text-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            ].join(" ")}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="activeNavBar"
                                className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-foreground"
                                transition={{ type: "spring", stiffness: 380, damping: 36 }}
                              />
                            )}
                            <span className="ml-1">{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer links in sidebar */}
          <div className="shrink-0 border-t border-border px-4 py-3">
            <a
              href="https://github.com/agrim08/ownyourcode-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" /> View on GitHub
              <ExternalLink className="ml-auto h-3 w-3" />
            </a>
          </div>
        </aside>

        {/* ── Main content area ──────────────────────────────────────────── */}
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mx-auto max-w-3xl px-6 py-12 lg:px-12"
            >
              {/* Breadcrumb */}
              <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Docs</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-muted-foreground">{activeItem.group}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{activeItem.label}</span>
              </nav>

              {PAGE_CONTENT[activeId]}

              {/* Next / Prev */}
              <div className="mt-16 flex gap-4 border-t border-border pt-8">
                {NAV_ITEMS.findIndex((n) => n.id === activeId) > 0 && (
                  <button
                    onClick={() =>
                      handleNav(
                        NAV_ITEMS[
                          NAV_ITEMS.findIndex((n) => n.id === activeId) - 1
                        ]!.id
                      )
                    }
                    className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-border hover:bg-muted"
                  >
                    <span className="text-[10px] text-muted-foreground">← Previous</span>
                    <span className="text-sm font-medium text-foreground">
                      {
                        NAV_ITEMS[
                          NAV_ITEMS.findIndex((n) => n.id === activeId) - 1
                        ]!.label
                      }
                    </span>
                  </button>
                )}
                {NAV_ITEMS.findIndex((n) => n.id === activeId) <
                  NAV_ITEMS.length - 1 && (
                  <button
                    onClick={() =>
                      handleNav(
                        NAV_ITEMS[
                          NAV_ITEMS.findIndex((n) => n.id === activeId) + 1
                        ]!.id
                      )
                    }
                    className="ml-auto flex flex-col gap-1 rounded-lg border border-border px-4 py-3 text-right transition-colors hover:border-border hover:bg-muted"
                  >
                    <span className="text-[10px] text-muted-foreground">Next →</span>
                    <span className="text-sm font-medium text-foreground">
                      {
                        NAV_ITEMS[
                          NAV_ITEMS.findIndex((n) => n.id === activeId) + 1
                        ]!.label
                      }
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Right in-page TOC ─────────────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="sticky top-0 px-4 py-12">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              On this page
            </p>
            <ul className="space-y-1.5">
              {activeItem.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = contentRef.current?.querySelector(`#${s.id}`);
                      if (el)
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={[
                      "block text-xs leading-relaxed transition-colors",
                      activeSectionId === s.id
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Shared UI primitives ─────────────────────────────────────────────────

function DocHeading1({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h1
      id={id}
      className="mb-4 scroll-mt-8 text-3xl font-semibold tracking-tight text-foreground"
    >
      {children}
    </h1>
  );
}

function DocHeading2({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2
      id={id}
      className="mb-3 mt-12 scroll-mt-8 text-lg font-semibold text-foreground"
    >
      {children}
    </h2>
  );
}

function DocHeading3({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h3
      id={id}
      className="mb-2 mt-8 scroll-mt-8 text-base font-semibold text-foreground"
    >
      {children}
    </h3>
  );
}

function DocPara({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[15px] leading-7 text-muted-foreground">{children}</p>
  );
}

function DocList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="mb-4 space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-7 text-muted-foreground">
          <Circle className="mt-2 h-1.5 w-1.5 shrink-0 fill-zinc-600 text-muted-foreground" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DocCallout({
  type = "note",
  children,
}: {
  type?: "note" | "tip" | "warning";
  children: React.ReactNode;
}) {
  const styles = {
    note: "border-border bg-muted/60 text-muted-foreground",
    tip: "border-emerald-800/60 bg-emerald-950/40 text-emerald-300/80",
    warning: "border-amber-800/60 bg-amber-950/30 text-amber-300/80",
  };
  const labels = { note: "Note", tip: "Tip", warning: "Warning" };
  return (
    <div className={`my-6 rounded-lg border px-4 py-3.5 text-sm leading-relaxed ${styles[type]}`}>
      <span className="mr-2 font-semibold">{labels[type]}:</span>
      {children}
    </div>
  );
}

function CodeBlock({
  code,
  lang = "bash",
}: {
  code: string;
  lang?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative my-5 overflow-hidden rounded-xl border border-border bg-muted">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-[11px] font-medium text-muted-foreground">{lang}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Copy code"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="c"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-emerald-400"
              >
                <Check className="h-3 w-3" /> Copied
              </motion.span>
            ) : (
              <motion.span
                key="u"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <pre className="overflow-x-auto px-5 py-4 text-[13px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function StepList({
  steps,
}: {
  steps: { title: string; body: React.ReactNode }[];
}) {
  return (
    <ol className="my-6 space-y-6">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[11px] font-bold text-muted-foreground">
            {i + 1}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="mb-1.5 text-sm font-semibold text-foreground">{step.title}</p>
            <div className="text-[14px] leading-relaxed text-muted-foreground">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function PropTable({
  rows,
}: {
  rows: { name: string; type: string; desc: string }[];
}) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Field</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Type</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={`border-b border-border ${i % 2 === 0 ? "" : "bg-muted/20"}`}
            >
              <td className="px-4 py-3 font-mono text-[12px] text-foreground">{r.name}</td>
              <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{r.type}</td>
              <td className="px-4 py-3 text-[13px] text-muted-foreground">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page: Getting Started ────────────────────────────────────────────────

function GettingStartedPage() {
  return (
    <article>
      <DocHeading1 id="overview">Getting Started</DocHeading1>
      <DocPara>
        OwnYourCode connects to your GitHub repositories and gives you an
        AI-powered interface to understand, query, and review your codebase.
        You can ask questions in plain English, review commit summaries, and
        turn meeting audio into structured issues — all without leaving the
        platform.
      </DocPara>

      <DocCallout type="tip">
        New accounts receive <strong>150 free credits</strong> to index your
        first repository. No credit card required.
      </DocCallout>

      <DocHeading2 id="connect-repo">Connect a Repository</DocHeading2>
      <DocPara>
        After signing in, navigate to <strong>Create Project</strong> from the
        dashboard sidebar. Paste your GitHub repository URL and give the project
        a name.
      </DocPara>

      <StepList
        steps={[
          {
            title: "Sign in with Clerk",
            body: "Visit the sign-in page. Authentication is handled by Clerk — you can use GitHub OAuth or an email magic link.",
          },
          {
            title: "Create a new project",
            body: 'From the dashboard, click "Create Project". Enter the full GitHub URL of the repository you want to index.',
          },
          {
            title: "Confirm indexing",
            body: "Click Confirm. The indexing pipeline starts immediately. You will see a progress indicator in the sidebar — larger repositories may take a few minutes.",
          },
          {
            title: "Start querying",
            body: 'Once the status changes to "Completed", navigate to the Q&A tab and ask your first question.',
          },
        ]}
      />

      <DocCallout type="note">
        Private repositories are fully supported. We never store your raw
        source code — only vector embeddings are persisted after indexing.
      </DocCallout>

      <DocHeading2 id="first-index">Your First Index</DocHeading2>
      <DocPara>
        Indexing cost is <strong>1 credit per file</strong>. Before confirming,
        OwnYourCode shows you an estimate of total files in the repository so
        you can review credit usage up front.
      </DocPara>
      <DocPara>
        You can optionally enable <strong>Skip UI Components</strong> in project
        settings to ignore asset-heavy directories like{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] text-foreground">
          /public
        </code>{" "}
        or{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] text-foreground">
          /assets
        </code>
        , reducing cost significantly.
      </DocPara>

      <DocHeading2 id="local-setup">Local Development</DocHeading2>
      <DocPara>
        To run OwnYourCode locally, clone the repository and install
        dependencies:
      </DocPara>

      <CodeBlock lang="bash" code={`git clone https://github.com/agrim08/ownyourcode-ai.git
cd ownyourcode-ai
npm install`} />

      <DocPara>
        Copy the example environment file and fill in your API keys:
      </DocPara>

      <CodeBlock lang="bash" code={`cp .env.example .env`} />

      <DocPara>Push the Prisma schema to your database and start the server:</DocPara>

      <CodeBlock lang="bash" code={`npx prisma db push
npm run dev`} />

      <DocPara>
        Open{" "}
        <a
          href="http://localhost:3000"
          className="text-foreground underline underline-offset-2 hover:text-foreground"
        >
          http://localhost:3000
        </a>{" "}
        in your browser.
      </DocPara>
    </article>
  );
}

// ─── Page: Code Indexing ──────────────────────────────────────────────────

function CodeIndexingPage() {
  return (
    <article>
      <DocHeading1 id="how-it-works">Codebase Indexing</DocHeading1>
      <DocPara>
        The indexing pipeline converts your raw source files into a semantic
        vector store that the AI can query instantly. This process runs
        asynchronously in the background and updates automatically on every
        commit.
      </DocPara>

      <DocHeading2 id="chunking">File Chunking</DocHeading2>
      <DocPara>
        Each file is read and split into semantically meaningful chunks. Rather
        than splitting on arbitrary character counts, OwnYourCode uses
        structure-aware boundaries — function definitions, class declarations,
        and logical blocks are kept intact wherever possible.
      </DocPara>
      <DocPara>
        This means answers to questions like{" "}
        <em>"where is this function called?"</em> always return results with
        full context, not truncated snippets.
      </DocPara>

      <DocHeading2 id="embeddings">Vector Embeddings</DocHeading2>
      <DocPara>
        Each chunk is sent to the{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] text-foreground">
          gemini-embedding-004
        </code>{" "}
        model to produce a 768-dimensional float vector. These vectors are
        stored in a PostgreSQL database using the{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] text-foreground">
          pgvector
        </code>{" "}
        extension.
      </DocPara>

      <CodeBlock
        lang="prisma"
        code={`model SourceCodeEmbeddings {
  id                String                      @id @default(uuid())
  summaryEmbeddings Unsupported("vector(768)")?
  sourceCode        String
  fileName          String
  summary           String
  projectId         String
}`}
      />

      <DocHeading2 id="incremental">Incremental Sync</DocHeading2>
      <DocPara>
        After the initial index, OwnYourCode listens for GitHub webhooks on
        every push event. Only the files that were added, modified, or deleted
        in that commit are re-embedded — keeping credit usage low and the
        vector store always in sync.
      </DocPara>
      <DocPara>
        The last indexed commit SHA is stored in{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] text-foreground">
          lastIndexedCommitSha
        </code>{" "}
        on the project record. A sync operation re-checks this SHA against the
        current HEAD before deciding what to process.
      </DocPara>

      <DocCallout type="note">
        Incremental sync does <strong>not</strong> consume credits for files
        that were not touched in a push. Only changed files are re-embedded.
      </DocCallout>

      <PropTable
        rows={[
          { name: "PENDING", type: "IndexingStatus", desc: "Repository queued, not yet started." },
          { name: "INDEXING", type: "IndexingStatus", desc: "Pipeline is actively embedding files." },
          { name: "SYNCING", type: "IndexingStatus", desc: "Applying incremental changes from a new commit." },
          { name: "COMPLETED", type: "IndexingStatus", desc: "All files successfully embedded." },
          { name: "PARTIAL", type: "IndexingStatus", desc: "Completed with some files skipped due to rate limits." },
          { name: "FAILED", type: "IndexingStatus", desc: "Pipeline encountered a fatal error. Check indexingError field." },
        ]}
      />
    </article>
  );
}

// ─── Page: Codebase Q&A ───────────────────────────────────────────────────

function CodebaseQAPage() {
  return (
    <article>
      <DocHeading1 id="rag-overview">Codebase Q&A</DocHeading1>
      <DocPara>
        The Q&A interface lets you ask any question about your codebase in
        plain English. Answers are generated using a Retrieval-Augmented
        Generation (RAG) pipeline — meaning the AI only uses your actual code
        to respond, never generic assumptions.
      </DocPara>

      <DocHeading2 id="asking-questions">Asking Questions</DocHeading2>
      <DocPara>
        Navigate to the <strong>Q&A</strong> section of your project. Type a
        question in the input box and press Enter. Some effective question
        patterns:
      </DocPara>

      <DocList
        items={[
          "Where is user authentication handled?",
          "How does the billing credit system work?",
          "What happens when a new commit is pushed?",
          "Explain the meeting transcription flow.",
          "Where are environment variables validated?",
        ]}
      />

      <DocCallout type="tip">
        Be specific. Questions like "explain everything" yield generic answers.
        Questions scoped to a feature or flow return precise references.
      </DocCallout>

      <DocHeading2 id="file-references">File References</DocHeading2>
      <DocPara>
        Every answer includes the source files that were retrieved to generate
        it. These are displayed as clickable file chips below the response. You
        can click any chip to view the relevant chunk of that file in the code
        viewer panel.
      </DocPara>
      <DocPara>
        If an answer cites a file that seems unrelated, it usually means the
        embedding for that file is semantically close to your question — not
        that the AI hallucinated.
      </DocPara>

      <DocHeading2 id="conversation-history">Conversation History</DocHeading2>
      <DocPara>
        The Q&A session maintains conversation history within the same project
        context. You can ask follow-up questions naturally:
      </DocPara>

      <CodeBlock
        lang="text"
        code={`You: Where is the Clerk middleware configured?
AI: It's in src/middleware.ts, lines 12–34. The matcher…

You: And where does it redirect on auth failure?
AI: Still in src/middleware.ts — the redirect target is…`}
      />

      <DocPara>
        Saved questions appear in the <strong>Saved Q&A</strong> panel and are
        associated with the project, so your team can review them later.
      </DocPara>
    </article>
  );
}

// ─── Page: Commit Intelligence ────────────────────────────────────────────

function CommitIntelPage() {
  return (
    <article>
      <DocHeading1 id="commit-summaries">Commit Intelligence</DocHeading1>
      <DocPara>
        OwnYourCode automatically processes every commit pushed to your
        repository and generates a plain-English AI summary explaining what
        changed and why it matters.
      </DocPara>

      <DocHeading2 id="commit-summaries">AI Summaries</DocHeading2>
      <DocPara>
        When a webhook fires for a new push, the pipeline:
      </DocPara>

      <StepList
        steps={[
          {
            title: "Retrieves the diff",
            body: "We fetch the changed files and line-level diffs from the GitHub API using Octokit.",
          },
          {
            title: "Generates a summary",
            body: "The diff is sent to the Gemini API with a structured prompt that extracts the intent, affected areas, and potential impact of the change.",
          },
          {
            title: "Stores the commit record",
            body: "The summary, author, timestamp, and SHA are saved to the GitCommit table and displayed in your project's commit feed.",
          },
        ]}
      />

      <CodeBlock
        lang="prisma"
        code={`model GitCommit {
  id                 String    @id @default(uuid())
  commitMessage      String
  commitHash         String
  commitAuthorName   String
  commitDate         DateTime
  commitSummary      String    // AI-generated
  projectId          String
}`}
      />

      <DocHeading2 id="webhooks">GitHub Webhooks</DocHeading2>
      <DocPara>
        Commit summaries are driven by push webhooks from GitHub. When you
        create a project, OwnYourCode registers a webhook on the repository
        automatically (requires repository write access in your OAuth scope).
      </DocPara>
      <DocPara>
        Webhooks are processed asynchronously via{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] text-foreground">
          QStash
        </code>{" "}
        to avoid blocking the GitHub callback and to handle bursts of rapid
        pushes gracefully.
      </DocPara>

      <DocHeading2 id="author-analytics">Author Analytics</DocHeading2>
      <DocPara>
        The commit feed groups summaries by author and date, giving team leads
        a clear view of who changed what. Filter by date range or author name
        from the dashboard controls.
      </DocPara>
    </article>
  );
}

// ─── Page: Meetings ───────────────────────────────────────────────────────

function MeetingsPage() {
  return (
    <article>
      <DocHeading1 id="upload">Meeting Synthesis</DocHeading1>
      <DocPara>
        Upload recordings of standups, retros, or design reviews and
        OwnYourCode will transcribe them word-for-word, identify key decisions,
        and surface action items as structured issue tickets.
      </DocPara>

      <DocHeading2 id="upload">Uploading Recordings</DocHeading2>
      <DocPara>
        Supported formats: <strong>MP3, MP4, WAV, M4A</strong>. Navigate to
        the Meetings section of your project and click{" "}
        <strong>Upload Recording</strong>. Files are streamed directly to
        AssemblyAI — they are not stored on our servers.
      </DocPara>

      <DocCallout type="warning">
        Meetings consume <strong>15 credits per minute</strong> of audio
        processed. A 30-minute standup costs 450 credits.
      </DocCallout>

      <DocHeading2 id="transcription">Transcription</DocHeading2>
      <DocPara>
        Transcription is powered by AssemblyAI's Universal-2 model, which
        provides:
      </DocPara>

      <DocList
        items={[
          "Word-level timestamps for every spoken token",
          "Speaker diarization — sentences are attributed to distinct speakers",
          "Searchable transcript with timestamp-linked jumps",
          "High accuracy on technical vocabulary (function names, library names, etc.)",
        ]}
      />

      <DocPara>
        Processing typically completes in 20–40% of the recording's actual
        duration (a 10-minute meeting usually takes 2–4 minutes to transcribe).
      </DocPara>

      <DocHeading2 id="issue-extraction">Issue Extraction</DocHeading2>
      <DocPara>
        Once transcription finishes, the full transcript is sent to Gemini with
        a structured extraction prompt. The output is a set of issue tickets,
        each with:
      </DocPara>

      <PropTable
        rows={[
          { name: "headline", type: "string", desc: "Short, actionable title for the issue." },
          { name: "gist", type: "string", desc: "One-sentence summary of what needs to happen." },
          { name: "summary", type: "string", desc: "Full description with context from the meeting." },
          { name: "start", type: "string", desc: "Timestamp in the recording where this topic began." },
          { name: "end", type: "string", desc: "Timestamp where this topic concluded." },
        ]}
      />

      <DocPara>
        Issues are displayed in the Meeting detail view. Click any issue to
        jump to the relevant timestamp in the transcript player.
      </DocPara>
    </article>
  );
}

// ─── Page: Billing ────────────────────────────────────────────────────────

function BillingPage() {
  return (
    <article>
      <DocHeading1 id="credit-model">Billing & Credits</DocHeading1>
      <DocPara>
        OwnYourCode uses a pay-as-you-go credit system. There are no monthly
        subscriptions or seat licenses — you only pay for what you use.
      </DocPara>

      <DocHeading2 id="credit-model">Credit Model</DocHeading2>
      <DocPara>
        Credits are the currency for all AI operations on the platform. Every
        new account receives <strong>150 free credits</strong> on sign-up.
      </DocPara>

      <PropTable
        rows={[
          { name: "Index a file", type: "1 credit", desc: "Per file processed during initial indexing or re-sync." },
          { name: "Ask a Q&A question", type: "0 credits", desc: "Querying is always free — only indexing costs credits." },
          { name: "Transcribe meeting audio", type: "15 credits / min", desc: "Charged per minute of audio uploaded." },
          { name: "Incremental sync (unchanged file)", type: "0 credits", desc: "Files not touched in a commit are never re-charged." },
        ]}
      />

      <DocHeading2 id="pricing">Pricing</DocHeading2>
      <DocPara>
        Credits are priced at a flat rate of <strong>₹1 per credit</strong>. 
        There is no volume discount tier — the price is always the same 
        regardless of how many you purchase.
      </DocPara>

      <CodeBlock
        lang="text"
        code={`500 credits  →  ₹500
1,000 credits →  ₹1,000
5,000 credits →  ₹5,000`}
      />

      <DocHeading2 id="top-up">Topping Up</DocHeading2>
      <DocPara>
        Purchase credits from the <strong>Billing</strong> page in your
        account settings. Payment is processed through PayPal — credit card,
        PayPal balance, and UPI are all supported.
      </DocPara>

      <StepList
        steps={[
          {
            title: "Navigate to Billing",
            body: 'Open the sidebar, click your account name, then select "Billing".',
          },
          {
            title: "Choose an amount",
            body: "Enter the number of credits you want to purchase. The INR equivalent is shown in real-time.",
          },
          {
            title: "Complete payment",
            body: "Click Pay with PayPal. After approval, credits are added to your balance immediately.",
          },
        ]}
      />

      <DocCallout type="note">
        Credits never expire. Unused credits roll over indefinitely.
      </DocCallout>
    </article>
  );
}
