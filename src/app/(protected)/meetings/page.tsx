"use client";

import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/MeetingCard";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Trash2, Video, Presentation, Sparkles, AlertCircle, History, Zap } from "lucide-react";
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
import { motion } from "framer-motion";

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
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
                 <Video className="size-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Meetings
              </h2>
            </div>
          </div>
        </div>
        <MeetingCard />
      </section>

      {/* History Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
                 <History className="size-5 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                  History
                </h2>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                   {meetings?.length || 0} recordings
                </p>
              </div>
           </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-[32px]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {meetings?.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div
                  className="w-full flex items-center justify-between gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/20 transition-all hover:bg-slate-50 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/30 text-left outline-none relative z-10"
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="flex-1 min-w-0 space-y-1">
                       <div className="flex items-center gap-3">
                          <Link
                            href={`/meetings/${meeting.id}`}
                            className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors"
                          >
                            {meeting.name}
                          </Link>
                          {meeting.status === "PROCESSING" ? (
                            <Badge
                              className="bg-amber-50 text-amber-600 border-amber-100 font-extrabold px-2 py-0.5 text-[8px] uppercase tracking-widest rounded-full"
                              variant="outline"
                            >
                              Syncing...
                            </Badge>
                          ) : (
                            <Badge
                              className="bg-emerald-50 text-emerald-600 border-emerald-100 font-extrabold px-2 py-0.5 text-[8px] uppercase tracking-widest rounded-full"
                              variant="outline"
                            >
                              Analyzed
                            </Badge>
                          )}
                       </div>
                       
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                             <Calendar className="size-3.5" />
                             {new Date(meeting.createdAt).toLocaleDateString()}
                          </div>
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500/80 uppercase tracking-wider">
                             <Zap className="size-3.5" />
                             {meeting.issues.length} Results
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <Link href={`/meetings/${meeting.id}`}>
                      <Button 
                        variant="ghost"
                        className="rounded-2xl h-10 px-6 font-black text-slate-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                      >
                        View Details
                      </Button>
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                          disabled={deleteMeeting.isPending}
                        >
                          <Trash2 className="size-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[40px] border-none shadow-3xl p-10 max-w-lg bg-white">
                        <AlertDialogHeader className="space-y-4">
                          <div className="size-14 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
                             <AlertCircle className="size-7 text-red-500" />
                          </div>
                          <AlertDialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            Delete meeting?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs font-medium text-slate-500 leading-relaxed">
                            This recording and its associated analysis will be permanently deleted. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-10 gap-3">
                          <AlertDialogCancel className="h-12 rounded-2xl font-black border-slate-100 hover:bg-slate-50 px-8">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="h-12 rounded-2xl bg-red-600 font-black text-white hover:bg-red-700 px-10 shadow-lg shadow-red-100"
                            onClick={() =>
                              deleteMeeting.mutate(
                                { meetingId: meeting.id },
                                {
                                  onSuccess: () => {
                                    toast.success("Meeting deleted");
                                    refetch();
                                  },
                                  onError: () => {
                                    toast.error("Failed to delete meeting");
                                  },
                                },
                              )
                            }
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ))}

            {!meetings?.length && !isLoading && (
              <div className="flex flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-slate-100 bg-slate-50/30 py-32 text-center">
                <div className="rounded-2xl bg-white p-4 mb-6 shadow-sm ring-1 ring-slate-100">
                  <Video className="size-8 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">History is Empty</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-[200px]">Upload a recording to get started.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default MeetingsPage;
