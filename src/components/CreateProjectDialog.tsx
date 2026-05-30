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
import {
  Sparkles,
  GitBranch,
  FolderGit2,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  FileArchive,
  X,
  GitCommit,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import React, { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "usehooks-ts";
import { useRouter } from "next/navigation";

// ─── Client-side file filter (mirrors shouldIgnoreFile on server) ─────────────
const IGNORED_EXTS = new Set([
  ".lock", ".lockb", ".exe", ".dll", ".so", ".dylib", ".bin", ".wasm",
  ".pyc", ".pyo", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
  ".webp", ".bmp", ".tiff", ".mp4", ".mp3", ".wav", ".ogg", ".avi",
  ".mov", ".webm", ".ttf", ".otf", ".woff", ".woff2", ".eot",
  ".zip", ".tar", ".gz", ".rar", ".7z", ".pdf", ".docx", ".xlsx",
  ".pptx", ".pem", ".key", ".crt", ".p12", ".sql", ".map",
]);
const IGNORED_NAMES = new Set([
  "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "bun.lockb", "composer.lock", "Gemfile.lock", "Cargo.lock",
  "postcss.config.js", "postcss.config.mjs", "tsconfig.json",
  "tsconfig.node.json", ".env", ".env.local", ".env.example",
  ".env.development", ".env.production", ".gitignore", ".gitattributes",
  ".eslintignore", ".prettierignore", ".dockerignore", "Dockerfile",
  "docker-compose.yml", "docker-compose.yaml", ".editorconfig",
  "CHANGELOG.md", "LICENCE", "LICENSE", "LICENSE.md", "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md", "SECURITY.md", ".nvmrc", ".node-version",
  // Python
  "requirements.txt", "Pipfile", "Pipfile.lock", "setup.py", "setup.cfg",
  "pyproject.toml", ".python-version",
]);
const IGNORED_SEGMENTS = new Set([
  "node_modules", ".git", ".github", "dist", "build", "out", ".next",
  ".nuxt", "__pycache__", ".pytest_cache", ".mypy_cache", "coverage",
  ".nyc_output", "vendor", "venv", ".venv", "env", "target", ".turbo",
  ".vercel", ".cache", "tmp", "temp", ".idea", ".vscode", ".DS_Store",
  "storybook-static", "public/static",
  // Python virtual envs and caches
  "site-packages", ".eggs", "*.egg-info", "__pypackages__",
]);
const UI_PATTERN = /\b(card|button|charts|sidebar|footer|header|sheet|input)\b/i;

function clientShouldIgnore(path: string, skipUi: boolean): boolean {
  const lower = path.toLowerCase().replace(/\\/g, "/");
  const segs = lower.split("/");
  for (const seg of segs) {
    if (IGNORED_SEGMENTS.has(seg)) return true;
    if (skipUi && seg === "ui") return true;
  }
  if (skipUi && (lower.endsWith(".jsx") || lower.endsWith(".tsx"))) {
    const fn = segs[segs.length - 1] ?? "";
    if (UI_PATTERN.test(fn)) return true;
  }
  const fn = segs[segs.length - 1] ?? "";
  if (IGNORED_NAMES.has(fn)) return true;
  const parts = fn.split(".");
  if (parts.length >= 3) {
    const doubleExt = `.${parts.slice(-2).join(".")}`;
    if (IGNORED_EXTS.has(doubleExt)) return true;
  }
  if (parts.length >= 2) {
    const ext = `.${parts[parts.length - 1]}`;
    if (IGNORED_EXTS.has(ext)) return true;
  }
  return false;
}

// ─── Parse ZIP in browser using JSZip ─────────────────────────────────────
async function countZipFilesClient(file: File, skipUi: boolean): Promise<number> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  let count = 0;
  zip.forEach((relativePath) => {
    if (relativePath.endsWith("/")) return; // directory
    if (!clientShouldIgnore(relativePath, skipUi)) count++;
  });
  return count;
}

// ─── Types ────────────────────────────────────────────────────────────────
type GitHubFormFields = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
  skipUiComponents: boolean;
};

type Tab = "github" | "zip";

const INTERNAL_SECRET = process.env.NEXT_PUBLIC_INTERNAL_API_SECRET ?? "ownyourcode-internal";

