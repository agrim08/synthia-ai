import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/server/db";
import { checkCredits } from "@/lib/githubRepoLoader";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "synthia-internal";
const APP_URL =
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

import { indexGithubRepo } from "@/lib/githubRepoLoader";
import { pollCommits } from "@/lib/github";

/** Fire-and-forget indexing */
async function triggerBackgroundIndexing(
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) {
  console.log(
    `[triggerIndexing] Starting background indexing for project=${projectId}`,
  );

  // Set status immediately so polling finds something
  await (db.project as any)
    .update({
      where: { id: projectId },
      data: { indexingStatus: "INDEXING", indexingError: null },
    })
    .catch((e: any) => console.error("Status update failed", e));

  // Run in background (do NOT await)
  void (async () => {
    try {
      // 1. Commits
      await pollCommits(projectId).catch((err) => {
        console.warn(`[triggerIndexing] pollCommits non-fatal error:`, err);
      });

      // 2. Code indexing
      await indexGithubRepo(projectId, githubUrl, githubToken);

      console.log(`[triggerIndexing] DONE project=${projectId}`);
    } catch (err: any) {
      console.error(
        `[triggerIndexing] FATAL error for project=${projectId}:`,
        err,
      );
      await (db.project as any)
        .update({
          where: { id: projectId },
          data: {
            indexingStatus: "FAILED",
            indexingError: err?.message ?? String(err),
          },
        })
        .catch(() => {});
    }
  })();
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

      const existingUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId! },
        select: { credits: true },
      });

      if (!existingUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
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

      // Kick off background indexing – does NOT block the response
      void triggerBackgroundIndexing(
        project.id,
        input.githubUrl,
        input.githubToken,
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
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: {
          indexingStatus: true,
          indexingProgress: true,
          indexingTotal: true,
          indexingError: true,
          indexedAt: true,
        } as any,
      });
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      return project;
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

      const { githubUrl } = link.project as any;
      void triggerBackgroundIndexing(input.projectId, githubUrl);
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          projectId: input.projectId,
          question: input.question,
          filesReferences: input.filesReferences,
          userId: ctx.user.userId,
          answer: input.answer,
        },
      });
    }),

  getQuestions: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
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
    .query(({ ctx, input }) => {
      return db.meeting.findMany({
        where: { projectId: input.projectId },
        include: { issues: true },
      });
    }),

  deleteMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.meeting.delete({ where: { id: input.meetingId } });
    }),

  getMeetingById: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findUnique({
        where: { id: input.meetingId },
        include: { issues: true },
      });
    }),

  archiveProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.project.update({
        where: { id: input.projectId },
        data: { deletedAt: new Date() },
      });
    }),

  getTeamMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: { projectId: input.projectId },
        include: { user: true },
      });
    }),

  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.user.userId },
      select: { credits: true },
    });
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
});
