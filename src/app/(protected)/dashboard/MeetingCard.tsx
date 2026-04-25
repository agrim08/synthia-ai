"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/firebase";
import { AudioLines } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/trpc/react";
import useProject from "@/hooks/useProject";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";

const MeetingCard = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { project } = useProject();

  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      meetingId: string;
      projectId: string;
    }) => {
      const { meetingUrl, meetingId, projectId } = data;
      const response = await axios.post("/api/process-meeting", {
        meetingUrl,
        meetingId,
        projectId,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      const file = acceptedFiles[0];
      if (!project || !file) return;

      try {
        const downloadUrl = (await uploadFile(file as File, setProgress)) as string;

        uploadMeeting.mutate(
          { meetingUrl: downloadUrl, projectId: project.id, name: file.name },
          {
            onSuccess: (meeting) => {
              toast.success("Meeting uploaded — analysis starting");
              router.push("/meetings");
              processMeeting.mutateAsync({
                meetingUrl: downloadUrl,
                projectId: project.id,
                meetingId: meeting!.id,
              });
            },
            onError: () => toast.error("Failed to upload recording"),
          },
        );
      } catch {
        toast.error("Cloud storage error");
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border bg-white px-8 py-10 text-center transition-colors duration-150 cursor-pointer select-none",
        isDragActive
          ? "border-indigo-300 bg-indigo-50/40"
          : "border-slate-200 border-dashed hover:border-indigo-300 hover:bg-slate-50/60",
        isUploading && "pointer-events-none cursor-wait"
      )}
    >
      <input {...getInputProps()} />

      {!isUploading ? (
        <div className="flex flex-col items-center gap-4">
          {/* Icon */}
          <div className={cn(
            "flex size-10 items-center justify-center rounded-lg border transition-colors duration-150",
            isDragActive
              ? "border-indigo-200 bg-indigo-50 text-indigo-500"
              : "border-slate-100 bg-slate-50 text-slate-400"
          )}>
            <AudioLines className="size-4" />
          </div>

          {/* Text */}
          <div className="space-y-1">
            <p className="text-[14px] font-medium text-slate-800">
              {isDragActive ? "Drop to upload" : "Upload a recording"}
            </p>
            <p className="text-[12px] text-slate-400">
              MP3, WAV or M4A · max 50 MB
            </p>
          </div>

          {/* CTA */}
          <Button
            size="sm"
            className="mt-1 h-8 rounded-md bg-indigo-600 px-4 text-[13px] font-medium text-white shadow-none hover:bg-indigo-700 transition-colors"
            asChild
          >
            <span>Select file</span>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          {/* Progress */}
          <div className="size-16">
            <CircularProgressbar
              value={progress}
              text={`${Math.round(progress)}%`}
              strokeWidth={10}
              styles={buildStyles({
                pathColor: "#4f46e5",
                trailColor: "#e2e8f0",
                textColor: "#0f172a",
                textSize: "22px",
                strokeLinecap: "round",
                pathTransitionDuration: 0.4,
              })}
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-[14px] font-medium text-slate-800">Uploading…</p>
            <p className="text-[12px] text-slate-400">Do not close this tab</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCard;