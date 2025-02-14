"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

const MeetingCard = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000, //50mb
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      const downloadUrl = await uploadFile(file as File, setProgress);
      window.alert(downloadUrl);
      setIsUploading(false);
    },
  });

  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center"
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
