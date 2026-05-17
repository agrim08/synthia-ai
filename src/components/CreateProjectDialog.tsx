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
import { Sparkles, GitBranch, FolderGit2, KeyRound, AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FormFields = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
  skipUiComponents: boolean;
};

export const CreateProjectDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<FormFields>({
    defaultValues: {
      skipUiComponents: true
    }
  });
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCreditNeeded.useMutation();
  const refetch = useRefetch();

  const repoUrl = watch("repoUrl");
  const skipUi = watch("skipUiComponents");

  // Reset credit check if repo or skip preference changes
  React.useEffect(() => {
    checkCredits.reset();
  }, [repoUrl, skipUi]);


  const onSubmit = (data: FormFields) => {
    if (!!checkCredits.data) {
      createProject.mutate(
        {
          githubUrl: data.repoUrl,
          name: data.projectName,
          githubToken: data.githubToken,
          skipUiComponents: data.skipUiComponents,
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
        skipUiComponents: data.skipUiComponents,
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

      <DialogContent className="max-w-[700px] w-full rounded-[28px] border border-ink/10 p-0 overflow-hidden bg-cream gap-0 shadow-soft">
        <DialogHeader className="sr-only">
          <DialogTitle>Connect a repository</DialogTitle>
          <DialogDescription>Link a GitHub repo to OwnYourCode.</DialogDescription>
        </DialogHeader>

        {/* ── Left accent strip + header (horizontal layout) ── */}
        <div className="flex min-h-[460px]">

          {/* Left panel — desktop mesh gradient bg */}
          {/* <div className="relative hidden w-[220px] shrink-0 flex-col justify-between p-6 sm:flex overflow-hidden bg-ink select-none border-r border-ink/15"> */}
            {/* Animated Ambient Glowing Spots */}
            {/* <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] rounded-full bg-coral/25 blur-[45px] animate-pulse-soft" />
              <div className="absolute bottom-[-20%] left-[-20%] w-[150px] h-[150px] rounded-full bg-sky/25 blur-[45px] animate-pulse-soft" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div> */}

            {/* Logo and Brand */}
            {/* <div className="relative z-10 flex flex-col items-center gap-2 mt-2">
              <div className="bg-white/5 p-2 rounded-xl border border-white/10 shadow-inner">
                <Logo width={28} height={28} className="text-white" />
              </div>
              <span className="text-[12px] font-bold text-white tracking-widest uppercase opacity-90">OwnYourCode</span>
            </div> */}

            {/* Centered Graphic */}
            {/* <div className="relative z-10 my-auto flex flex-col items-center justify-center">
              <img
                src="/vector.webp"
                alt="OwnYourCode Logo"
                className="h-28 w-auto drop-shadow-2xl brightness-110 grayscale-[0.2] transition-all hover:scale-105 duration-500 animate-float"
              />
            </div> */}

            {/* Bottom Caption */}
            {/* <div className="relative z-10 text-center">
              <p className="text-[10px] text-cream/40 uppercase tracking-widest font-bold">Secure Indexing</p>
            </div> */}
          {/* </div> */}

          {/* Right panel — form */}
          <div className="flex flex-1 flex-col bg-cream">

            {/* Desktop Header */}
            <div className="border-b border-ink/5 px-6 py-5 hidden sm:block bg-cream-deep/20">
              <h3 className="text-base font-bold text-ink leading-none">Connect a repository</h3>
              <p className="mt-1.5 text-[11px] text-ink-soft leading-normal">
                Our AI will analyze your codebase structure to build a semantic index.
              </p>
            </div>

            {/* Mobile-only header */}
            <div className="border-b border-ink/5 px-6 py-4 sm:hidden">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="bg-ink p-1.5 rounded-lg">
                  <Logo width={18} height={18} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-ink leading-none">Connect a repository</h3>
              </div>
              <p className="text-[11px] text-ink-soft leading-normal">
                Our AI will index your codebase instantly.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between p-6 gap-5">

              {/* Fields */}
              <div className="space-y-3">
                {/* Project name */}
                <div className="relative group">
                  <FolderGit2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft group-focus-within:text-coral transition-colors" />
                  <Input
                    {...register("projectName", { required: true })}
                    placeholder="Project Name"
                    required
                    className="h-11 rounded-xl border border-ink/10 bg-cream-deep/30 pl-10 text-[13px] font-medium text-ink placeholder:text-ink-soft/60 focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  />
                </div>

                {/* Repo URL */}
                <div className="relative group">
                  <GitBranch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft group-focus-within:text-coral transition-colors" />
                  <Input
                    {...register("repoUrl", { required: true })}
                    placeholder="https://github.com/owner/repo"
                    required
                    type="url"
                    className="h-11 rounded-xl border border-ink/10 bg-cream-deep/30 pl-10 text-[13px] font-medium text-ink placeholder:text-ink-soft/60 focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  />
                </div>

                {/* GitHub token */}
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft group-focus-within:text-coral transition-colors" />
                  <Input
                    {...register("githubToken")}
                    placeholder="GitHub Token (optional — for private repos)"
                    className="h-11 rounded-xl border border-ink/10 bg-cream-deep/30 pl-10 text-[13px] font-medium text-ink placeholder:text-ink-soft/60 focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  />
                </div>

                {/* Exclude UI toggle */}
                <div className="flex items-center space-x-3 pt-2.5 border-t border-ink/5 mt-2">
                  <input
                    id="skipUi"
                    type="checkbox"
                    {...register("skipUiComponents")}
                    className="h-4 w-4 rounded border-ink/15 text-coral focus:ring-coral accent-coral cursor-pointer"
                  />
                  <label htmlFor="skipUi" className="text-[12px] font-bold text-ink-soft cursor-pointer flex items-center gap-1.5 hover:text-ink transition-colors select-none">
                    Exclude UI Components (Lowers credit cost)                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center text-ink-soft/60 hover:text-ink p-0.5 cursor-help transition-colors">
                            <Info className="size-3.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[260px] bg-ink text-cream border border-ink/20 rounded-xl p-3 shadow-pop-sm text-xs leading-normal">
                          <p className="font-semibold text-[11px] text-coral uppercase tracking-wider mb-1">About Exclude Feature</p>
                          Filters out layout components, icons, visual elements, and assets. Recommended to focus indexing on core application logic and lower cost.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                </div>
              </div>

              {/* Credit check result */}
              {hasChecked && (
                <div
                  className={cn(
                    "animate-in fade-in slide-in-from-top-1 duration-200 rounded-2xl border px-4 py-3.5 shadow-sm",
                    hasEnoughCredits
                      ? "border-sage/20 bg-sage/5"
                      : "border-coral-soft/20 bg-coral-soft/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {hasEnoughCredits ? (
                      <div className="flex items-center justify-center size-7 rounded-lg bg-sage/20 text-sage border border-sage/10 shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center size-7 rounded-lg bg-coral-soft/20 text-coral border border-coral-soft/10 shrink-0 animate-bounce" style={{ animationDuration: '2s' }}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-ink leading-none">
                          {hasEnoughCredits ? "Ready to Index" : "Insufficient Credits"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-ink-soft">
                        <span>
                          Cost:{" "}
                          <span className="font-bold text-ink">
                            {checkCredits.data?.fileCount} credits
                          </span>
                        </span>
                        <span className="h-3 w-px bg-ink/10" />
                        <span>
                          Balance:{" "}
                          <span
                            className={cn(
                              "font-bold",
                              hasEnoughCredits ? "text-sage" : "text-coral"
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

              {/* Action and footer */}
              <div className="space-y-3.5">
                <Button
                  type="submit"
                  disabled={isLoading || (!hasEnoughCredits && hasChecked)}
                  className={cn(
                    "h-11 w-full rounded-2xl text-[13px] font-bold transition-all shadow-pop-sm active:scale-[0.98] border cursor-pointer",
                    hasChecked && hasEnoughCredits
                      ? "bg-coral text-cream border-coral hover:bg-coral-soft hover:shadow-pop"
                      : "bg-ink text-cream border-ink hover:bg-ink-soft hover:shadow-pop",
                    (!hasEnoughCredits && hasChecked) && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting to repo…
                    </span>
                  ) : hasChecked ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Sparkles className="h-4 w-4" />
                      {hasEnoughCredits ? "Begin Repository Indexing" : "Not Enough Credits"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <GitBranch className="h-4 w-4" />
                      Validate & Check Repo
                    </span>
                  )}
                </Button>

                {/* Helper text */}
                <p className="text-center text-[11px] text-ink-soft/80">
                  1 credit = 1 file indexed ·{" "}
                  <a href="/billing" className="font-bold text-coral hover:text-coral-soft underline underline-offset-2 transition-colors">
                    Add credits
                  </a>
                </p>
              </div>

            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};