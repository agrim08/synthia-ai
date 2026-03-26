"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { AudioLines, Mic, Sparkles, Video } from "lucide-react";
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
    maxSize: 50000000, //50mb
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      const file = acceptedFiles[0];

      if (!project) return;
      if (!file) return;

      try {
        const downloadUrl = (await uploadFile(
          file as File,
          setProgress,
        )) as string;

        uploadMeeting.mutate(
          {
            meetingUrl: downloadUrl,
            projectId: project?.id,
            name: file.name,
          },
          {
            onSuccess: (meeting) => {
              toast.success("Meeting uploaded! Analysis starting...");
              router.push("/meetings");
              processMeeting.mutateAsync({
                meetingUrl: downloadUrl,
                projectId: project?.id,
                meetingId: meeting!.id,
              });
            },
            onError: (error) => {
              toast.error("Failed to upload recording");
              console.error(error);
            },
          },
        );
      } catch (error) {
        toast.error("Cloud storage error");
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <Card
      className={cn(
        "group h-full flex flex-col items-center justify-center border border-slate-200 rounded-[40px] bg-white transition-all duration-300 relative overflow-hidden",
        isDragActive ? "border-indigo-400 bg-indigo-50/50 scale-[0.98]" : "hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/40 cursor-pointer hover:translate-y-[-4px] active:translate-y-0",
        isUploading && "pointer-events-none opacity-90 cursor-wait"
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      
      {!isUploading ? (
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 size-16 rounded-2xl bg-indigo-50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex size-16 items-center justify-center rounded-[20px] bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-indigo-700 group-hover:text-white group-hover:border-indigo-700 transition-all duration-500 shadow-sm">
              <AudioLines className="size-8" />
            </div>
            <div className="absolute -right-3 -top-3 flex size-6 items-center justify-center rounded-full bg-indigo-700 text-white shadow-lg ring-4 ring-white group-hover:scale-110 transition-transform">
               <Mic className="size-3" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none transition-colors">
              Meeting Analyst
            </h3>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.08em] block mt-1.5">Transcription & Analysis</span>
          </div>

          <div className="mt-8">
            <Button
              className="rounded-full h-11 bg-indigo-700 text-white px-8 font-black text-sm transition-all hover:bg-indigo-800 active:scale-95 shadow-lg shadow-indigo-100/50"
              asChild
            >
              <span>Browse Recording</span>
            </Button>
            <div className="mt-4 flex items-center justify-center gap-1.5 opacity-40">
               <Sparkles className="size-3 text-indigo-400" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">Supported AI Engine v2</span>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="size-36 relative mb-8">
            <CircularProgressbar
              value={progress}
              text={`${Math.round(progress)}%`}
              strokeWidth={10}
              styles={buildStyles({
                pathColor: "#4338ca",
                trailColor: "#f1f5f9",
                textColor: "#0f172a",
                textSize: "20px",
                strokeLinecap: "round",
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-xl font-black text-slate-900">Syncing Media...</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Do not refresh your session</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default MeetingCard;
