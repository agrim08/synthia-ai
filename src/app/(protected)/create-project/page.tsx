"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import useRefetch from "@/hooks/useRefetch";
import { api } from "@/trpc/react";
import { FolderGit2, Github, KeyRound } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormFields = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const page = () => {
  const { register, handleSubmit, reset } = useForm<FormFields>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();
  const onSubmit = (data: FormFields) => {
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          refetch();
          reset();
        },
        onError: () => {
          toast.error("Failed to create project");
        },
      },
    );

    return true;
  };

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img
        src={"/vector.webp"}
        alt="image"
        className="h-56 w-auto rounded-md"
      />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL to link your repository with Synthia
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="relative">
              <FolderGit2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                {...register("projectName", { required: true })}
                placeholder="Project Name"
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Github className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                {...register("repoUrl", { required: true })}
                placeholder="Repository URL"
                required
                type="url"
                className="pl-10"
              />
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                {...register("githubToken")}
                placeholder="Github token (optional)"
                className="pl-10"
              />
            </div>
            <div>
              <Button
                type="submit"
                disabled={createProject.isPending}
                className="bg-indigo-700 hover:bg-indigo-500"
              >
                Create Project
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default page;
