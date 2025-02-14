"use client";

import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/useProject";
import React, { useState } from "react";
import { askQuestion } from "./action";
import { readStreamableValue } from "ai/rsc";
import FileReference from "./FileReference";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/useRefetch";

const QuestionCard = () => {
  const { projectId } = useProject();
  const saveAnswer = api.project.saveAnswer.useMutation();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] =
    useState<{ fileName: string; sourceCode: string; summary: string }[]>();
  const [answer, setAnswer] = useState("");
  const refetch = useRefetch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFilesReferences([]);
    console.log(projectId);

    if (!projectId) return;
    e.preventDefault();
    setLoading(true);

    const { output, filesReferences } = await askQuestion(question, projectId);
    setOpen(true);
    setFilesReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] w-full overflow-y-auto p-4 sm:max-w-[75vw] sm:p-6">
          <DialogHeader>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <DialogTitle>
                <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2 sm:h-16 sm:w-16 sm:p-4">
                  <div className="text-[10px] text-white sm:text-xs">
                    SYNTHIA
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white sm:h-6 sm:w-6 sm:text-sm">
                    AI
                  </div>
                </div>
              </DialogTitle>
              <Button
                disabled={saveAnswer.isPending}
                variant={"secondary"}
                className="w-full sm:w-auto"
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId,
                      answer,
                      filesReferences: filesReferences,
                      question,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer saved successfully!");
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to save answer!");
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <div className="mt-4 sm:mt-6">
            <MDEditor.Markdown
              source={answer}
              className="prose prose-sm sm:prose-base max-h-[40vh] max-w-none overflow-auto rounded-lg bg-gray-50 p-4"
            />
          </div>
          <div className="mt-6">
            <FileReference filesReferences={filesReferences || []} />
          </div>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3 mx-auto w-full sm:max-w-[80vw]">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="max-h-[80px] sm:text-lg"
              rows={4}
            />
            <Button
              type="submit"
              className="w-full bg-indigo-700 transition-colors hover:bg-indigo-800 sm:w-auto"
              disabled={loading}
            >
              {loading ? "Processing..." : "Ask Synthia"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default QuestionCard;
