"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/useProject";
import React, { useState, useRef, useEffect } from "react";
import { askQuestion } from "./action";
import { readStreamableValue } from "ai/rsc";
import { Sparkles, ArrowRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MDEditor from "@uiw/react-md-editor";
import { toast } from "sonner";
import useRefetch from "@/hooks/useRefetch";
import FileReference from "./FileReference";
import { api } from "@/trpc/react";

const AskSynthiaHero = () => {
  const { projectId } = useProject();
  const saveAnswer = api.project.saveAnswer.useMutation();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] =
    useState<{ fileName: string; sourceCode: string; summary: string }[]>();
  const [answer, setAnswer] = useState("");
  const refetch = useRefetch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || !projectId || loading) return;

    setAnswer("");
    setFilesReferences([]);
    setLoading(true);

    try {
      const { output, filesReferences } = await askQuestion(question, projectId);
      setOpen(true);
      setFilesReferences(filesReferences);

      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((ans) => ans + delta);
        }
      }
    } catch (error) {
      toast.error("An error occurred while analyzing the codebase.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <div className="w-full space-y-3">
        <div className="flex items-center gap-2 group cursor-default ml-1">
          <Sparkles className="size-4 text-indigo-500" />
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 leading-none">Ask Synthia</h3>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Intelligent codebase query</span>
          </div>
        </div>

        <div className="relative group">
          {/* Subtle Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[28px] blur opacity-10 group-focus-within:opacity-25 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative flex items-center bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/40 p-1 tracking-tight overflow-hidden transition-all group-focus-within:border-indigo-500 group-focus-within:ring-4 group-focus-within:ring-indigo-50">
            <textarea
              ref={textareaRef}
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this codebase..."
              className="flex-1 bg-transparent px-6 py-[10px] text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none overflow-hidden min-h-[32px] flex items-center"
              style={{ height: "32px" }}
            />
            
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !question.trim()}
              className={cn(
                "group relative flex size-10 items-center justify-center rounded-2xl transition-all duration-300 mr-2",
                question.trim() 
                  ? "bg-indigo-700 shadow-lg shadow-indigo-100/50 hover:bg-indigo-800 hover:scale-105 active:scale-95" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin text-white" />
              ) : (
                <ArrowRight className={cn("size-6 transition-transform group-hover:translate-x-0.5", question.trim() ? "text-white" : "text-slate-400")} />
              )}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] w-full overflow-hidden p-0 sm:max-w-[75vw] border-none shadow-3xl rounded-[40px] bg-white">
          <div className="flex flex-col h-full overflow-hidden bg-white">
            <div className="border-b border-slate-100 bg-white px-8 py-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-700 shadow-xl shadow-indigo-100">
                  <Sparkles className="size-7 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Synthia Insight</h3>
                  <div className="flex items-center gap-2">
                     <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Analysis Complete</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  disabled={saveAnswer.isPending}
                  className="rounded-xl h-10 bg-indigo-700 px-6 font-bold text-sm text-white transition-all hover:bg-indigo-800 shadow-lg shadow-indigo-100/50 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => {
                    saveAnswer.mutate(
                      {
                        projectId: projectId!,
                        answer,
                        filesReferences: filesReferences!,
                        question,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Insight saved and indexed!");
                          refetch();
                        },
                        onError: () => {
                          toast.error("Failed to persist analysis!");
                        },
                      },
                    );
                  }}
                >
                  Save Insight
                </Button>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setOpen(false)}
                   className="size-10 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                   <X className="size-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto">
              {/* Question Context */}
              <div className="mb-8 p-6 rounded-[24px] bg-slate-900 shadow-xl shadow-indigo-100/20 text-white relative overflow-hidden group/q">
                 <div className="absolute -right-10 -top-10 size-32 rounded-full bg-indigo-500/10 blur-3xl" />
                 <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-3">Inquiry</span>
                 <p className="text-xl font-bold leading-tight tracking-tight">{question}</p>
              </div>

              {/* Answer Content */}
              <div className="prose prose-indigo max-w-none 
                 prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base
                 prose-pre:bg-slate-50 prose-pre:rounded-[20px] prose-pre:p-4 prose-pre:border prose-pre:border-slate-100 prose-pre:my-6
                 prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 shadow-none">
                <MDEditor.Markdown
                  source={answer}
                  className="bg-transparent text-slate-600"
                />
              </div>

              {/* Context Footer */}
              <div className="mt-12 space-y-6 bg-slate-50/50 rounded-[32px] p-8 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                    <Sparkles className="size-3 text-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Context References</span>
                  </div>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                <FileReference filesReferences={filesReferences || []} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AskSynthiaHero;
