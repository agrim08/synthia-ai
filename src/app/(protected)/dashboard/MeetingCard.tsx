"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/trpc/react";
import useProject from "@/hooks/useProject";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

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

  const { getRootProps, getInputProps } = useDropzone({
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
            toast.success("Meeting uploaded successfully");
            router.push("/meetings");
            processMeeting.mutateAsync({
              meetingUrl: downloadUrl,
              projectId: project?.id,
              meetingId: meeting!.id,
            });
          },
          onError: (error) => {
            toast.error("Failed to upload meeting");
            console.error(error);
          },
        },
      );
      setIsUploading(false);
    },
  });

  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center py-4"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="w-l0 h-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-white">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-400">
            Analyse your meeting with Synthia.
            <br />
            Powered by AI.
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" area-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div>
          <div className="h-20 w-20">
            <CircularProgressbar
              value={progress}
              text={`${progress}%`}
              styles={buildStyles({
                pathColor: "#6366F1",
                trailColor: "#4338CA",
                textColor: "#ffffff",
              })}
            />
          </div>
          <p className="text-center text-sm font-medium text-gray-500">
            Uploading a meeting...
          </p>
        </div>
      )}
    </Card>
  );
};
export default MeetingCard;
