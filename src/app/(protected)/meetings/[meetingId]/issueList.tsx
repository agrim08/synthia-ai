"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, RouterOutputs } from "@/trpc/react";
import { VideoIcon } from "lucide-react";
import React, { useState } from "react";

type Props = {
  meetingId: string;
};

const IssueList = ({ meetingId }: Props) => {
  const { data: meeting, isLoading } = api.project.getMeetingById?.useQuery(
    { meetingId },
    { refetchInterval: 4000 },
  );

  if (isLoading || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        <p className="text-[13px] text-slate-400">Loading analysis…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[15px] font-semibold text-slate-900 tracking-tight truncate">
          {meeting.name}
        </h1>
        <div className="flex items-center gap-2 text-[12px] text-slate-400">
          <span>{meeting.createdAt?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          {meeting.issues.length > 0 && (
            <>
              <span>·</span>
              <span>{meeting.issues.length} findings</span>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Issues grid */}
      {meeting.issues.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {meeting.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 mb-4">
            <VideoIcon className="size-4 text-slate-300" />
          </div>
          <p className="text-[14px] font-medium text-slate-700">No findings</p>
          <p className="text-[13px] text-slate-400 mt-1 max-w-[240px]">
            The transcript is still being analyzed or nothing significant was found.
          </p>
        </div>
      )}
    </div>
  );
};

function IssueCard({
  issue,
}: {
  issue: NonNullable<RouterOutputs["project"]["getMeetingById"]>["issues"][number];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl border border-slate-100 shadow-xl p-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-widest text-indigo-600">
                {issue.gist}
              </span>
              <DialogTitle className="text-[15px] font-semibold text-slate-900 leading-snug">
                {issue.headline}
              </DialogTitle>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 space-y-1.5">
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">
                {issue.start} – {issue.end}
              </p>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {issue.summary}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="h-8 px-3 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card */}
      <button
        onClick={() => setOpen(true)}
        className="group w-full text-left rounded-lg border border-slate-100 bg-white p-4 hover:border-slate-200 hover:bg-slate-50/60 transition-colors duration-150 space-y-2.5"
      >
        <span className="text-[11px] font-medium uppercase tracking-widest text-indigo-600">
          {issue.gist}
        </span>
        <p className="text-[13px] font-medium text-slate-800 leading-snug group-hover:text-slate-900">
          {issue.headline}
        </p>
        <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2">
          {issue.summary}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-300">{issue.start}</span>
          <span className="text-[12px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View →
          </span>
        </div>
      </button>
    </>
  );
}

export default IssueList;