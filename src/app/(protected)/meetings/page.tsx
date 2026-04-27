"use client";

import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/MeetingCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Video } from "lucide-react";
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
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

      {/* Upload */}
      <MeetingCard />

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* History */}
      <section className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
            Meetings
          </h2>
          {!isLoading && !!meetings?.length && (
            <span className="text-[13px] text-slate-400 tabular-nums">
              {meetings.length}
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* List */}
        {!isLoading && !!meetings?.length && (
          <div className="divide-y divide-slate-100">
            {meetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
                className="group flex items-center justify-between gap-4 py-3"
              >
                {/* Left */}
                <Link
                  href={`/meetings/${meeting.id}`}
                  className="flex-1 min-w-0 space-y-0.5"
                >
                  <p className="text-[14px] font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors duration-150">
                    {meeting.name}
                  </p>
                  <p className="text-[12px] text-slate-400">
                    {new Date(meeting.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </Link>

                {/* Right */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/meetings/${meeting.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium transition-colors"
                    >
                      View
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        disabled={deleteMeeting.isPending}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border border-slate-100 shadow-xl max-w-sm p-6">
                      <AlertDialogHeader className="space-y-1.5">
                        <AlertDialogTitle className="text-[15px] font-semibold text-slate-900">
                          Delete meeting?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[13px] text-slate-500 leading-relaxed">
                          This recording and its analysis will be permanently removed. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6 gap-2">
                        <AlertDialogCancel className="h-9 rounded-md text-[13px] font-medium border-slate-200 hover:bg-slate-50">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="h-9 rounded-md text-[13px] font-medium bg-red-600 text-white hover:bg-red-700 shadow-none"
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
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !meetings?.length && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-10 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 mb-4">
              <Video className="size-4 text-slate-300" />
            </div>
            <p className="text-[14px] font-medium text-slate-700">
              {project ? "No meetings yet" : "No project selected"}
            </p>
            <p className="text-[13px] text-slate-400 mt-1">
              {project 
                ? "Upload a recording above to get started." 
                : "Select or link a project to view and upload meetings."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MeetingsPage;