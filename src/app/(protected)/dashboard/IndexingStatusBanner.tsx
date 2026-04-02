"use client";

import { api } from "@/trpc/react";
import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = { projectId: string };

const STATUS_POLL_INTERVAL_MS = 4_000;

export default function IndexingStatusBanner({ projectId }: Props) {
  const utils = api.useUtils();

  const { data, isLoading } = api.project.getProjectStatus.useQuery(
    { projectId },
    {
      // Poll while indexing is in progress
      refetchInterval: (query) => {
        const s = query.state.data?.indexingStatus;
        return s === "INDEXING" || s === "PENDING" ? STATUS_POLL_INTERVAL_MS : false;
      },
      refetchIntervalInBackground: true,
    },
  );

  const retrigger = api.project.retriggerIndexing.useMutation({
    onSuccess: () => {
      toast.success("Indexing resumed! We'll notify you when it's done.");
      void utils.project.getProjectStatus.invalidate({ projectId });
    },
    onError: (e) => toast.error(e.message),
  });

  // Notify when indexing finishes
  const prevStatus = useRef<string | undefined>();
  useEffect(() => {
    if (!data) return;
    const curr = data.indexingStatus;
    const prev = prevStatus.current;
    if (prev === "INDEXING" && curr === "COMPLETED") {
      toast.success("🎉 Project indexed successfully! AI features are now active.");
    } else if (prev === "INDEXING" && curr === "PARTIAL") {
      toast.warning("Indexing paused due to rate limits. Use 'Resume' to continue.");
    } else if (prev === "INDEXING" && curr === "FAILED") {
      toast.error("Indexing failed. Check the error below.");
    }
    prevStatus.current = curr;
  }, [data?.indexingStatus]);

  if (isLoading || !data) return null;

  const { indexingStatus, indexingProgress, indexingTotal, indexingError } = data;

  // Don't show anything once fully completed
  if (indexingStatus === "COMPLETED") return null;

  const pct =
    indexingTotal > 0 ? Math.round((indexingProgress / indexingTotal) * 100) : 0;

  return (
    <div
      className={`mx-6 mt-4 rounded-xl border px-5 py-4 transition-all ${
        indexingStatus === "FAILED"
          ? "border-red-200 bg-red-50"
          : indexingStatus === "PARTIAL"
            ? "border-amber-200 bg-amber-50"
            : "border-indigo-200 bg-indigo-50"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="mt-0.5 shrink-0">
          {indexingStatus === "FAILED" ? (
            <AlertCircle className="size-5 text-red-500" />
          ) : indexingStatus === "PARTIAL" ? (
            <AlertCircle className="size-5 text-amber-500" />
          ) : indexingStatus === "COMPLETED" ? (
            <CheckCircle2 className="size-5 text-emerald-500" />
          ) : (
            <Loader2 className="size-5 animate-spin text-indigo-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Heading */}
          <p className="text-sm font-semibold text-slate-800">
            {indexingStatus === "PENDING" && "Preparing to index your repository…"}
            {indexingStatus === "INDEXING" && "Indexing repository in the background"}
            {indexingStatus === "PARTIAL" && "Indexing paused — rate limit reached"}
            {indexingStatus === "FAILED" && "Indexing failed"}
          </p>

          {/* Sub-message */}
          <p className="mt-0.5 text-xs text-slate-500">
            {indexingStatus === "PENDING" &&
              "Your project has been created. AI indexing will start momentarily."}
            {indexingStatus === "INDEXING" &&
              `Processing files… ${indexingProgress} of ${indexingTotal || "?"} done. You can keep using the app — we'll notify you when ready.`}
            {indexingStatus === "PARTIAL" &&
              `${indexingProgress} of ${indexingTotal} files indexed. Click Resume to continue from where we left off.`}
            {indexingStatus === "FAILED" && (indexingError ?? "An unknown error occurred.")}
          </p>

          {/* Progress bar */}
          {(indexingStatus === "INDEXING" || indexingStatus === "PARTIAL") &&
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
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
        </div>

        {/* Action button */}
        {(indexingStatus === "PARTIAL" || indexingStatus === "FAILED") && (
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
