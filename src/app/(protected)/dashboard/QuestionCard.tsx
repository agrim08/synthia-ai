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

const QuestionCard = () => {
  const { projectId } = useProject();
  const saveAnswer = api.project.saveAnswer.useMutation();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] =
    useState<{ fileName: string; sourceCode: string; summary: string }[]>();
  const [answer, setAnswer] = useState("");

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
        <DialogContent className="sm:max-w-[70vw]">
          <DialogHeader>
            <div className="flex items-center gap-2 space-x-3">
              <DialogTitle>
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
                  <div className="text-xs">SYNTHIA</div>
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    AI
                  </div>
                </div>
              </DialogTitle>
              <Button
                disabled={saveAnswer.isPending}
                variant={"secondary"}
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
          <MDEditor.Markdown
            source={answer}
            className="h-full max-h-[40vh] max-w-[70vw] overflow-scroll"
          />
          <div className="h-4"></div>
          <FileReference filesReferences={filesReferences || []} />
          <Button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            ></Textarea>
            <div className="h-4"></div>
            <Button type="submit" className="bg-indigo-700" disabled={loading}>
              Ask Synthia
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default QuestionCard;
