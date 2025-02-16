import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/server/db";
import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/githubRepoLoader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId! },
        select: { credits: true },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const fileCount = await checkCredits(input.githubUrl, input.githubToken);
      const currentCredits = existingUser.credits || 0;

      if (fileCount > currentCredits) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient credits",
        });
      }

      // Create the project.
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl,
          name: input.name,
        },
      });

      await ctx.db.userToProject.create({
        data: {
          userId: ctx.user.userId!,
          projectId: project.id,
        },
      });

      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollCommits(project.id);

      await ctx.db.user.update({
        where: { id: ctx.user.userId! },
        data: {
          credits: { decrement: fileCount },
        },
      });

      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.project.findMany({
        where: {
          userToProjects: {
            some: {
              userId: ctx.user.userId!,
            },
          },
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
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        pollCommits(input.projectId).then().catch(console.error);
        return await ctx.db.gitCommit.findMany({
          where: {
            projectId: input.projectId,
          },
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
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string()!,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await db.meeting.create({
        data: {
          projectId: input.projectId,
          meetingUrl: input.meetingUrl,
          name: input.name,
          status: "PROCESSING",
        },
      });
      return meeting;
    }),
  getMeetings: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) => {
      return db.meeting.findMany({
        where: {
          projectId: input.projectId,
        },
        include: { issues: true },
      });
    }),
  deleteMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.meeting.delete({
        where: { id: input.meetingId },
      });
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

  getMyCredits: protectedProcedure.query(async ({ ctx, input }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.user.userId },
      select: { credits: true },
    });
  }),
  checkCreditNeeded: protectedProcedure
    .input(
      z.object({ githubUrl: z.string(), githubToken: z.string().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const fileCount = await checkCredits(input.githubUrl, input.githubToken);
      const userCredits = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId },
        select: { credits: true },
      });
      return { fileCount, userCredits: userCredits?.credits || 0 };
    }),
});
