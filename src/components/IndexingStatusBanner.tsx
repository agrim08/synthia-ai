"use client";

import { api } from "@/trpc/react";
import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = { projectId: string };

const STATUS_POLL_INTERVAL_MS = 4_000;
/** Infrequent GitHub HEAD check to schedule incremental sync (matches server-side rate limits). */
const SYNC_KICK_INTERVAL_MS = 90_000;

export default function IndexingStatusBanner({ projectId }: Props) {
  const utils = api.useUtils();

  const kickSyncIfBehind = api.project.syncRepoIfBehind.useMutation();

  useEffect(() => {
    const run = () => {
      void kickSyncIfBehind.mutate(
        { projectId },
        {
          onError: () => {
            /* non-fatal: private repo without server token, offline, etc. */
          },
        },
      );
    };
    run();
    const id = window.setInterval(run, SYNC_KICK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [projectId]);

  const { data, isLoading } = api.project.getProjectStatus.useQuery(
    { projectId },
    {
      refetchInterval: (query) => {
        const s = (query.state.data as any)?.indexingStatus;
        return s === "INDEXING" ||
          s === "PENDING" ||
          s === "SYNCING" ||
          s === "PARTIAL"
          ? STATUS_POLL_INTERVAL_MS
          : false;
      },
      refetchIntervalInBackground: true,
    },
  );

  const retrigger = api.project.retriggerIndexing.useMutation({
    onSuccess: () => {
      toast.success("Job resumed! We'll notify you when it's done.");
      void utils.project.getProjectStatus.invalidate({ projectId });
    },
    onError: (e) => toast.error(e.message),
  });

  const prevStatus = useRef<string | undefined>();
  useEffect(() => {
    if (!data) return;
    const curr = (data as any).indexingStatus;
    const prev = prevStatus.current;
    if (prev === "INDEXING" && curr === "COMPLETED") {
      toast.success("🎉 Project indexed successfully! AI features are now active.");
    } else if (prev === "SYNCING" && curr === "COMPLETED") {
      toast.success("Repository synced with the latest GitHub changes.");
    } else if (prev === "INDEXING" && curr === "PARTIAL") {
      toast.warning("Indexing paused due to rate limits. Use 'Resume' to continue.");
    } else if (prev === "SYNCING" && curr === "PARTIAL") {
      toast.warning("Sync paused (time or rate limit). Resuming automatically…");
    } else if (prev === "INDEXING" && curr === "FAILED") {
      toast.error("Indexing failed. Check the error below.");
    } else if (prev === "SYNCING" && curr === "FAILED") {
      toast.error("Sync failed. Check the error below.");
    }
    prevStatus.current = curr;
  }, [data]);

  if (isLoading || !data) return null;
  const d = data as any;
  const {
    indexingStatus,
    indexingProgress,
    indexingTotal,
    indexingError,
    hasSyncCheckpoint,
  } = d;

  if (indexingStatus === "COMPLETED") return null;

  const pct =
    (indexingTotal as number) > 0
      ? Math.round(((indexingProgress as number) / (indexingTotal as number)) * 100)
      : 0;

  return (
    <div
      className={`mx-6 mt-4 rounded-xl border px-5 py-4 transition-all ${
        indexingStatus === "FAILED"
          ? "border-red-200 bg-red-50"
          : indexingStatus === "PARTIAL"
            ? "border-amber-200 bg-amber-50"
            : indexingStatus === "SYNCING"
              ? "border-sky-200 bg-sky-50"
              : "border-indigo-200 bg-indigo-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 shrink-0">
          {indexingStatus === "FAILED" ? (
            <AlertCircle className="size-5 text-red-500" />
          ) : indexingStatus === "PARTIAL" ? (
            <AlertCircle className="size-5 text-amber-500" />
          ) : indexingStatus === "COMPLETED" ? (
            <CheckCircle2 className="size-5 text-emerald-500" />
          ) : indexingStatus === "SYNCING" ? (
            <Loader2 className="size-5 animate-spin text-sky-600" />
          ) : (
            <Loader2 className="size-5 animate-spin text-indigo-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            {indexingStatus === "PENDING" && "Preparing to index your repository…"}
            {indexingStatus === "INDEXING" && "Indexing repository in the background"}
            {indexingStatus === "SYNCING" &&
              "Syncing new changes from GitHub — updating embeddings for changed files."}
            {indexingStatus === "PARTIAL" &&
              (hasSyncCheckpoint
                ? "Sync paused — will resume automatically"
                : "Indexing paused — rate limit reached")}
            {indexingStatus === "FAILED" &&
              (hasSyncCheckpoint ? "Sync failed" : "Indexing failed")}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {indexingStatus === "PENDING" &&
              "Your project has been created. AI indexing will start momentarily."}
            {indexingStatus === "INDEXING" &&
              `Processing files… ${indexingProgress} of ${indexingTotal || "?"} done. You can keep using the app — we'll notify you when ready.`}
            {indexingStatus === "SYNCING" &&
              `Applying updates… ${indexingProgress} of ${indexingTotal || "?"} files. You can keep working — this runs in the background.`}
            {indexingStatus === "PARTIAL" &&
              (hasSyncCheckpoint
                ? `${indexingProgress} of ${indexingTotal} files updated. Resume if sync does not continue.`
                : `${indexingProgress} of ${indexingTotal} files indexed. Click Resume to continue from where we left off.`)}
            {indexingStatus === "FAILED" && (indexingError ?? "An unknown error occurred.")}
          </p>

          {(indexingStatus === "INDEXING" ||
            indexingStatus === "SYNCING" ||
            indexingStatus === "PARTIAL") &&
            indexingTotal > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Zap className="size-3" />
                    {pct}% complete
                  </span>
                  <span>
                    {indexingProgress} / {indexingTotal} files
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      indexingStatus === "PARTIAL"
                        ? "bg-amber-400"
                        : indexingStatus === "SYNCING"
                          ? "bg-sky-500"
                          : "bg-indigo-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
        </div>

        {(indexingStatus === "PARTIAL" ||
          indexingStatus === "FAILED" ||
          indexingStatus === "INDEXING" ||
          indexingStatus === "SYNCING") && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 text-xs border-slate-300 hover:border-indigo-400 hover:text-indigo-700"
            onClick={() => retrigger.mutate({ projectId })}
            disabled={retrigger.isPending}
          >
            {retrigger.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
            Resume
          </Button>
        )}
      </div>
    </div>
  );
}
