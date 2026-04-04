"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, RouterOutputs } from "@/trpc/react";
import { Calendar, Clock, Sparkles, VideoIcon, Zap } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="size-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-700" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading analysis...</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-6 py-8 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[32px] bg-indigo-50/50 border border-indigo-100 p-6">
        <div className="flex items-center gap-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-700 text-white shadow-xl shadow-indigo-100">
            <VideoIcon className="size-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {meeting.name}
            </h1>
            <div className="flex items-center gap-4 text-[10px] font-extrabold text-slate-400">
              <span className="flex items-center gap-1.5 uppercase tracking-widest ">
                <Calendar className="size-3 text-indigo-500" />
                {meeting.createdAt?.toLocaleDateString()}
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="flex items-center gap-1.5 uppercase tracking-widest text-indigo-700">
                <Zap className="size-3" />
                {meeting.issues.length} Findings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {meeting.issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
      
      {meeting.issues.length === 0 && (
         <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50/30 py-20 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <VideoIcon className="size-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No findings</h3>
            <p className="text-xs font-medium text-slate-500 max-w-[300px] mt-1">
              The transcript is still being analyzed or no significant findings were identified.
            </p>
          </div>
      )}
    </div>
  );
};

function IssueCard({
  issue,
}: {
  issue: NonNullable<
    RouterOutputs["project"]["getMeetingById"]
  >["issues"][number];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] border-none p-0 shadow-2xl overflow-hidden">
          <div className="bg-white">
            <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-700 uppercase tracking-widest">
                Detail
              </div>
              <DialogTitle className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {issue.gist}
              </DialogTitle>
              <p className="mt-4 text-base font-bold text-slate-700">{issue.headline}</p>
            </div>
            
            <div className="px-8 py-10 space-y-8">
              <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100 shadow-inner">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock className="size-3.5" />
                  Moment: {issue.start} - {issue.end}
                </div>
                <p className="text-lg font-medium italic leading-relaxed text-slate-700">
                  "{issue.summary}"
                </p>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-indigo-700 px-8 font-bold text-white transition-all hover:bg-indigo-800"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="group flex flex-col justify-between overflow-hidden rounded-[32px] border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/40 transition-all hover:border-indigo-100 hover:shadow-md">
        <div className="space-y-4 text-left">
          <div className="rounded-2xl bg-indigo-50/50 px-4 py-2 text-xs font-bold text-indigo-700 inline-block">
            {issue.gist}
          </div>
          <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
             {issue.headline}
          </CardTitle>
          <div className="h-px bg-slate-100" />
          <p className="line-clamp-3 text-xs font-medium leading-relaxed text-slate-500">
             {issue.summary}
          </p>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Clock className="size-3" />
              {issue.start}
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setOpen(true)}
              className="rounded-full h-9 px-4 text-xs font-bold text-slate-900 hover:bg-slate-100"
            >
              View →
            </Button>
        </div>
      </Card>
    </>
  );
}

export default IssueList;
