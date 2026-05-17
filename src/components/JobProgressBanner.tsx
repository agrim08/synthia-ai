"use client";

import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type JobProgressTone = "indigo" | "sky" | "amber" | "red";

const toneClasses: Record<JobProgressTone, string> = {
  indigo: "border-ink/10 bg-white/70 shadow-soft text-ink",
  sky: "border-sky/20 bg-sky/5 shadow-soft text-ink",
  amber: "border-butter/30 bg-butter/5 shadow-soft text-ink",
  red: "border-coral-soft/30 bg-coral-soft/5 shadow-soft text-ink",
};

const barTone: Record<JobProgressTone, string> = {
  indigo: "bg-ink",
  sky: "bg-sky",
  amber: "bg-coral",
  red: "bg-coral",
};

const accentText: Record<JobProgressTone, string> = {
  indigo: "text-coral",
  sky: "text-sky",
  amber: "text-coral",
  red: "text-coral",
};

type IconMode = "spinner-indigo" | "spinner-sky" | "warn" | "error" | "success";

function StatusIcon({ mode }: { mode: IconMode }) {
  switch (mode) {
    case "spinner-sky":
      return (
        <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-sky/15 text-sky border border-sky/10">
          <Loader2 className="size-5 animate-spin" />
        </div>
      );
    case "warn":
      return (
        <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-butter/40 text-coral border border-butter/50 animate-pulse-soft">
          <AlertCircle className="size-5" />
        </div>
      );
    case "error":
      return (
        <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-coral-soft/30 text-coral border border-coral-soft/40 animate-float" style={{ animationDuration: '4s' }}>
          <AlertCircle className="size-5" />
        </div>
      );
    case "success":
      return (
        <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-sage/20 text-sage border border-sage/30">
          <CheckCircle2 className="size-5" />
        </div>
      );
    default:
      return (
        <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-ink/5 text-ink border border-ink/10">
          <Loader2 className="size-5 animate-spin" />
        </div>
      );
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
        "mx-6 mt-5 rounded-2xl border px-6 py-5 transition-all duration-300 hover-lift hover:shadow-pop-sm hover:border-ink/20 animate-fade-up",
        toneClasses[tone],
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="shrink-0 flex items-center gap-3">
          <StatusIcon mode={iconMode} />
          <div className="sm:hidden">
            <h4 className="text-sm font-bold text-ink leading-tight">{title}</h4>
            <p className="mt-0.5 text-xs text-ink-soft leading-snug">{description}</p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="hidden sm:block">
            <h4 className="text-sm font-bold text-ink leading-tight">{title}</h4>
            <p className="mt-0.5 text-xs text-ink-soft leading-snug">{description}</p>
          </div>

          {(indeterminate || (showCounts && total > 0)) && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                <span className="flex items-center gap-1">
                  <Zap className={cn("size-3 animate-pulse-soft", accentText[tone])} />
                  {indeterminate ? "Processing" : `${safePct}% ready`}
                </span>
                {showCounts && !indeterminate && (
                  <span>
                    {progress} / {total} files
                  </span>
                )}
              </div>
              <div className="h-2 w-full rounded-full bg-ink/5 overflow-hidden border border-ink/5">
                {indeterminate ? (
                  <div
                    className={cn(
                      "h-full w-full rounded-full opacity-80 animate-shimmer bg-gradient-to-r from-transparent via-coral-soft/50 to-transparent",
                      barTone[tone],
                    )}
                    style={{ backgroundSize: '200% 100%' }}
                  />
                ) : (
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
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
            className="shrink-0 gap-1.5 text-xs font-semibold rounded-full bg-ink text-cream border border-ink shadow-pop-sm hover:shadow-pop hover:-translate-y-0.5 transition-all"
            onClick={onResume}
            disabled={resumePending}
          >
            {resumePending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Resume
          </Button>
        )}
      </div>
    </div>
  );
}

