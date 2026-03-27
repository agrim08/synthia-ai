"use client";

import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/MeetingCard";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Trash2, Video, Presentation, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import useRefetch from "@/hooks/useRefetch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MeetingsPage = () => {
  const { project } = useProject();
  const projectId = project?.id || "";
  const refetch = useRefetch();

  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    { enabled: !!project, refetchInterval: 4000 },
  );

  const deleteMeeting = api.project.deleteMeeting.useMutation();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Upload/Create Section with Header Context */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between px-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-700 text-white shadow-xl shadow-indigo-100 ring-1 ring-indigo-400/50">
                 <Presentation className="size-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Meeting Intelligence
              </h2>
            </div>
          </div>
        </div>
        <MeetingCard />
      </section>

      {/* History Section */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2.5 group cursor-default">
              <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                 <Video className="size-4 text-slate-400 group-hover:text-indigo-700 transition-colors" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Archived Transcripts</h2>
              <span className="ml-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-1 text-xs font-black text-slate-400 uppercase tracking-widest">
                {meetings?.length || 0}
              </span>
           </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[32px]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {meetings?.map((meeting) => (
              <div
                key={meeting.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:bg-slate-50/50 hover:border-indigo-100 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="relative flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-slate-50 text-slate-400 group-hover:bg-indigo-700 group-hover:text-white transition-all duration-500 shadow-inner">
                    <Video className="size-6" />
                    <div className="absolute -right-1.5 -top-1.5 size-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-lg ring-2 ring-white">
                       <Sparkles className="size-2.5" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="text-lg font-black text-slate-900 hover:text-indigo-700 transition-colors"
                      >
                        {meeting.name}
                      </Link>
                      {meeting.status === "PROCESSING" ? (
                        <Badge
                          className="bg-amber-50 text-amber-600 border-amber-100 font-extrabold px-2 py-0.5 text-[8px] uppercase tracking-widest rounded-full"
                          variant="outline"
                        >
                          Indexing...
                        </Badge>
                      ) : (
                        <Badge
                          className="bg-indigo-50 text-indigo-700 border-indigo-100 font-extrabold px-2 py-0.5 text-[8px] uppercase tracking-widest rounded-full"
                          variant="outline"
                        >
                          Processed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Calendar className="size-3 text-slate-300" />
                        {meeting.createdAt?.toLocaleDateString(undefined, {
                           month: 'short',
                           day: 'numeric'
                        })}
                      </div>
                      <div className="h-3 w-px bg-slate-200 hidden sm:block" />
                      <div className="flex items-center gap-2">
                         <span className={cn(
                           "px-2 px-py-0.5 rounded-full text-[9px] uppercase font-bold tracking-widest border",
                           meeting.issues.length > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                         )}>
                            {meeting.issues.length} Insights
                         </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-0 flex items-center gap-3">
                  <Link href={`/meetings/${meeting.id}`} className="flex-1 sm:flex-none">
                    <Button 
                      className="w-full sm:w-auto h-10 rounded-xl bg-indigo-700 px-6 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-800"
                    >
                      Analyze
                      <BookOpen className="ml-2 size-3.5" />
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-12 rounded-2xl border border-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                        disabled={deleteMeeting.isPending}
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[40px] border-none shadow-3xl p-10 max-w-lg">
                      <AlertDialogHeader className="space-y-4">
                        <div className="size-14 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
                           <AlertCircle className="size-7 text-red-500" />
                        </div>
                        <AlertDialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                          Scrub Insight History?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs font-medium text-slate-500 leading-relaxed">
                          This operation will permanently eliminate transcription data, AI summaries, and mapped issues. This action is <span className="text-red-600 font-bold uppercase tracking-widest text-[10px]">Irreversible</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-10 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl font-black border-slate-100 hover:bg-slate-50 px-8">Retain</AlertDialogCancel>
                        <AlertDialogAction
                          className="h-12 rounded-2xl bg-red-600 font-black text-white hover:bg-red-700 px-10 shadow-lg shadow-red-100"
                          onClick={() =>
                            deleteMeeting.mutate(
                              { meetingId: meeting.id },
                              {
                                onSuccess: () => {
                                  toast.success("Intelligence record purged");
                                  refetch();
                                },
                                onError: () => {
                                  toast.error("Cleanup execution failed");
                                },
                              },
                            )
                          }
                        >
                          Scrub Record
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {!meetings?.length && !isLoading && (
              <div className="flex flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-slate-100 bg-slate-50/30 py-24 text-center">
                <div className="rounded-xl bg-slate-100 p-3 mb-6 shadow-inner ring-1 ring-slate-200/50">
                  <Video className="size-6 text-slate-200" />
                </div>
                <h3 className="text-xl text-slate-900 tracking-tight">Transcription Desk Ready</h3>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default MeetingsPage;
