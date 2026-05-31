import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "octokit";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/server/db";
import {
  checkCredits,
  getDefaultBranchHeadSha,
  parseGithubRepoUrl,
} from "@/lib/githubRepoLoader";
import { enqueueJob } from "@/lib/qstash";
import { backfillCommitSummaries } from "@/lib/github";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "ownyourcode-internal";
const APP_URL =
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

/**
 * Use the incoming request Host (tRPC) so internal fetch hits the same dev port / domain
 * as the browser. Fallback APP_URL often breaks local dev (wrong port or 127.0.0.1 vs localhost).
 */
function resolvePublicOrigin(headers: Headers | undefined): string {
  if (!headers) return APP_URL;
  const rawHost =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headers.get("host") ??
    "";
  if (!rawHost) return APP_URL;
  let proto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (!proto) {
    proto =
      rawHost.startsWith("localhost") || rawHost.startsWith("127.")
        ? "http"
        : "https";
  }
  return `${proto}://${rawHost}`;
}

/**
 * Enqueue a background index job via QStash (prod) or direct fetch (dev).
 * MUST be awaited so the job is guaranteed enqueued before the Lambda returns.
 */
async function triggerBackgroundIndexing(
  projectId: string,
  githubUrl: string,
  githubToken?: string,
  origin: string = APP_URL,
) {
  console.log(`[triggerIndexing] Enqueuing background indexing for project=${projectId}`);
  await enqueueJob(
    `${origin}/api/index-project`,
    { projectId, githubUrl, githubToken },
    { retries: 3 },
  );
}

/**
 * Enqueue a background sync job via QStash (prod) or direct fetch (dev).
 * MUST be awaited so the job is guaranteed enqueued before the Lambda returns.
 */
