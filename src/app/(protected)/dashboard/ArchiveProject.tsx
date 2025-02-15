"use client";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/useProject";
import useRefetch from "@/hooks/useRefetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveProject = () => {
  const archive = api.project.archiveProject.useMutation();
  const { projectId } = useProject();
  const refetch = useRefetch();
  return (
    <Button
      disabled={archive.isPending}
      size="sm"
      className="bg-red-600 text-white hover:bg-red-800"
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project",
        );
        if (confirm) {
          archive.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project archived successfully");
                refetch();
              },
              onError: () => {
                toast.error("Failed to archive project");
              },
            },
          );
        }
      }}
    >
      Archive project
    </Button>
  );
};

export default ArchiveProject;
