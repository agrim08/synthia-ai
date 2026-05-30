"use client";

import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { MessageSquarePlus, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <DialogContent className="max-h-[90vh] w-full overflow-hidden p-0 sm:max-w-[75vw] border-none shadow-3xl rounded-[40px]">
          <div className="flex flex-col h-full bg-card rounded-[40px] overflow-hidden">
            <div className="border-b border-ink/8 bg-card px-10 py-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-coral shadow-xl shadow-soft">
                  <Sparkles className="size-8 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-2xl font-black text-ink tracking-tight">Analysis</h3>
                  <div className="flex items-center gap-2">
                     <div className="size-2 rounded-full bg-sage" />
                     <span className="text-[10px] font-bold text-ink-soft/70 uppercase tracking-widest leading-none">Result Ready</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  disabled={saveAnswer.isPending}
                  className="rounded-2xl h-12 bg-coral px-8 font-black text-white transition-all hover:bg-coral-soft shadow-lg shadow-soft hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => {
                    saveAnswer.mutate(
                      {
                        projectId: projectId as string,
                        answer,
                        filesReferences: filesReferences,
                        question,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Analysis saved");
                          refetch();
                        },
                        onError: (error) => {
                          toast.error(error.message);
                        },
                      },
                    );
                  }}
                >
                  Save History
                </Button>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setOpen(false)}
                   className="size-12 rounded-2xl bg-cream-deep/30 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                   <X className="size-6" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-10 overflow-y-auto">
              {/* Question Context Card */}
              <div className="mb-10 p-8 rounded-[32px] bg-ink shadow-2xl shadow-soft text-white relative overflow-hidden group/q">
                 <div className="absolute -right-10 -top-10 size-40 rounded-full bg-coral/20 blur-3xl opacity-0 group-hover/q:opacity-100 transition-opacity" />
                 <span className="inline-block px-3 py-1 rounded-full bg-coral/20 text-coral/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Question</span>
                 <p className="text-2xl font-black leading-tight tracking-tight">{question}</p>
                 <div className="mt-4 flex items-center gap-3">
                    <div className="h-px w-8 bg-coral/50" />
                    <span className="text-[10px] font-bold text-ink-soft/70 uppercase tracking-widest">Codebase Query</span>
                 </div>
              </div>

              {/* Answer Content */}
              <div className="prose prose-blue max-w-none 
                 prose-p:text-ink prose-p:leading-relaxed prose-p:text-lg prose-p:font-medium
                 prose-pre:bg-cream-deep/30 prose-pre:rounded-[32px] prose-pre:p-6 prose-pre:border prose-pre:border-ink/8 prose-pre:my-8
                 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-ink prose-headings:scroll-mt-20">
                <MDEditor.Markdown
                  source={answer}
                  className="bg-transparent text-ink"
                />
              </div>

              {/* Context Footer */}
              <div className="mt-16 space-y-8 bg-cream-deep/30 rounded-[40px] p-10 border border-ink/8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-ink/10"></div>
                  <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-card shadow-sm ring-1 ring-ink/8">
                    <Sparkles className="size-3 text-coral" />
                    <span className="text-[11px] font-black text-ink-soft uppercase tracking-[0.2em]">References</span>
                  </div>
                  <div className="h-px flex-1 bg-ink/10"></div>
                </div>
                <FileReference filesReferences={filesReferences || []} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="h-full overflow-hidden rounded-[40px] border border-ink/8 bg-card shadow-xl shadow-soft transition-all duration-300 hover:shadow-2xl hover:shadow-soft hover:border-coral/20 hover:translate-y-[-4px] active:translate-y-0 group/card">
        <CardContent className="p-10">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
             <div className="flex items-center gap-5">
                <div className="flex size-14 items-center justify-center rounded-[20px] bg-cream-deep/30 text-ink-soft/70 border border-ink/8 shadow-sm group-hover/card:bg-coral group-hover/card:text-white group-hover/card:border-coral transition-all duration-500">
                   <Sparkles className="size-7" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-ink tracking-tight leading-none mb-2">Analyze Code</h3>
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group/input">
              <div className="absolute inset-0 bg-coral/5 blur-xl group-focus-within/input:opacity-100 opacity-0 transition-opacity rounded-[32px]" />
              <Textarea
                placeholder="How do I handle authentication in this project?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="relative min-h-[140px] w-full rounded-[32px] border-ink/8 bg-cream-deep/30 p-6 text-lg font-bold leading-relaxed focus:bg-card focus:border-coral/20 focus:ring-8 focus:ring-coral/10 transition-all text-ink placeholder:text-ink-soft/50 shadow-inner overflow-hidden resize-none"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Button
                type="submit"
                className="h-14 w-full rounded-[24px] bg-coral px-10 font-black text-white shadow-xl shadow-soft transition-all hover:bg-coral-soft hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
                disabled={loading}
              >
                <div className="flex items-center gap-3">
                  {loading ? (
                    <>
                       <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                       <span>Analyzing Code...</span>
                    </>
                  ) : (
                    <>
                       <Sparkles className="size-5 text-coral/60" />
                       <span>Ask Question</span>
                    </>
                  )}
                </div>
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-sage/15 rounded-full">
                 <div className="size-1.5 rounded-full bg-sage" />
                 <span className="text-[10px] font-extrabold text-sage uppercase tracking-widest">Live Analysis</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default QuestionCard;
