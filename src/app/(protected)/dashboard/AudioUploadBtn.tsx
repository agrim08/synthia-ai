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

const AudioUploadBtn = ({ children }: { children?: React.ReactNode }) => {
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
    onSuccess: () => toast.success("Meeting processed successfully"),
    onError: (error) => toast.error(error.message),
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
            onError: (error) => {
              toast.error(error.message);
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
        {children ? (
          children
        ) : (
          <Button 
            disabled={!project}
            className="h-8 rounded-lg bg-indigo-700 px-3 text-[11px] font-bold text-white transition-all hover:bg-indigo-800 shadow-sm hover:shadow-indigo-200/50 flex items-center gap-1.5"
          >
            <Mic className="size-3.5" />
            <span>Audio synthesis</span>
            <Plus className="size-3 opacity-60" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[32px] border-none p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-ink tracking-tight">
            Upload Meeting Audio
          </DialogTitle>
          <p className="text-sm text-ink-soft font-medium">
            Upload voice recordings for analysis.
          </p>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={cn(
            "mt-6 flex flex-col items-center justify-center border-2 border-dashed rounded-[24px] bg-card p-10 transition-all cursor-pointer",
            isDragActive ? "border-coral bg-coral/10" : "border-ink/10 hover:border-ink/20 hover:bg-cream-deep/50",
            isUploading && "pointer-events-none opacity-50 cursor-wait"
          )}
        >
          <input {...getInputProps()} />
          
          {!isUploading ? (
            <>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-card shadow-sm border border-ink/8 text-ink-soft/70 mb-4 group-hover:text-coral transition-colors">
                <AudioLines className="size-7" />
              </div>
              <p className="text-sm font-bold text-ink">Drop your file here</p>
              <p className="text-xs text-ink-soft/70 mt-1 uppercase tracking-widest font-black">Supported: .mp3, .wav, .m4a</p>
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
              <p className="text-sm font-bold text-ink">Uploading...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioUploadBtn;