export const CreateProjectDialog = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [, setProjectId] = useLocalStorage("OwnYourCode-Project-key", "");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("github");

  // ── GitHub tab state ──
  const { register, handleSubmit, reset, watch } = useForm<GitHubFormFields>({
    defaultValues: { skipUiComponents: true },
  });
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCreditNeeded.useMutation({
    onSuccess: (res) => {
      if (res.fileCount <= res.userCredits) {
        toast.success(`${res.fileCount} files detected — you have enough credits.`);
      } else {
        toast.error(`Not enough credits. Need ${res.fileCount}, have ${res.userCredits}.`);
      }
    },
  });
  const refetch = useRefetch();

  const repoUrl = watch("repoUrl");
  const skipUiGit = watch("skipUiComponents");

  React.useEffect(() => { checkCredits.reset(); }, [repoUrl, skipUiGit]);
  React.useEffect(() => {
    if (!open) {
      reset();
      checkCredits.reset();
      createProject.reset();
      setTab("github");
      setZipFile(null);
      setZipFileCount(null);
      setZipProjectName("");
      setZipSkipUi(true);
      setZipUploading(false);
    }
  }, [open, reset]);

  // ── ZIP tab state ──
  const createZipProject = api.project.createZipProject.useMutation();
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipFileCount, setZipFileCount] = useState<number | null>(null);
  const [zipCountLoading, setZipCountLoading] = useState(false);
  const [zipProjectName, setZipProjectName] = useState("");
  const [zipSkipUi, setZipSkipUi] = useState(true);
  const [zipUploading, setZipUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const getCredits = api.project.getMyCredits.useQuery(undefined, { enabled: open });
  React.useEffect(() => { if (getCredits.data) setUserCredits(getCredits.data.credits); }, [getCredits.data]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processZipFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      toast.error("Only .zip files are accepted.");
      return;
    }
    const MAX_MB = 4;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum is ${MAX_MB} MB.`);
      return;
    }
    setZipFile(file);
    setZipFileCount(null);
    setZipCountLoading(true);
    try {
      const count = await countZipFilesClient(file, zipSkipUi);
      setZipFileCount(count);
    } catch {
      toast.error("Couldn't read the ZIP file. Make sure it's a valid archive.");
      setZipFile(null);
    } finally {
      setZipCountLoading(false);
    }
  }, [zipSkipUi]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processZipFile(file);
  }, [processZipFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  // Recount when skipUi changes
  React.useEffect(() => {
    if (zipFile) processZipFile(zipFile);
  }, [zipSkipUi]);

  const onZipSubmit = async () => {
    if (!zipFile || zipFileCount === null || !zipProjectName.trim()) return;
    setZipUploading(true);
    try {
      const project = await createZipProject.mutateAsync({
        name: zipProjectName.trim(),
        fileCount: zipFileCount,
        skipUiComponents: zipSkipUi,
      });

      // Upload ZIP to the index route
      const formData = new FormData();
      formData.append("file", zipFile);
      formData.append("projectId", project.id);

      const res = await fetch("/api/upload-zip", {
        method: "POST",
        headers: { "x-internal-secret": INTERNAL_SECRET },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        toast.error(err.error ?? "Upload failed");
        return;
      }

      toast.success("Project indexed successfully!");
      setProjectId(project.id);
      refetch();
      setOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setZipUploading(false);
    }
  };

  // ── GitHub submit ──
  const onGitSubmit = (data: GitHubFormFields) => {
    if (!!checkCredits.data) {
      createProject.mutate(
        { githubUrl: data.repoUrl, name: data.projectName, githubToken: data.githubToken, skipUiComponents: data.skipUiComponents },
        {
          onSuccess: (newProject) => {
            toast.success("Project indexed successfully");
            setProjectId(newProject.id);
            refetch();
            reset();
            setOpen(false);
            router.push("/dashboard");
          },
          onError: (err) => toast.error(err.message ?? "Failed to create project"),
        },
      );
    } else {
      checkCredits.mutate(
        { githubUrl: data.repoUrl, githubToken: data.githubToken, skipUiComponents: data.skipUiComponents },
        { onError: (err) => toast.error(err.message ?? "Failed to connect to repository.") },
      );
    }
    return true;
  };

  const hasEnoughCreditsGit = checkCredits.data?.userCredits
    ? checkCredits.data.fileCount <= checkCredits.data.userCredits
    : true;
  const hasEnoughCreditsZip = zipFileCount !== null && userCredits !== null
    ? zipFileCount <= userCredits
    : true;

  const isGitLoading = createProject.isPending || checkCredits.isPending;
  const hasGitChecked = !!checkCredits.data;
  const isZipReady = zipFile !== null && zipFileCount !== null && zipProjectName.trim().length > 0;

  const isAnyLoading = isGitLoading || zipUploading || createZipProject.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[700px] w-full rounded-[28px] border border-ink/10 p-0 overflow-hidden bg-cream gap-0 shadow-soft">
        <DialogHeader className="sr-only">
          <DialogTitle>Connect a repository</DialogTitle>
          <DialogDescription>Link a repo or upload a ZIP to OwnYourCode.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col">
          {/* ── Header ── */}
          <div className="border-b border-ink/5 px-6 py-5 bg-cream-deep/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink leading-none">Add a project</h3>
                <p className="mt-1.5 text-[11px] text-ink-soft leading-normal">
                  Connect a GitHub repo or upload a ZIP archive directly.
                </p>
              </div>
              {/* Tab switcher */}
              <div className="flex items-center gap-1 bg-cream-deep/60 border border-ink/8 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setTab("github")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                    tab === "github"
                      ? "bg-ink text-cream shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => setTab("zip")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                    tab === "zip"
                      ? "bg-ink text-cream shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  <FileArchive className="h-3.5 w-3.5" />
                  ZIP Upload
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════ GITHUB TAB ══════════════════════ */}
          {tab === "github" && (
            <form onSubmit={handleSubmit(onGitSubmit)} className="flex flex-col p-6 gap-5">
              <div className="space-y-3">
                <div className="relative group">
                  <FolderGit2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft group-focus-within:text-coral transition-colors" />
                  <Input
                    {...register("projectName", { required: true })}
                    placeholder="Project Name"
                    required
                    className="h-11 rounded-xl border border-ink/10 bg-cream-deep/30 pl-10 text-[13px] font-medium text-ink placeholder:text-ink-soft/60 focus:border-coral focus:bg-card focus:ring-4 focus:ring-coral/10 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  />
                </div>
                <div className="relative group">
                  <GitBranch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft group-focus-within:text-coral transition-colors" />
                  <Input
                    {...register("repoUrl", { required: true })}
                    placeholder="https://github.com/owner/repo"
                    required
                    type="url"
                    className="h-11 rounded-xl border border-ink/10 bg-cream-deep/30 pl-10 text-[13px] font-medium text-ink placeholder:text-ink-soft/60 focus:border-coral focus:bg-card focus:ring-4 focus:ring-coral/10 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  />
                </div>
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft group-focus-within:text-coral transition-colors" />
                  <Input
                    {...register("githubToken")}
                    placeholder="GitHub Token (optional — for private repos)"
                    className="h-11 rounded-xl border border-ink/10 bg-cream-deep/30 pl-10 text-[13px] font-medium text-ink placeholder:text-ink-soft/60 focus:border-coral focus:bg-card focus:ring-4 focus:ring-coral/10 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  />
                </div>

                {/* Commits note */}
                <div className="flex items-start gap-2 rounded-xl border border-ink/8 bg-cream-deep/30 px-3 py-2.5">
                  <GitCommit className="h-3.5 w-3.5 text-ink-soft mt-0.5 shrink-0" />
                  <p className="text-[11px] text-ink-soft leading-relaxed">
                    GitHub URL enables <span className="font-semibold text-ink">commit history</span> — AI summaries of each change to your repo.
                  </p>
                </div>

                <div className="flex flex-col space-y-1 pt-2 border-t border-ink/5">
                  <div className="flex items-center space-x-3">
                    <input
                      id="skipUiGit"
                      type="checkbox"
                      {...register("skipUiComponents")}
                      className="h-4 w-4 rounded border-ink/15 text-coral focus:ring-coral accent-coral cursor-pointer"
                    />
                    <label htmlFor="skipUiGit" className="text-[12px] font-bold text-ink-soft cursor-pointer flex items-center gap-1.5 hover:text-ink transition-colors select-none">
                      Exclude UI Components (Lowers credit cost)
                    </label>
                  </div>
                  <p className="text-[11px] text-ink-soft/60 pl-7 leading-normal">
                    Filters layout components, icons, and visual elements to focus indexing on core logic.
                  </p>
                </div>
              </div>

              {hasGitChecked && (
                <div className={cn(
                  "animate-in fade-in slide-in-from-top-1 duration-200 rounded-2xl border px-4 py-3.5 shadow-sm",
                  hasEnoughCreditsGit ? "border-sage/20 bg-sage/5" : "border-coral-soft/20 bg-coral-soft/5"
                )}>
                  <div className="flex items-start gap-3">
                    {hasEnoughCreditsGit ? (
                      <div className="flex items-center justify-center size-7 rounded-lg bg-sage/20 text-sage border border-sage/10 shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center size-7 rounded-lg bg-coral-soft/20 text-coral border border-coral-soft/10 shrink-0 animate-bounce" style={{ animationDuration: "2s" }}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1">
                      <span className="text-[12px] font-bold text-ink leading-none">
                        {hasEnoughCreditsGit ? "Ready to Index" : "Insufficient Credits"}
                      </span>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-ink-soft">
                        <span>Cost: <span className="font-bold text-ink">{checkCredits.data?.fileCount} credits</span></span>
                        <span className="h-3 w-px bg-ink/10" />
                        <span>Balance: <span className={cn("font-bold", hasEnoughCreditsGit ? "text-sage" : "text-coral")}>{checkCredits.data?.userCredits} credits</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isGitLoading || (!hasEnoughCreditsGit && hasGitChecked)}
                  className={cn(
                    "h-11 w-full rounded-2xl text-[13px] font-bold transition-all shadow-pop-sm active:scale-[0.98] border cursor-pointer",
                    hasGitChecked && hasEnoughCreditsGit
                      ? "bg-coral text-cream border-coral hover:bg-coral-soft hover:shadow-pop"
                      : "bg-ink text-cream border-ink hover:bg-ink-soft hover:shadow-pop",
                    (!hasEnoughCreditsGit && hasGitChecked) && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                >
                  {isGitLoading ? (
                    <span className="flex items-center gap-2 justify-center"><Loader2 className="h-4 w-4 animate-spin" />Connecting…</span>
                  ) : hasGitChecked ? (
                    <span className="flex items-center gap-2 justify-center"><Sparkles className="h-4 w-4" />{hasEnoughCreditsGit ? "Begin Repository Indexing" : "Not Enough Credits"}</span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center"><GitBranch className="h-4 w-4" />Validate &amp; Check Repo</span>
                  )}
                </Button>
                <p className="text-center text-[11px] text-ink-soft/80">
                  1 credit = 1 file indexed ·{" "}
                  <a href="/billing" className="font-bold text-coral hover:text-coral-soft underline underline-offset-2 transition-colors">Add credits</a>
                </p>
              </div>
            </form>
          )}

          {/* ══════════════════════ ZIP TAB ══════════════════════ */}
          {tab === "zip" && (
            <div className="flex flex-col p-6 gap-5">
              <div className="space-y-3">
                {/* Project name */}
                <div className="relative group">
                  <FolderGit2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft group-focus-within:text-coral transition-colors" />
                  <Input
                    value={zipProjectName}
                    onChange={(e) => setZipProjectName(e.target.value)}
                    placeholder="Project Name"
                    className="h-11 rounded-xl border border-ink/10 bg-cream-deep/30 pl-10 text-[13px] font-medium text-ink placeholder:text-ink-soft/60 focus:border-coral focus:bg-card focus:ring-4 focus:ring-coral/10 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  />
                </div>

                {/* D&D Zone */}
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 px-6 py-8",
                    isDragging
                      ? "border-coral bg-coral/5 scale-[1.01]"
                      : zipFile
                      ? "border-sage/60 bg-sage/5"
                      : "border-ink/15 bg-cream-deep/20 hover:border-ink/30 hover:bg-cream-deep/40"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) processZipFile(f); }}
                  />

                  {zipFile ? (
                    <>
                      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-sage/15 border border-sage/20">
                        <FileArchive className="h-6 w-6 text-sage" />
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-semibold text-ink">{zipFile.name}</p>
                        <p className="text-[11px] text-ink-soft mt-0.5">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      {zipCountLoading ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-ink-soft animate-pulse">
                          <Loader2 className="h-3 w-3 animate-spin" /> Counting files…
                        </div>
                      ) : zipFileCount !== null ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/10 border border-sage/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
                          <span className="text-[11px] font-semibold text-sage">{zipFileCount} files to index</span>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setZipFile(null); setZipFileCount(null); }}
                        className="absolute top-3 right-3 flex items-center justify-center h-6 w-6 rounded-full bg-ink/8 hover:bg-ink/15 text-ink-soft hover:text-ink transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={cn("flex items-center justify-center h-12 w-12 rounded-2xl border transition-all", isDragging ? "bg-coral/15 border-coral/30" : "bg-cream-deep border-ink/10")}>
                        <Upload className={cn("h-6 w-6 transition-colors", isDragging ? "text-coral" : "text-ink-soft")} />
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-semibold text-ink">
                          {isDragging ? "Drop it here!" : "Drop your ZIP or click to browse"}
                        </p>
                        <p className="text-[11px] text-ink-soft mt-0.5">Max 4 MB · .zip only</p>
                      </div>
                    </>
                  )}
                </div>

                {/* No commit history notice */}
                <div className="flex items-start gap-2 rounded-xl border border-ink/8 bg-cream-deep/30 px-3 py-2.5">
                  <GitCommit className="h-3.5 w-3.5 text-ink-soft mt-0.5 shrink-0" />
                  <p className="text-[11px] text-ink-soft leading-relaxed">
                    ZIP projects don't have <span className="font-semibold text-ink">commit history</span>. All code intelligence and Q&amp;A features work normally.
                  </p>
                </div>

                {/* Skip UI toggle */}
                <div className="flex flex-col space-y-1 pt-2 border-t border-ink/5">
                  <div className="flex items-center space-x-3">
                    <input
                      id="skipUiZip"
                      type="checkbox"
                      checked={zipSkipUi}
                      onChange={(e) => setZipSkipUi(e.target.checked)}
                      className="h-4 w-4 rounded border-ink/15 text-coral focus:ring-coral accent-coral cursor-pointer"
                    />
                    <label htmlFor="skipUiZip" className="text-[12px] font-bold text-ink-soft cursor-pointer flex items-center gap-1.5 hover:text-ink transition-colors select-none">
                      Exclude UI Components (Lowers credit cost)
                    </label>
                  </div>
                  <p className="text-[11px] text-ink-soft/60 pl-7 leading-normal">
                    File count above updates instantly when toggled.
                  </p>
                </div>
              </div>

              {/* Credit check for ZIP */}
              {zipFileCount !== null && userCredits !== null && (
                <div className={cn(
                  "animate-in fade-in slide-in-from-top-1 duration-200 rounded-2xl border px-4 py-3.5 shadow-sm",
                  hasEnoughCreditsZip ? "border-sage/20 bg-sage/5" : "border-coral-soft/20 bg-coral-soft/5"
                )}>
                  <div className="flex items-start gap-3">
                    {hasEnoughCreditsZip ? (
                      <div className="flex items-center justify-center size-7 rounded-lg bg-sage/20 text-sage border border-sage/10 shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center size-7 rounded-lg bg-coral-soft/20 text-coral border border-coral-soft/10 shrink-0 animate-bounce" style={{ animationDuration: "2s" }}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1">
                      <span className="text-[12px] font-bold text-ink leading-none">
                        {hasEnoughCreditsZip ? "Ready to Index" : "Insufficient Credits"}
                      </span>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-ink-soft">
                        <span>Cost: <span className="font-bold text-ink">{zipFileCount} credits</span></span>
                        <span className="h-3 w-px bg-ink/10" />
                        <span>Balance: <span className={cn("font-bold", hasEnoughCreditsZip ? "text-sage" : "text-coral")}>{userCredits} credits</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={onZipSubmit}
                  disabled={isAnyLoading || !isZipReady || !hasEnoughCreditsZip}
                  className={cn(
                    "h-11 w-full rounded-2xl text-[13px] font-bold transition-all shadow-pop-sm active:scale-[0.98] border cursor-pointer",
                    isZipReady && hasEnoughCreditsZip
                      ? "bg-coral text-cream border-coral hover:bg-coral-soft hover:shadow-pop"
                      : "bg-ink text-cream border-ink hover:bg-ink-soft hover:shadow-pop",
                    (!isZipReady || !hasEnoughCreditsZip) && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                >
                  {isAnyLoading ? (
                    <span className="flex items-center gap-2 justify-center"><Loader2 className="h-4 w-4 animate-spin" />Uploading &amp; Indexing…</span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center"><Sparkles className="h-4 w-4" />Begin Indexing from ZIP</span>
                  )}
                </Button>
                <p className="text-center text-[11px] text-ink-soft/80">
                  1 credit = 1 file indexed ·{" "}
                  <a href="/billing" className="font-bold text-coral hover:text-coral-soft underline underline-offset-2 transition-colors">Add credits</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Full-screen loading overlay */}
      {isAnyLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream/70 backdrop-blur-xl transition-all animate-in fade-in duration-500">
          <div className="flex flex-col items-center text-center gap-6 animate-pulse-soft">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full bg-coral/30 blur-2xl animate-spin-slow" />
              <div className="absolute h-16 w-16 rounded-full border-2 border-dashed border-coral animate-spin" style={{ animationDuration: "3s" }} />
              <div className="h-12 w-12 rounded-full bg-cream border border-ink/10 flex items-center justify-center shadow-soft relative z-10">
                <Sparkles className="h-5 w-5 text-coral" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-ink tracking-tight">Initializing Intelligence Engine</h2>
              <p className="text-sm font-medium text-ink-soft">
                {tab === "zip" ? "Uploading and preparing your ZIP archive…" : "Preparing vector embeddings for your repository…"}
              </p>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};