"use client";

import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type JobProgressTone = "indigo" | "sky" | "amber" | "red";

const toneClasses: Record<JobProgressTone, string> = {
  indigo: "border-indigo-200 bg-indigo-50",
  sky: "border-sky-200 bg-sky-50",
  amber: "border-amber-200 bg-amber-50",
  red: "border-red-200 bg-red-50",
};

const barTone: Record<JobProgressTone, string> = {
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  amber: "bg-amber-400",
  red: "bg-red-400",
};

type IconMode = "spinner-indigo" | "spinner-sky" | "warn" | "error" | "success";

function StatusIcon({ mode }: { mode: IconMode }) {
  switch (mode) {
    case "spinner-sky":
      return <Loader2 className="size-5 animate-spin text-sky-600" />;
    case "warn":
      return <AlertCircle className="size-5 text-amber-500" />;
    case "error":
      return <AlertCircle className="size-5 text-red-500" />;
    case "success":
      return <CheckCircle2 className="size-5 text-emerald-500" />;
    default:
      return <Loader2 className="size-5 animate-spin text-indigo-600" />;
  }
}

export type JobProgressBannerProps = {
  tone: JobProgressTone;
  iconMode: IconMode;
  title: string;
  description: string;
  /** When true, show a pulsing bar (unknown total / connecting to GitHub). */
  indeterminate?: boolean;
  /** 0–100 when determinate; ignored if indeterminate */
  pct?: number;
  /** Shown as "a / b" when both known (b > 0) */
  progress?: number;
  total?: number;
  showResume?: boolean;
  resumePending?: boolean;
  onResume?: () => void;
};

/**
 * Shared layout for “indexing” and “syncing” background jobs (same card as dashboard screenshot).
 */
export function JobProgressBanner({
  tone,
  iconMode,
  title,
  description,
  indeterminate,
  pct = 0,
  progress = 0,
  total = 0,
  showResume,
  resumePending,
  onResume,
}: JobProgressBannerProps) {
  const showCounts = total > 0;
  const safePct = indeterminate ? 0 : Math.min(100, Math.max(0, pct));

  return (
    <div
      className={cn(
        "mx-6 mt-4 rounded-xl border px-5 py-4 transition-all",
        toneClasses[tone],
      )}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 shrink-0">
          <StatusIcon mode={iconMode} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>

          {(indeterminate || (showCounts && total > 0)) && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Zap className="size-3" />
                  {indeterminate ? "In progress" : `${safePct}% complete`}
                </span>
                {showCounts && !indeterminate && (
                  <span>
                    {progress} / {total} files
                  </span>
                )}
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                {indeterminate ? (
                  <div
                    className={cn(
                      "h-full w-full rounded-full opacity-80 animate-pulse",
                      barTone[tone],
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      barTone[tone],
                    )}
                    style={{ width: `${safePct}%` }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {showResume && onResume && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 text-xs border-slate-300 hover:border-indigo-400 hover:text-indigo-700"
            onClick={onResume}
            disabled={resumePending}
          >
            {resumePending ? (
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
