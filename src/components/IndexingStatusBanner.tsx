"use client";

import { api } from "@/trpc/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { JobProgressBanner } from "@/components/JobProgressBanner";

type Props = { projectId: string };

const STATUS_POLL_INTERVAL_MS = 4_000;
const SYNC_KICK_INTERVAL_MS = 90_000;
const SYNC_WATCH_POLL_MS = 2_500;
const COMPLETED_IDLE_POLL_MS = 30_000;

export default function IndexingStatusBanner({ projectId }: Props) {
  const utils = api.useUtils();
  const [syncWatch, setSyncWatch] = useState(false);

  const kickSyncIfBehind = api.project.syncRepoIfBehind.useMutation({
    onSuccess: (result) => {
      void utils.project.getProjectStatus.invalidate({ projectId });
      if (result.action === "scheduled") {
        setSyncWatch(true);
      }
    },
    onError: () => {
      /* non-fatal */
    },
  });

  useEffect(() => {
    const run = () => {
      void kickSyncIfBehind.mutate({ projectId });
    };
    run();
    const id = window.setInterval(run, SYNC_KICK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [projectId]);

  useEffect(() => {
    if (!syncWatch) return;
    const t = window.setTimeout(() => setSyncWatch(false), 120_000);
    return () => window.clearTimeout(t);
  }, [syncWatch]);

  const { data, isLoading } = api.project.getProjectStatus.useQuery(
    { projectId },
    {
      refetchInterval: (query) => {
        const s = (query.state.data as any)?.indexingStatus;
        if (
          s === "INDEXING" ||
          s === "PENDING" ||
          s === "SYNCING" ||
          s === "PARTIAL"
        ) {
          return STATUS_POLL_INTERVAL_MS;
        }
        if (s === "COMPLETED" && syncWatch) {
          return SYNC_WATCH_POLL_MS;
        }
        if (s === "COMPLETED") {
          return COMPLETED_IDLE_POLL_MS;
        }
        return false;
      },
      refetchIntervalInBackground: true,
    },
  );

  const retrigger = api.project.retriggerIndexing.useMutation({
    onSuccess: () => {
      toast.success("Job resumed! We'll notify you when it's done.");
      void utils.project.getProjectStatus.invalidate({ projectId });
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const prevStatus = useRef<string | undefined>();
  useEffect(() => {
    if (!data) return;
    const curr = (data as any).indexingStatus;
    const prev = prevStatus.current;
    if (prev === "INDEXING" && curr === "COMPLETED") {
      toast.success("🎉 Project indexed successfully! AI features are now active.");
    } else if (prev === "SYNCING" && curr === "COMPLETED") {
      setSyncWatch(false);
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

  if (indexingStatus === "COMPLETED" && !syncWatch) return null;

  const pg = Number(indexingProgress) || 0;
  const tot = Number(indexingTotal) || 0;

  /** Repo scan / compare not finished yet — avoid showing “0 of ?” (0 is falsy in JS templates). */
  const discoveringIndex =
    indexingStatus === "INDEXING" &&
    tot === 0 &&
    pg === 0 &&
    indexingStatus !== "FAILED";
  const discoveringSync =
    indexingStatus === "SYNCING" && tot === 0 && pg === 0;

  const pct = tot > 0 ? Math.round((pg / tot) * 100) : 0;

  /* Scheduled sync but DB not yet SYNCING */
  if (indexingStatus === "COMPLETED" && syncWatch) {
    return (
      <JobProgressBanner
        tone="indigo"
        iconMode="spinner-indigo"
        title="Syncing new changes from GitHub"
        description="Connecting to your repository — the progress bar will update in a moment."
        indeterminate
        showResume={false}
      />
    );
  }

  if (indexingStatus === "FAILED") {
    return (
      <JobProgressBanner
        tone="red"
        iconMode="error"
        title={hasSyncCheckpoint ? "Sync failed" : "Indexing failed"}
        description={indexingError ?? "An unknown error occurred."}
        showResume
        resumePending={retrigger.isPending}
        onResume={() => retrigger.mutate({ projectId })}
      />
    );
  }

  if (indexingStatus === "PARTIAL") {
    return (
      <JobProgressBanner
        tone="amber"
        iconMode="warn"
        title={
          hasSyncCheckpoint
            ? "Sync paused — will resume automatically"
            : "Indexing paused — rate limit reached"
        }
        description={
          hasSyncCheckpoint
            ? `${pg} of ${tot} files updated. Resume if sync does not continue.`
            : `${pg} of ${tot} files indexed. Click Resume to continue from where we left off.`
        }
        pct={pct}
        progress={pg}
        total={tot}
        showResume
        resumePending={retrigger.isPending}
        onResume={() => retrigger.mutate({ projectId })}
      />
    );
  }

  if (indexingStatus === "PENDING") {
    return (
      <JobProgressBanner
        tone="indigo"
        iconMode="spinner-indigo"
        title="Preparing to index your repository…"
        description="Your project is queued. AI indexing will start in a moment."
        indeterminate
        showResume
        resumePending={retrigger.isPending}
        onResume={() => retrigger.mutate({ projectId })}
      />
    );
  }

  if (indexingStatus === "SYNCING") {
    if (discoveringSync) {
      return (
        <JobProgressBanner
          tone="sky"
          iconMode="spinner-sky"
          title="Syncing new changes from GitHub"
          description="Fetching commit comparison and file list from GitHub…"
          indeterminate
          showResume
          resumePending={retrigger.isPending}
          onResume={() => retrigger.mutate({ projectId })}
        />
      );
    }
    return (
      <JobProgressBanner
        tone="sky"
        iconMode="spinner-sky"
        title="Syncing new changes from GitHub"
        description={`Applying updates… ${pg} of ${tot} file(s). You can keep working — this runs in the background.`}
        pct={pct}
        progress={pg}
        total={tot}
        showResume
        resumePending={retrigger.isPending}
        onResume={() => retrigger.mutate({ projectId })}
      />
    );
  }

  /* INDEXING */
  if (discoveringIndex) {
    return (
      <JobProgressBanner
        tone="indigo"
        iconMode="spinner-indigo"
        title="Indexing repository in the background"
        description="Fetching and listing files from GitHub (this step can take 1–3 minutes on serverless). File counts appear once scanning finishes."
        indeterminate
        showResume
        resumePending={retrigger.isPending}
        onResume={() => retrigger.mutate({ projectId })}
      />
    );
  }

  return (
    <JobProgressBanner
      tone="indigo"
      iconMode="spinner-indigo"
      title="Indexing repository in the background"
      description={`Processing files… ${pg} of ${tot} done. You can keep using the app — we'll notify you when ready.`}
      pct={pct}
      progress={pg}
      total={tot}
      showResume
      resumePending={retrigger.isPending}
      onResume={() => retrigger.mutate({ projectId })}
    />
  );
}