async function triggerBackgroundSync(
  projectId: string,
  githubUrl: string,
  githubToken?: string,
  origin: string = APP_URL,
) {
  console.log(`[triggerSync] Enqueuing background sync for project=${projectId}`);
  await enqueueJob(
    `${origin}/api/sync-repo`,
    { projectId, githubUrl, githubToken },
    { retries: 3 },
  );
}

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
        skipUiComponents: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(
        `[createProject] START — name: "${input.name}", url: ${input.githubUrl}`,
      );

      let existingUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId! },
        select: { credits: true },
      });

      if (!existingUser) {
        // Fallback: upsert the user from Clerk if they bypassed /sync-user
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(ctx.user.userId!);
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (!userEmail) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        const newUser = await ctx.db.user.upsert({
          where: { emailAddress: userEmail },
          update: {
            imageUrl: clerkUser.imageUrl,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
          },
          create: {
            id: ctx.user.userId!,
            emailAddress: userEmail,
            imageUrl: clerkUser.imageUrl,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            credits: 150,
          },
        });
        
        existingUser = { credits: newUser.credits };
      }

      console.log(
        `[createProject] Checking credits for repo... (skipUi=${input.skipUiComponents})`,
      );
      let fileCount = 0;
      try {
        fileCount = await checkCredits(
          input.githubUrl,
          input.githubToken,
          input.skipUiComponents,
        );
      } catch (err: any) {
        console.error(`[createProject] checkCredits failed:`, err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to access the GitHub repository. Make sure the URL is correct, and if it is private, provide a valid GitHub Token. Original error: ${err.message}`,
        });
      }
      const currentCredits = existingUser.credits || 0;
      console.log(
        `[createProject] fileCount=${fileCount}, userCredits=${currentCredits}`,
      );

      if (fileCount > currentCredits) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient credits",
        });
      }

      // Create project immediately (so user can navigate to it)
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl,
          name: input.name,
          skipUiComponents: !!input.skipUiComponents,
          indexingStatus: "INDEXING", // Start in INDEXING mode right away
        } as any,
      });
      console.log(`[createProject] Project created — id: ${project.id}`);

      await ctx.db.userToProject.create({
        data: {
          userId: ctx.user.userId!,
          projectId: project.id,
        },
      });

      // Deduct credits right away (before indexing, so no exploit window)
      await ctx.db.user.update({
        where: { id: ctx.user.userId! },
        data: { credits: { decrement: fileCount } },
      });
      console.log(`[createProject] Credits decremented by ${fileCount}`);

      // Kick off background indexing — awaited so QStash ACK happens before Lambda returns
      await triggerBackgroundIndexing(
        project.id,
        input.githubUrl,
        input.githubToken,
        resolvePublicOrigin(ctx.headers),
      );

      console.log(
        `[createProject] Background indexing scheduled. Returning project immediately.`,
      );
      return project;
    }),

  // ------------------------------------------------------------------
  // Create a project from a ZIP upload (no GitHub URL needed)
  // ------------------------------------------------------------------
  createZipProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        fileCount: z.number().int().positive(),
        skipUiComponents: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(`[createZipProject] START — name: "${input.name}", fileCount: ${input.fileCount}`);

      let existingUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId! },
        select: { credits: true },
      });

      if (!existingUser) {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(ctx.user.userId!);
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
        if (!userEmail) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        const newUser = await ctx.db.user.upsert({
          where: { emailAddress: userEmail },
          update: { imageUrl: clerkUser.imageUrl, firstName: clerkUser.firstName, lastName: clerkUser.lastName },
          create: {
            id: ctx.user.userId!,
            emailAddress: userEmail,
            imageUrl: clerkUser.imageUrl,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            credits: 150,
          },
        });
        existingUser = { credits: newUser.credits };
      }

      const currentCredits = existingUser.credits ?? 0;
      if (input.fileCount > currentCredits) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient credits" });
      }

      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: "",
          skipUiComponents: !!input.skipUiComponents,
          indexingStatus: "PENDING",
          indexingTotal: input.fileCount,
        } as any,
      });
      console.log(`[createZipProject] Project created — id: ${project.id}`);

      await ctx.db.userToProject.create({
        data: { userId: ctx.user.userId!, projectId: project.id },
      });

      // Deduct credits immediately to prevent exploit window
      await ctx.db.user.update({
        where: { id: ctx.user.userId! },
        data: { credits: { decrement: input.fileCount } },
      });
      console.log(`[createZipProject] Credits decremented by ${input.fileCount}`);

      return project;
    }),

  // ------------------------------------------------------------------
  // Status polling – used by the UI to show the indexing progress bar
  // ------------------------------------------------------------------
  getProjectStatus: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: {
          indexingStatus: true,
          indexingProgress: true,
          indexingTotal: true,
          indexingError: true,
          indexedAt: true,
          syncState: true,
          updatedAt: true,
          githubUrl: true,
        } as any,
      });
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      const p = project as any;
      return {
        indexingStatus: p.indexingStatus,
        indexingProgress: p.indexingProgress,
        indexingTotal: p.indexingTotal,
        indexingError: p.indexingError,
        indexedAt: p.indexedAt,
        hasSyncCheckpoint: p.syncState != null,
        updatedAt: p.updatedAt,
        githubUrl: p.githubUrl,
      };
    }),

  /**
   * Cheap HEAD check vs lastIndexedCommitSha; kicks /api/sync-repo when the remote is ahead.
   * Call on a long interval (e.g. 90s) from the dashboard — avoids polling GitHub too often.
   */
  syncRepoIfBehind: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      const project = (await ctx.db.project.findUnique({
        where: { id: input.projectId },
      })) as any;

      // ZIP-uploaded projects have no githubUrl — skip sync gracefully
      if (!project?.githubUrl) {
        return { action: "skipped" as const, reason: "zip_project" };
      }

      if (
        project.indexingStatus === "PENDING" ||
        project.indexingStatus === "INDEXING"
      ) {
        return { action: "skipped" as const, reason: "indexing" };
      }

      if (project.indexingStatus === "FAILED") {
        return { action: "skipped" as const, reason: "failed" };
      }

      if (
        !project.lastIndexedCommitSha &&
        project.indexingStatus === "PARTIAL" &&
        project.syncState == null
      ) {
        return { action: "skipped" as const, reason: "initial_partial" };
      }

      const parsed = parseGithubRepoUrl(project.githubUrl);
      if (!parsed) {
        return { action: "skipped" as const, reason: "bad_url" };
      }

      let headSha: string;
      try {
        const octokit = new Octokit({
          auth: process.env.GITHUB_TOKEN,
        });
        const r = await getDefaultBranchHeadSha(octokit, parsed.owner, parsed.repo);
        headSha = r.sha;
      } catch {
        return { action: "skipped" as const, reason: "github" };
      }

      const ahead =
        !project.lastIndexedCommitSha ||
        project.lastIndexedCommitSha !== headSha ||
        project.syncState != null;

      if (!ahead) {
        return { action: "current" as const };
      }

      await triggerBackgroundSync(
        input.projectId,
        project.githubUrl,
        undefined,
        resolvePublicOrigin(ctx.headers),
      );
      return { action: "scheduled" as const };
    }),

  // ------------------------------------------------------------------
  // Re-trigger indexing (resume from checkpoint after a PARTIAL/FAILED run)
  // ------------------------------------------------------------------
  retriggerIndexing: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns this project
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
        include: { project: true },
      });

      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      const proj = link.project as any;
      const { githubUrl } = proj;
      const origin = resolvePublicOrigin(ctx.headers);

      // ZIP-uploaded projects cannot be re-indexed via the GitHub pipeline
      if (!githubUrl) {
        return { scheduled: false, reason: "zip_project" };
      }

      if (proj.syncState != null) {
        await triggerBackgroundSync(input.projectId, githubUrl, undefined, origin);
      } else {
        await triggerBackgroundIndexing(input.projectId, githubUrl, undefined, origin);
      }
      return { scheduled: true };
    }),

  // ------------------------------------------------------------------
  // Existing procedures (unchanged)
  // ------------------------------------------------------------------
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.project.findMany({
        where: {
          userToProjects: { some: { userId: ctx.user.userId! } },
          deletedAt: null,
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error fetching projects",
        cause: error,
      });
    }
  }),

  // ------------------------------------------------------------------
  // Project Intelligence — derived from already-indexed data (zero AI calls)
  // ------------------------------------------------------------------
  getProjectIntelligence: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      // Fetch all indexed file names and summaries for this project
      const embeddings = await ctx.db.sourceCodeEmbeddings.findMany({
        where: { projectId: input.projectId },
        select: { fileName: true, summary: true },
      });

      // ── 1. Languages ──────────────────────────────────────────────
      const EXT_TO_LANG: Record<string, string> = {
        ".ts": "TypeScript", ".tsx": "TypeScript", ".js": "JavaScript", ".jsx": "JavaScript",
        ".py": "Python", ".rb": "Ruby", ".go": "Go", ".rs": "Rust", ".java": "Java",
        ".kt": "Kotlin", ".swift": "Swift", ".cs": "C#", ".cpp": "C++", ".c": "C",
        ".php": "PHP", ".dart": "Dart", ".scala": "Scala", ".r": "R",
        ".css": "CSS", ".scss": "SCSS", ".less": "LESS", ".sass": "Sass",
        ".html": "HTML", ".vue": "Vue", ".svelte": "Svelte",
        ".sql": "SQL", ".prisma": "Prisma", ".graphql": "GraphQL", ".gql": "GraphQL",
        ".sh": "Shell", ".bash": "Shell", ".zsh": "Shell",
        ".dockerfile": "Docker", ".tf": "Terraform",
        ".lua": "Lua", ".ex": "Elixir", ".exs": "Elixir", ".erl": "Erlang",
        ".zig": "Zig", ".nim": "Nim", ".clj": "Clojure",
      };
      const SPECIAL_FILES: Record<string, string> = {
        "dockerfile": "Docker", "makefile": "Make", "cmakelists.txt": "CMake",
        "gemfile": "Ruby", "cargo.toml": "Rust", "go.mod": "Go",
      };
      const EXCLUDE_LANGS = new Set(["JSON", "YAML", "TOML", "Markdown", "MDX"]);

      const langCounts = new Map<string, number>();
      for (const emb of embeddings) {
        const name = emb.fileName.toLowerCase();
        const baseName = name.split("/").pop() || "";
        const ext = "." + baseName.split(".").pop();

        if (SPECIAL_FILES[baseName]) {
          const lang = SPECIAL_FILES[baseName]!;
          if (!EXCLUDE_LANGS.has(lang)) langCounts.set(lang, (langCounts.get(lang) || 0) + 1);
          continue;
        }
        if (EXT_TO_LANG[ext]) {
          const lang = EXT_TO_LANG[ext]!;
          if (!EXCLUDE_LANGS.has(lang)) langCounts.set(lang, (langCounts.get(lang) || 0) + 1);
        }
      }
      const languages = [...langCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([lang]) => lang)
        .slice(0, 6);

      // ── 2. Architecture ───────────────────────────────────────────
      const allFileNamesStr = embeddings.map((e) => e.fileName.toLowerCase()).join(" ");
      let architecture = "Software Project";
      const ARCH_PATTERNS: [string[], string][] = [
        [["next.config"], "Next.js App"],
        [["nuxt.config"], "Nuxt.js App"],
        [["vite.config"], "Vite App"],
        [["angular.json"], "Angular App"],
        [["svelte.config"], "SvelteKit App"],
        [["remix.config"], "Remix App"],
        [["gatsby-config"], "Gatsby App"],
        [["astro.config"], "Astro App"],
        [["cargo.toml"], "Rust Project"],
        [["go.mod"], "Go Project"],
        [["pubspec.yaml"], "Flutter App"],
        [["manage.py", "settings.py"], "Django App"],
        [["app.py", "flask"], "Flask API"],
      ];
      for (const [patterns, arch] of ARCH_PATTERNS) {
        if (patterns.some((p) => allFileNamesStr.includes(p))) {
          architecture = arch;
          break;
        }
      }
      if (architecture === "Next.js App") {
        if (allFileNamesStr.includes("app/") && allFileNamesStr.includes("layout")) {
          architecture = "Next.js App Router";
        } else if (allFileNamesStr.includes("pages/")) {
          architecture = "Next.js Pages Router";
        }
      }

      // ── 3. Topics ─────────────────────────────────────────────────
      const TOPIC_CLUSTERS = [
        { name: "Authentication & Security", keywords: ["auth", "login", "signup", "session", "jwt", "token", "clerk", "passport", "oauth", "protected", "permission", "guard"], description: "User identity management, session handling, and secure access control.", promptTemplate: "Explain how authentication and security are implemented in this repository.", icon: "Lock" },
        { name: "Database & ORM", keywords: ["database", "prisma", "schema", "model", "migration", "sql", "postgres", "mongo", "mongoose", "drizzle", "sequelize", "supabase", "neon"], description: "Data models, schema design, queries, and database layer abstractions.", promptTemplate: "Explain the database design, schema models, and relationships in this repository.", icon: "Database" },
        { name: "API Layer", keywords: ["api", "route", "endpoint", "trpc", "rest", "graphql", "controller", "handler", "server action"], description: "Server-side endpoints, request handling, and client-server communication.", promptTemplate: "Explain the API layer design and how client-server communication is handled.", icon: "Terminal" },
        { name: "UI Components", keywords: ["component", "button", "modal", "dialog", "form", "layout", "sidebar", "navbar", "header", "card", "dropdown", "toast", "ui"], description: "Reusable interface components, layout patterns, and design system elements.", promptTemplate: "Explain the UI component architecture and design system in this codebase.", icon: "Layers" },
        { name: "State Management", keywords: ["state", "store", "redux", "zustand", "context", "provider", "atom", "recoil", "jotai", "mobx"], description: "Client-side state patterns, stores, and data flow management.", promptTemplate: "Explain the state management approach and data flow patterns used.", icon: "Cpu" },
        { name: "Testing", keywords: ["test", "spec", "jest", "vitest", "cypress", "playwright", "mocha", "assert", "mock", "fixture", "e2e"], description: "Testing strategies including unit, integration, and end-to-end test coverage.", promptTemplate: "Explain the testing strategy and test coverage in this project.", icon: "CheckCircle" },
        { name: "Background Jobs", keywords: ["queue", "worker", "cron", "job", "background", "qstash", "bull", "celery", "webhook", "poll", "async"], description: "Asynchronous processing, scheduled tasks, and event-driven workflows.", promptTemplate: "Explain how background jobs and async processing are structured.", icon: "Zap" },
        { name: "Deployment & DevOps", keywords: ["deploy", "docker", "ci", "cd", "vercel", "aws", "terraform", "kubernetes", "nginx", "pipeline"], description: "Build pipelines, deployment workflows, and infrastructure configuration.", promptTemplate: "Explain the deployment and DevOps setup in this project.", icon: "Cloud" },
        { name: "Error Handling", keywords: ["error", "exception", "catch", "sentry", "logging", "log", "monitor", "boundary", "fallback", "retry"], description: "Error boundaries, exception handling, logging, and monitoring setup.", promptTemplate: "Explain the error handling and monitoring strategy in this codebase.", icon: "AlertTriangle" },
        { name: "Payments & Billing", keywords: ["payment", "stripe", "paypal", "billing", "subscription", "checkout", "credit", "transaction"], description: "Payment processing, subscription logic, and billing integrations.", promptTemplate: "Explain the payment and billing system implementation.", icon: "CreditCard" },
        { name: "Real-time Features", keywords: ["websocket", "socket", "realtime", "sse", "push", "notification", "stream", "channel"], description: "Live data streaming, WebSocket connections, and push notifications.", promptTemplate: "Explain the real-time features and live data handling.", icon: "Radio" },
        { name: "Search & Indexing", keywords: ["search", "index", "elastic", "algolia", "vector", "embedding", "similarity", "rank"], description: "Search functionality, indexing pipelines, and content discovery.", promptTemplate: "Explain the search and indexing implementation.", icon: "Search" },
        { name: "File Handling", keywords: ["upload", "file", "image", "storage", "s3", "bucket", "blob", "media", "asset"], description: "File uploads, storage management, and media processing pipelines.", promptTemplate: "Explain the file handling and storage setup.", icon: "FileCode" },
        { name: "AI & Machine Learning", keywords: ["ai", "gemini", "openai", "gpt", "llm", "embedding", "prediction", "inference", "prompt", "generate"], description: "AI integrations, model inference, and machine learning pipelines.", promptTemplate: "Explain the AI/ML integration and how models are used.", icon: "Sparkles" },
        { name: "Styling & Theming", keywords: ["tailwind", "css", "theme", "dark mode", "style", "responsive", "animation", "design token"], description: "Styling architecture, theming system, and responsive design tokens.", promptTemplate: "Explain the styling architecture and theming approach.", icon: "Palette" },
      ];

      const allText = embeddings.map((e) => `${e.fileName} ${e.summary}`.toLowerCase());
      const topicScores: { name: string; description: string; prompt: string; fileCount: number; icon: string; score: number }[] = [];

      for (const cluster of TOPIC_CLUSTERS) {
        let score = 0;
        let fileCount = 0;
        for (const text of allText) {
          const matches = cluster.keywords.filter((kw) => text.includes(kw)).length;
          if (matches > 0) { score += matches; fileCount++; }
        }
        if (fileCount >= 1) {
          topicScores.push({ name: cluster.name, description: cluster.description, prompt: cluster.promptTemplate, fileCount, icon: cluster.icon, score });
        }
      }
      topicScores.sort((a, b) => b.score - a.score);
      const discoveredTopics = topicScores.slice(0, 8);

      // ── 4. Suggested Interview Questions ──────────────────────────
      const TOPIC_QUESTIONS: Record<string, { questions: string[]; difficulty: string }> = {
        "Authentication & Security": { questions: ["How is user authentication implemented and what security measures protect routes?", "What happens when a user session expires mid-request?"], difficulty: "Advanced" },
        "Database & ORM": { questions: ["How is database schema typesafety maintained between the ORM and the application?", "What migration strategy is used and how are schema changes rolled out?"], difficulty: "Intermediate" },
        "API Layer": { questions: ["Why was this API framework chosen over alternatives and what are its trade-offs?", "How does the API layer handle validation and error responses?"], difficulty: "Intermediate" },
        "UI Components": { questions: ["How are UI components structured for reusability and consistency?", "What design system patterns are used for styling?"], difficulty: "Beginner" },
        "State Management": { questions: ["How is client state synchronized with server state?", "What patterns prevent stale data and unnecessary re-renders?"], difficulty: "Advanced" },
        "Background Jobs": { questions: ["How do background jobs handle failures, retries, and idempotency?", "What prevents race conditions in the async processing pipeline?"], difficulty: "Advanced" },
        "Testing": { questions: ["What testing strategy is used and how is coverage measured?", "How are integration tests structured across service boundaries?"], difficulty: "Intermediate" },
        "Error Handling": { questions: ["How are errors captured and surfaced to the development team?", "What happens when an unhandled error occurs in production?"], difficulty: "Intermediate" },
        "Payments & Billing": { questions: ["How is payment processing handled and what prevents double-charging?", "How are subscription state transitions managed?"], difficulty: "Advanced" },
        "AI & Machine Learning": { questions: ["How are AI model calls optimized for cost and latency?", "What fallback strategies exist when the AI service is unavailable?"], difficulty: "Advanced" },
      };

      const suggestedQuestions: { question: string; difficulty: string }[] = [];
      for (const topic of discoveredTopics.slice(0, 6)) {
        const qSet = TOPIC_QUESTIONS[topic.name];
        if (qSet) {
          for (const q of qSet.questions) {
            suggestedQuestions.push({ question: q, difficulty: qSet.difficulty });
          }
        }
      }

      // ── 5. Recommended Next Step ──────────────────────────────────
      const topTopic = discoveredTopics[0];
      const recommendedTopic = topTopic
        ? { title: `Practice ${topTopic.name} Questions`, description: `Test your understanding of ${topTopic.name.toLowerCase()} patterns and decisions in this codebase.`, prompt: topTopic.prompt, estTime: Math.max(5, Math.min(15, topTopic.fileCount)) }
        : { title: "Explore Your Codebase", description: "Start asking questions about your repository to understand its architecture.", prompt: "Give me an overview of this codebase architecture and key design decisions.", estTime: 5 };

      // ── 6. Complexity ─────────────────────────────────────────────
      const totalFiles = embeddings.length;
      const uniqueDirs = new Set(embeddings.map((e) => e.fileName.split("/").slice(0, -1).join("/"))).size;
      const complexityScore = totalFiles * 1 + uniqueDirs * 2 + languages.length * 3;
      const complexity = complexityScore < 30 ? "Low" : complexityScore < 80 ? "Medium" : complexityScore < 200 ? "High" : "Enterprise";

      // ── 7. Learn Mode Suggestions ─────────────────────────────────
      const learnSuggestions = discoveredTopics.slice(0, 4).map((t) => `Explain the ${t.name.toLowerCase()} in this codebase`);
      const fallbackSuggestions = ["Give me an overview of this codebase", "Explain the main architecture", "What are the key design patterns used?", "How is the project structured?"];
      while (learnSuggestions.length < 4) learnSuggestions.push(fallbackSuggestions[learnSuggestions.length]!);

      // ── 8. Interview Categories ───────────────────────────────────
      const interviewCategories = discoveredTopics.slice(0, 6).map((t) => ({
        name: t.name.split("&")[0]!.trim().split(" ")[0]!,
        prompt: `Start a mock interview focusing on the ${t.name.toLowerCase()} in this project.`,
        icon: t.icon,
      }));
      const fallbackCategories = [
        { name: "Architecture", prompt: "Start a mock interview focusing on the overall architecture.", icon: "Layers" },
        { name: "Performance", prompt: "Start a mock interview focusing on performance optimization.", icon: "Zap" },
        { name: "Quality", prompt: "Start a mock interview focusing on code quality.", icon: "CheckCircle" },
        { name: "Scalability", prompt: "Start a mock interview focusing on scaling.", icon: "Cloud" },
        { name: "Testing", prompt: "Start a mock interview focusing on testing strategy.", icon: "CheckCircle" },
        { name: "Security", prompt: "Start a mock interview focusing on security.", icon: "Lock" },
      ];
      while (interviewCategories.length < 6) interviewCategories.push(fallbackCategories[interviewCategories.length]!);

      return { languages, architecture, topics: discoveredTopics, suggestedQuestions: suggestedQuestions.slice(0, 6), recommendedTopic, complexity, learnSuggestions, interviewCategories };
    }),

  getCommits: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      try {
        const commits = await ctx.db.gitCommit.findMany({
          where: { projectId: input.projectId },
        });

        // Fire-and-forget: backfill any commits that have empty AI summaries
        const hasEmpty = commits.some((c) => c.commitSummary === "");
        if (hasEmpty) {
          backfillCommitSummaries(input.projectId).catch((err) =>
            console.warn(`[getCommits] backfill error (non-fatal):`, err),
          );
        }

        return commits;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching commits",
          cause: error,
        });
      }
    }),

  saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        filesReferences: z.any(),
        answer: z.string(),
        messages: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      return await ctx.db.question.create({
        data: {
          projectId: input.projectId,
          question: input.question,
          filesReferences: input.filesReferences,
          userId: ctx.user.userId,
          answer: input.answer,
          messages: input.messages ?? "[]",
        },
      });
    }),

  getQuestions: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      return await ctx.db.question.findMany({
        where: { projectId: input.projectId },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  getAllQuestions: protectedProcedure
    .query(async ({ ctx }) => {
      // Find all projects user has access to
      const links = await ctx.db.userToProject.findMany({
        where: { userId: ctx.user.userId! },
        select: { projectId: true, project: { select: { name: true } } },
      });
      
      const projectIds = links.map(l => l.projectId);
      const projectMap = links.reduce((acc, curr) => {
        acc[curr.projectId] = curr.project.name;
        return acc;
      }, {} as Record<string, string>);

      const questions = await ctx.db.question.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { createdAt: "desc" },
      });

      return questions.map(q => ({
        ...q,
        projectName: projectMap[q.projectId] || "Unknown Project"
      }));
    }),

  uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      return await db.meeting.create({
        data: {
          projectId: input.projectId,
          meetingUrl: input.meetingUrl,
          name: input.name,
          status: "PROCESSING",
        },
      });
    }),

  getMeetings: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      return db.meeting.findMany({
        where: { projectId: input.projectId },
        include: { issues: true },
      });
    }),

  deleteMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.findUnique({
        where: { id: input.meetingId },
      });
      if (!meeting) throw new TRPCError({ code: "NOT_FOUND" });

      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: meeting.projectId,
          },
        },
      });
      if (!link) throw new TRPCError({ code: "FORBIDDEN" });

      return await ctx.db.meeting.delete({ where: { id: input.meetingId } });
    }),

  getMeetingById: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.findUnique({
        where: { id: input.meetingId },
        include: { issues: true },
      });
      if (!meeting) throw new TRPCError({ code: "NOT_FOUND" });

      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: meeting.projectId,
          },
        },
      });
      if (!link) throw new TRPCError({ code: "FORBIDDEN" });

      return meeting;
    }),

  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      // Cascade delete everything related to the project in a transaction
      await ctx.db.$transaction([
        ctx.db.issue.deleteMany({
          where: { meeting: { projectId: input.projectId } },
        }),
        ctx.db.meeting.deleteMany({
          where: { projectId: input.projectId },
        }),
        ctx.db.question.deleteMany({
          where: { projectId: input.projectId },
        }),
        ctx.db.gitCommit.deleteMany({
          where: { projectId: input.projectId },
        }),
        ctx.db.sourceCodeEmbeddings.deleteMany({
          where: { projectId: input.projectId },
        }),
        ctx.db.userToProject.deleteMany({
          where: { projectId: input.projectId },
        }),
        ctx.db.project.delete({
          where: { id: input.projectId },
        }),
      ]);

      return { success: true };
    }),

  getTeamMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: input.projectId,
          },
        },
      });
      if (!link) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      return await ctx.db.userToProject.findMany({
        where: { projectId: input.projectId },
        include: { user: true },
      });
    }),

  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.userId },
      select: { credits: true },
    });
    return { credits: user?.credits ?? 0 };
  }),

  checkCreditNeeded: protectedProcedure
    .input(
      z.object({
        githubUrl: z.string(),
        githubToken: z.string().optional(),
        skipUiComponents: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let fileCount = 0;
      try {
        fileCount = await checkCredits(input.githubUrl, input.githubToken, input.skipUiComponents);
      } catch (err: any) {
        console.error(`[checkCreditNeeded] checkCredits failed:`, err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to access the GitHub repository. Make sure the URL is correct, and if it is private, provide a valid GitHub Token. Original error: ${err.message}`,
        });
      }
      const userCredits = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId },
        select: { credits: true },
      });
      return { fileCount, userCredits: userCredits?.credits || 0 };
    }),

  deleteQuestion: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.questionId },
      });
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: question.projectId,
          },
        },
      });
      if (!link) throw new TRPCError({ code: "FORBIDDEN" });

      return await ctx.db.question.delete({
        where: { id: input.questionId },
      });
    }),

  getQuestionById: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.questionId },
        include: { user: true },
      });
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: question.projectId,
          },
        },
      });
      if (!link) throw new TRPCError({ code: "FORBIDDEN" });

      return question;
    }),

  updateQuestion: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        messages: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.questionId },
      });
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const link = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: ctx.user.userId!,
            projectId: question.projectId,
          },
        },
      });
      if (!link) throw new TRPCError({ code: "FORBIDDEN" });

      return await ctx.db.question.update({
        where: { id: input.questionId },
        data: {
          messages: input.messages,
        },
      });
    }),
});

