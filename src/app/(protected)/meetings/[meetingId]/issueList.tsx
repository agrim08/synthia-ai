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
  DialogDescription,
  DialogHeader,
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
    return <div>Loading meeting...</div>;
  }
  return (
    <>
      <div className="px-5 py-2">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b px-6 py-2 lg:mx-0 lg:max-w-none">
          <div className="flex items-center gap-x-6">
            <div className="rounded-full border bg-gray-950 p-3 text-white">
              <VideoIcon className="h-6 w-6" />
            </div>
            <h1>
              <div className="text-xs leading-6">
                Metting on {meeting.createdAt?.toLocaleDateString()}
              </div>
              <div className="mt-1 text-base font-semibold leading-6">
                {meeting.name}
              </div>
            </h1>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {meeting.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{issue.gist}</DialogTitle>
            <DialogDescription>
              {issue.createdAt?.toLocaleDateString()}
            </DialogDescription>
            <p className="text-gray-200">{issue.headline}</p>
            <blockquote className="mt-2 border-l-4 border-gray-400 bg-black p-4">
              <span className="text-sm text-gray-300">
                {issue.start} - {issue.end}
              </span>
              <p className="font-medium italic leading-relaxed text-white/80">
                {issue.summary}
              </p>
            </blockquote>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">{issue.gist}</CardTitle>
          <div className="border-b"></div>
          <CardDescription>{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)}>Details</Button>
        </CardContent>
      </Card>
    </>
  );
}

export default IssueList;
