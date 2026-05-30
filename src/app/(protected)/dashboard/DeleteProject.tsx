"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import useProject from "@/hooks/useProject";
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

type DeleteProjectProps = {
  id?: string;
  trigger?: React.ReactNode;
};

const DeleteProject = ({ id, trigger }: DeleteProjectProps) => {
  const router = useRouter();
  const deleteMutation = api.project.deleteProject.useMutation();
  const { projectId, setProjectId } = useProject();
  const refetch = useRefetch();

  const handleDelete = async () => {
    if (!projectId) return;

    try {
      await deleteMutation.mutateAsync(
        { projectId: projectId as string },
        {
          onSuccess: () => {
            toast.success("Project deleted successfully");
            setProjectId(""); // Clear selected project
            refetch();
            router.push("/dashboard");
          },
          onError: (error) => {
            toast.error(error.message || "Failed to delete project");
          },
        }
      );
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button id={id} className="hidden">
            Open Delete Confirm
          </button>
        )}
      </AlertDialogTrigger>
      
      <AlertDialogContent className="bg-cream border border-ink/10 dark:bg-zinc-950 dark:border-zinc-800 text-ink dark:text-zinc-50 rounded-2xl shadow-xl max-w-md animate-fade-in">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="font-display text-2xl text-ink dark:text-zinc-50">
            Delete project permanently?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink-soft dark:text-zinc-400 text-sm leading-relaxed">
            This will permanently delete the project and erase all associated code indexing, meetings, summaries, questions, and embeddings without trace. **This action cannot be undone.**
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-ink/10 text-ink dark:text-zinc-400 dark:border-zinc-800 bg-transparent hover:bg-cream-deep dark:hover:bg-zinc-900 transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-coral hover:bg-coral-deep dark:bg-red-600 dark:hover:bg-red-700 text-cream dark:text-zinc-50 font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Deleting..." : "Yes, Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProject;
