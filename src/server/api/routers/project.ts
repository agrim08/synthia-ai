import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/server/db";
import { pollCommits } from "@/lib/github";

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
      try {
        // Check if the user exists.
        const existingUser = await ctx.db.user.findUnique({
          where: { id: ctx.user.userId! },
        });
        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Create the project.
        const project = await ctx.db.project.create({
          data: {
            githubUrl: input.githubUrl,
            name: input.name,
          },
        });

        // Associate the project with the user.
        await ctx.db.userToProject.create({
          data: {
            userId: ctx.user.userId!,
            projectId: project.id,
          },
        });

        await pollCommits(project.id);
        return project;
      } catch (error) {
        // If the error is already a TRPCError, rethrow it.
        if (error instanceof TRPCError) {
          throw error;
        }
        // Otherwise, wrap it in an INTERNAL_SERVER_ERROR.
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating project",
          cause: error,
        });
      }
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
});
