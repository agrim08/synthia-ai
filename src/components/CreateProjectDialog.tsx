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

async function countZipFilesClient(file: File, skipUi: boolean): Promise<number> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  let count = 0;
  zip.forEach((relativePath) => {
    if (relativePath.endsWith("/")) return;
    if (!clientShouldIgnore(relativePath, skipUi)) count++;
  });
  return count;
}

type GitHubFormFields = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
  skipUiComponents: boolean;
};

type Tab = "github" | "zip";

const INTERNAL_SECRET = process.env.NEXT_PUBLIC_INTERNAL_API_SECRET ?? "ownyourcode-internal";

// ─── Input Field Component ────────────────────────────────────────────────────
function Field({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/30 transition-colors duration-200 group-focus-within:text-coral" />
      {children}
    </div>
  );
}

const INPUT_CLASS =
  "h-10 w-full rounded-xl border border-ink/[0.08] bg-white/[0.03] dark:bg-white/[0.03] pl-9 pr-3 text-[13px] font-medium text-ink placeholder:text-ink/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-coral/50 focus:bg-card focus:shadow-[0_0_0_3px_rgba(var(--coral),0.08)] focus:outline-none";

export const CreateProjectDialog = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [, setProjectId] = useLocalStorage("OwnYourCode-Project-key", "");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("github");

  // ── GitHub state ──
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

  // ── ZIP state ──
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
    if (!file.name.endsWith(".zip")) { toast.error("Only .zip files are accepted."); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("File is too large. Maximum is 4 MB."); return; }
    setZipFile(file);
    setZipFileCount(null);
    setZipCountLoading(true);
    setZipProjectName((prev) => prev.trim() ? prev : file.name.replace(/\.zip$/i, ""));
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
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processZipFile(file);
  }, [processZipFile]);

  React.useEffect(() => { if (zipFile) processZipFile(zipFile); }, [zipSkipUi]);

  const onZipSubmit = async () => {
    if (!zipFile || zipFileCount === null || !zipProjectName.trim()) return;
    setZipUploading(true);
    try {
      const project = await createZipProject.mutateAsync({
        name: zipProjectName.trim(), fileCount: zipFileCount, skipUiComponents: zipSkipUi,
      });
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
      toast.success("ZIP uploaded! Indexing started in the background.");
      setProjectId(project.id);
      refetch();
      setOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong.");
    } finally {
      setZipUploading(false);
    }
  };

  const onGitSubmit = (data: GitHubFormFields) => {
    if (!!checkCredits.data) {
      createProject.mutate(
        { githubUrl: data.repoUrl, name: data.projectName, githubToken: data.githubToken, skipUiComponents: data.skipUiComponents },
        {
          onSuccess: (newProject) => {
            toast.success("Project indexed successfully");
            setProjectId(newProject.id);
            refetch(); reset(); setOpen(false);
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

  const hasEnoughCreditsGit = checkCredits.data?.userCredits ? checkCredits.data.fileCount <= checkCredits.data.userCredits : true;
  const hasEnoughCreditsZip = zipFileCount !== null && userCredits !== null ? zipFileCount <= userCredits : true;
  const isGitLoading = createProject.isPending || checkCredits.isPending;
  const hasGitChecked = !!checkCredits.data;
  const isZipReady = zipFile !== null && zipFileCount !== null && zipProjectName.trim().length > 0;
  const isAnyLoading = isGitLoading || zipUploading || createZipProject.isPending;

  // Shared skip-UI checkbox — unified between both tabs
  const skipUiValue = tab === "github" ? skipUiGit : zipSkipUi;
  const setSkipUiZip = (v: boolean) => setZipSkipUi(v);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-lg w-full rounded-[24px] border border-ink/[0.07] p-0 overflow-y-auto max-h-[90dvh] bg-cream shadow-[0_32px_64px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Add a project</DialogTitle>
          <DialogDescription>Connect a GitHub repo or upload a ZIP.</DialogDescription>
        </DialogHeader>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink shadow-pop-sm">
              <Sparkles className="h-4 w-4 text-cream" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-ink leading-none tracking-tight">Add a project</h2>
              <p className="text-[11px] text-ink/40 mt-1 leading-normal">Index a repo to unlock AI code intelligence.</p>
            </div>
          </div>

          {/* ── Segmented tab control ───────────────────────────────────── */}
          <div className="relative flex rounded-xl bg-black/[0.05] dark:bg-black/30 border border-border p-1 gap-1">
            {/* Sliding pill — CSS transition only, no Framer dep */}
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-card shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                left: tab === "github" ? "4px" : "50%",
                right: tab === "github" ? "50%" : "4px",
              }}
            />
            <button
              type="button"
              onClick={() => setTab("github")}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold transition-colors duration-200 cursor-pointer",
                tab === "github" ? "text-ink" : "text-ink-soft hover:text-ink"
              )}
            >
              <GitBranch className="h-3.5 w-3.5" />
              GitHub URL
            </button>
            <button
              type="button"
              onClick={() => setTab("zip")}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold transition-colors duration-200 cursor-pointer",
                tab === "zip" ? "text-ink" : "text-ink-soft hover:text-ink"
              )}
            >
              <FileArchive className="h-3.5 w-3.5" />
              ZIP Upload
            </button>
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="h-px bg-ink/[0.06]" />

        {/* ── Form body ──────────────────────────────────────────────────── */}
        <div className="px-6 py-5">

          {/* ════════ GITHUB FIELDS ════════ */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              tab === "github" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none absolute"
            )}
          >
            {tab === "github" && (
              <form onSubmit={handleSubmit(onGitSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2.5">
                  <Field icon={FolderGit2}>
                    <input
                      {...register("projectName", { required: true })}
                      placeholder="Project Name"
                      required
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <Field icon={GitBranch}>
                    <input
                      {...register("repoUrl", { required: true })}
                      placeholder="https://github.com/owner/repo"
                      required
                      type="url"
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <Field icon={KeyRound}>
                    <input
                      {...register("githubToken")}
                      placeholder="GitHub Token (optional — for private repos)"
                      className={INPUT_CLASS}
                    />
                  </Field>

                  {/* Commit history note */}
                  <div className="flex items-start gap-2 rounded-xl border border-ink/[0.07] bg-ink/[0.02] px-3 py-2.5">
                    <GitCommit className="h-3.5 w-3.5 text-ink/30 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-ink/50 leading-relaxed">
                      GitHub URL enables <span className="font-semibold text-ink/70">commit history</span> — AI summaries of every change to your repo.
                    </p>
                  </div>

                  {/* Skip UI */}
                  <SkipUiRow
                    id="skipUiGit"
                    formRegister={register("skipUiComponents")}
                  />
                </div>

                {/* Credit check result */}
                {hasGitChecked && (
                  <CreditBadge
                    hasEnough={hasEnoughCreditsGit}
                    fileCount={checkCredits.data?.fileCount}
                    balance={checkCredits.data?.userCredits}
                  />
                )}

                {/* Submit */}
                <div className="flex flex-col gap-2">
                  <SubmitButton
                    type="submit"
                    loading={isGitLoading}
                    disabled={isGitLoading || (!hasEnoughCreditsGit && hasGitChecked)}
                    ready={hasGitChecked && hasEnoughCreditsGit}
                  >
                    {isGitLoading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</>
                      : hasGitChecked
                        ? <><Sparkles className="h-4 w-4" />{hasEnoughCreditsGit ? "Begin Repository Indexing" : "Not Enough Credits"}</>
                        : <><GitBranch className="h-4 w-4" />Validate &amp; Check Repo</>
                    }
                  </SubmitButton>
                  <CreditFooter />
                </div>
              </form>
            )}
          </div>

          {/* ════════ ZIP FIELDS ════════ */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              tab === "zip" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none absolute"
            )}
          >
            {tab === "zip" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2.5">
                  <Field icon={FolderGit2}>
                    <input
                      value={zipProjectName}
                      onChange={(e) => setZipProjectName(e.target.value)}
                      placeholder="Project Name"
                      className={INPUT_CLASS}
                    />
                  </Field>

                  {/* D&D Zone */}
                  <DropZone
                    zipFile={zipFile}
                    zipFileCount={zipFileCount}
                    zipCountLoading={zipCountLoading}
                    isDragging={isDragging}
                    onDrop={onDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    onClear={() => { setZipFile(null); setZipFileCount(null); setZipProjectName(""); }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) processZipFile(f); }}
                  />

                  {/* No commit note */}
                  <div className="flex items-start gap-2 rounded-xl border border-ink/[0.07] bg-ink/[0.02] px-3 py-2.5">
                    <GitCommit className="h-3.5 w-3.5 text-ink/30 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-ink/50 leading-relaxed">
                      ZIP projects don&apos;t have <span className="font-semibold text-ink/70">commit history</span>. All Q&amp;A and intelligence features work fully.
                    </p>
                  </div>

                  {/* Skip UI */}
                  <SkipUiRow
                    id="skipUiZip"
                    checked={zipSkipUi}
                    onChange={setSkipUiZip}
                  />
                </div>

                {/* Credit check for ZIP */}
                {zipFileCount !== null && userCredits !== null && (
                  <CreditBadge
                    hasEnough={hasEnoughCreditsZip}
                    fileCount={zipFileCount}
                    balance={userCredits}
                  />
                )}

                <div className="flex flex-col gap-2">
                  <SubmitButton
                    type="button"
                    onClick={onZipSubmit}
                    loading={isAnyLoading}
                    disabled={isAnyLoading || !isZipReady || !hasEnoughCreditsZip}
                    ready={isZipReady && hasEnoughCreditsZip}
                  >
                    {isAnyLoading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading &amp; Indexing…</>
                      : <><Upload className="h-4 w-4" />Upload &amp; Index ZIP</>
                    }
                  </SubmitButton>
                  <CreditFooter />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* ── Full-screen loading overlay ─────────────────────────────────── */}
      {isAnyLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream/70 backdrop-blur-xl animate-in fade-in duration-500">
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
              <p className="text-sm font-medium text-ink/50">
                {tab === "zip" ? "Uploading and preparing your ZIP archive…" : "Preparing vector embeddings for your repository…"}
              </p>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkipUiRow({
  id,
  checked,
  formRegister,
  onChange,
}: {
  id: string;
  checked?: boolean;
  formRegister?: object;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-ink/[0.07] bg-ink/[0.02] px-3 py-3">
      {formRegister ? (
        <input
          id={id}
          type="checkbox"
          {...formRegister}
          className="mt-0.5 h-4 w-4 rounded border-ink/15 text-coral focus:ring-coral accent-coral cursor-pointer shrink-0"
        />
      ) : (
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-ink/15 text-coral focus:ring-coral accent-coral cursor-pointer shrink-0"
        />
      )}
      <div>
        <label htmlFor={id} className="block text-[12px] font-semibold text-ink/70 cursor-pointer select-none hover:text-ink transition-colors">
          Exclude UI Components <span className="font-medium text-ink/40">(lowers credit cost)</span>
        </label>
        <p className="mt-0.5 text-[10px] text-ink/35 leading-relaxed">
          Filters layout components, icons, and visual elements to focus on core logic.
        </p>
      </div>
    </div>
  );
}

function CreditBadge({
  hasEnough,
  fileCount,
  balance,
}: {
  hasEnough: boolean;
  fileCount?: number;
  balance?: number;
}) {
  return (
    <div className={cn(
      "animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border px-3.5 py-3",
      hasEnough ? "border-sage/25 bg-sage/[0.06]" : "border-coral-soft/25 bg-coral-soft/[0.06]"
    )}>
      <div className="flex items-center gap-2.5">
        {hasEnough ? (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sage/20 border border-sage/15">
            <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
          </div>
        ) : (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-coral-soft/20 border border-coral-soft/15 animate-bounce" style={{ animationDuration: "2s" }}>
            <AlertCircle className="h-3.5 w-3.5 text-coral" />
          </div>
        )}
        <div className="flex-1">
          <span className="text-[12px] font-bold text-ink leading-none">
            {hasEnough ? "Ready to Index" : "Insufficient Credits"}
          </span>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-ink/50">
            <span>Cost: <span className="font-bold text-ink">{fileCount} credits</span></span>
            <span className="h-3 w-px bg-ink/10" />
            <span>Balance: <span className={cn("font-bold", hasEnough ? "text-sage" : "text-coral")}>{balance} credits</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({
  type = "button",
  onClick,
  loading,
  disabled,
  ready,
  children,
}: {
  type?: "button" | "submit";
  onClick?: () => void;
  loading: boolean;
  disabled: boolean;
  ready: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative h-10 w-full rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 border",
        ready
          ? "bg-coral text-white border-coral hover:brightness-110 shadow-[0_2px_8px_rgba(var(--coral),0.3)]"
          : "bg-ink text-cream border-ink/80 hover:bg-ink/90",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}

function CreditFooter() {
  return (
    <p className="text-center text-[11px] text-ink/40">
      1 credit = 1 file indexed ·{" "}
      <a href="/billing" className="font-semibold text-coral hover:text-coral/70 transition-colors">
        Add credits
      </a>
    </p>
  );
}

function DropZone({
  zipFile,
  zipFileCount,
  zipCountLoading,
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  onClear,
}: {
  zipFile: File | null;
  zipFileCount: number | null;
  zipCountLoading: boolean;
  isDragging: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClick: () => void;
  onClear: () => void;
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 px-5",
        zipFile ? "py-4 gap-2" : "py-7 gap-3",
        isDragging
          ? "border-coral bg-coral/[0.04] scale-[1.01]"
          : zipFile
          ? "border-sage/50 bg-sage/[0.04]"
          : "border-ink/[0.12] bg-ink/[0.02] hover:border-ink/25 hover:bg-ink/[0.04]"
      )}
    >
      {zipFile ? (
        <>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/10 border border-sage/20">
            <FileArchive className="h-5 w-5 text-sage" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-ink">{zipFile.name}</p>
            <p className="text-[11px] text-ink/40 mt-0.5">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          {zipCountLoading ? (
            <div className="flex items-center gap-1.5 text-[11px] text-ink/40">
              <Loader2 className="h-3 w-3 animate-spin" /> Counting files…
            </div>
          ) : zipFileCount !== null ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage/10 border border-sage/20">
              <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
              <span className="text-[11px] font-semibold text-sage">{zipFileCount} files to index</span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/[0.06] hover:bg-ink/10 text-ink/40 hover:text-ink transition-all"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <>
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border transition-all",
            isDragging ? "bg-coral/10 border-coral/25" : "bg-ink/[0.04] border-ink/[0.08]"
          )}>
            <Upload className={cn("h-5 w-5 transition-colors", isDragging ? "text-coral" : "text-ink/30")} />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-ink">
              {isDragging ? "Drop it here!" : "Drag & drop your repository ZIP"}
            </p>
            <p className="text-[11px] text-ink/40 mt-0.5">or click to browse · max 4 MB · .zip only</p>
          </div>
        </>
      )}
    </div>
  );
}