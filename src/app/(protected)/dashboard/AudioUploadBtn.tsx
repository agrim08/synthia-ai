"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/firebase";
import { Mic, AudioLines, Plus } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/trpc/react";
import useProject from "@/hooks/useProject";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AudioUploadBtn = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
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
    maxSize: 50000000,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      const file = acceptedFiles[0];

      if (!project || !file) return;

      try {
        const downloadUrl = (await uploadFile(file as File, setProgress)) as string;

        uploadMeeting.mutate(
          {
            meetingUrl: downloadUrl,
            projectId: project?.id,
            name: file.name,
          },
          {
            onSuccess: (meeting) => {
              toast.success("Meeting uploaded! Analysis starting...");
              setOpen(false);
              router.push("/meetings");
              processMeeting.mutateAsync({
                meetingUrl: downloadUrl,
                projectId: project?.id,
                meetingId: meeting!.id,
              });
            },
            onError: () => {
              toast.error("Failed to upload recording");
            },
          }
        );
      } catch (error) {
        toast.error("Cloud storage error");
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="h-8 rounded-lg bg-indigo-700 px-3 text-[11px] font-bold text-white transition-all hover:bg-indigo-800 shadow-sm hover:shadow-indigo-200/50 hover:scale-105 active:scale-95 flex items-center gap-1.5"
        >
          <Mic className="size-3.5" />
          <span>Audio synthesis</span>
          <Plus className="size-3 opacity-60" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[32px] border-none p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
            Sync Meeting Audio
          </DialogTitle>
          <p className="text-sm text-slate-500 font-medium">
            Upload voice recordings for analysis.
          </p>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={cn(
            "mt-6 flex flex-col items-center justify-center border-2 border-dashed rounded-[24px] bg-slate-50 p-10 transition-all cursor-pointer",
            isDragActive ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-100/50",
            isUploading && "pointer-events-none opacity-50 cursor-wait"
          )}
        >
          <input {...getInputProps()} />
          
          {!isUploading ? (
            <>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 mb-4 group-hover:text-indigo-600 transition-colors">
                <AudioLines className="size-7" />
              </div>
              <p className="text-sm font-bold text-slate-700">Drop your file here</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-black">Supported: .mp3, .wav, .m4a</p>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="size-24 mb-4">
                <CircularProgressbar
                  value={progress}
                  text={`${Math.round(progress)}%`}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: "#4338ca",
                    trailColor: "#f1f5f9",
                    textColor: "#0f172a",
                  })}
                />
              </div>
              <p className="text-sm font-bold text-slate-900">Uploading...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioUploadBtn;
