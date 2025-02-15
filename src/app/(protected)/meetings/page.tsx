"use client";

import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/MeetingCard";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useRefetch from "@/hooks/useRefetch";

const MeetingsPage = () => {
  const { project } = useProject();
  const projectId = project?.id || "";
  const refetch = useRefetch();

  // Always call the hook, but disable it until a project is available.
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    { enabled: !!project, refetchInterval: 4000 },
  );

  const deleteMeeting = api.project.deleteMeeting.useMutation();

  if (!project) {
    return <div>Loading project...</div>;
  }

  return (
    <div>
      <MeetingCard />
      {!meetings || (meetings.length === 0 && <div>No meeting Found</div>)}
      <div className="h-6" />
      <h1 className="text-2xl font-semibold">MEETINGS</h1>
      {isLoading && <div>Loading</div>}
      <ul className="divide-y divide-gray-200">
        {meetings!?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>
                  {meeting.status === "PROCESSING" ? (
                    <Badge
                      className="bg-yellow-500 text-white"
                      variant={"secondary"}
                    >
                      Processing...
                    </Badge>
                  ) : (
                    <Badge
                      className="bg-green-500 text-white"
                      variant={"outline"}
                    >
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-x-2 text-xs text-gray-400">
                <p className="whitespace-nowrap">
                  {meeting.createdAt?.toLocaleDateString()}
                </p>
                <p className="truncate">{meeting.issues.length} issues</p>
              </div>
            </div>

            <div className="flex flex-none items-center gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
                <Button variant={"outline"}>
                  View <BookOpen />
                </Button>
              </Link>
              <Button
                variant={"destructive"}
                disabled={deleteMeeting.isPending}
                onClick={() =>
                  deleteMeeting.mutate(
                    { meetingId: meeting.id },
                    {
                      onSuccess: () => {
                        toast.success("Meeting deleted successfully");
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to delete meeting");
                      },
                    },
                  )
                }
              >
                <Trash2 size={"6"} />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MeetingsPage;
