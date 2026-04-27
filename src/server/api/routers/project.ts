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

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "synthia-internal";
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
      const fileCount = await checkCredits(
        input.githubUrl,
        input.githubToken,
        input.skipUiComponents,
      );
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

      if (!project?.githubUrl) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
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
        return await ctx.db.gitCommit.findMany({
          where: { projectId: input.projectId },
        });
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

  archiveProject: protectedProcedure
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

      return await ctx.db.project.update({
        where: { id: input.projectId },
        data: { deletedAt: new Date() },
      });
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
      const fileCount = await checkCredits(input.githubUrl, input.githubToken, input.skipUiComponents);
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

