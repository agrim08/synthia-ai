"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/useRefetch";
import { api } from "@/trpc/react";
import { Sparkles, GitBranch, FolderGit2, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FormFields = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

export const CreateProjectDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormFields>();
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCreditNeeded.useMutation();
  const refetch = useRefetch();

  const onSubmit = (data: FormFields) => {
    if (!!checkCredits.data) {
      createProject.mutate(
        {
          githubUrl: data.repoUrl,
          name: data.projectName,
          githubToken: data.githubToken,
        },
        {
          onSuccess: () => {
            toast.success("Project indexed successfully");
            refetch();
            reset();
            setOpen(false);
          },
          onError: (err) => {
            toast.error(err.message || "Failed to create project");
          },
        },
      );
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }
    return true;
  };

  const hasEnoughCredits = checkCredits.data?.userCredits
    ? checkCredits.data?.fileCount <= checkCredits.data?.userCredits
    : true;

  const isLoading = createProject.isPending || checkCredits.isPending;
  const hasChecked = !!checkCredits.data;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[680px] w-full rounded-2xl border border-slate-200/80 p-0 overflow-hidden bg-white gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Connect a repository</DialogTitle>
          <DialogDescription>Link a GitHub repo to Synthia.</DialogDescription>
        </DialogHeader>

        {/* ── Left accent strip + header (horizontal layout) ── */}
        <div className="flex">

          {/* Left panel — indigo accent */}
          <div className="relative hidden w-[200px] shrink-0 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 p-6 sm:flex">
            {/* decorative rings */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full border border-white/10" />

            <img
              src="/vector.webp"
              alt="Synthia Vector"
              className="h-32 w-auto drop-shadow-2xl brightness-110 grayscale-[0.2] transition-all hover:scale-110 duration-500"
            />
          </div>

          {/* Right panel — form */}
          <div className="flex flex-1 flex-col">

            {/* Mobile-only header */}
            <div className="border-b border-slate-100 px-6 py-4 sm:hidden">
              <DialogHeader>
                <DialogTitle className="text-[15px] font-bold tracking-tight text-slate-900">
                  Connect a repository
                </DialogTitle>
                <DialogDescription className="text-[12px] text-slate-400">
                  Synthia will index your codebase instantly.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">

              {/* Fields */}
              <div className="space-y-2.5">
                {/* Project name */}
                <div className="relative">
                  <FolderGit2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...register("projectName", { required: true })}
                    placeholder="Project name"
                    required
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-[13px] font-medium placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* Repo URL */}
                <div className="relative">
                  <GitBranch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...register("repoUrl", { required: true })}
                    placeholder="https://github.com/owner/repo"
                    required
                    type="url"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-[13px] font-medium placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* GitHub token */}
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...register("githubToken")}
                    placeholder="GitHub token (optional — for private repos)"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-[13px] font-medium placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Credit check result */}
              {hasChecked && (
                <div
                  className={cn(
                    "animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border p-3",
                    hasEnoughCredits
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-red-100 bg-red-50"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {hasEnoughCredits ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-slate-700">
                          {hasEnoughCredits ? "Ready to index" : "Insufficient credits"}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-4 text-[11px] text-slate-500">
                        <span>
                          Cost:{" "}
                          <span className="font-semibold text-slate-700">
                            {checkCredits.data?.fileCount} credits
                          </span>
                        </span>
                        <span className="h-3 w-px bg-slate-200" />
                        <span>
                          Balance:{" "}
                          <span
                            className={cn(
                              "font-semibold",
                              hasEnoughCredits ? "text-emerald-700" : "text-red-600"
                            )}
                          >
                            {checkCredits.data?.userCredits} credits
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <Button
                type="submit"
                disabled={isLoading || (!hasEnoughCredits && hasChecked)}
                className={cn(
                  "h-10 w-full rounded-xl text-[13px] font-semibold transition-all",
                  hasChecked && hasEnoughCredits
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/60 hover:bg-indigo-700"
                    : "bg-slate-900 text-white hover:bg-slate-800",
                  (!hasEnoughCredits && hasChecked) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing…
                  </span>
                ) : hasChecked ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    {hasEnoughCredits ? "Index Repository" : "Not Enough Credits"}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <GitBranch className="h-3.5 w-3.5" />
                    Check Repository
                  </span>
                )}
              </Button>

              {/* Helper text */}
              <p className="text-center text-[11px] text-slate-400">
                1 credit = 1 file indexed ·{" "}
                <a href="/billing" className="text-indigo-500 hover:text-indigo-700 transition-colors">
                  Add credits
                </a>
              </p>

            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};