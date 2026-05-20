"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/useProject";
import React, { useState, useRef, useEffect } from "react";
import { askQuestion } from "./action";
import { readStreamableValue } from "ai/rsc";
import { Sparkles, ArrowRight, Loader2, X, History, Calendar, Lightbulb, Zap, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MDEditor from "@uiw/react-md-editor";
import { toast } from "sonner";
import useRefetch from "@/hooks/useRefetch";
import FileReference from "./FileReference";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

const AskOwnYourCodeHero = () => {
  const { projectId } = useProject();
  const { user } = useUser();
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

      let fullAnswer = "";
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          fullAnswer += delta;
          setAnswer(fullAnswer);
        }
      }

      // Auto-save the insight once streaming is complete
      saveAnswer.mutate(
        {
          projectId: projectId!,
          question,
          filesReferences,
          answer: fullAnswer,
        },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
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
      <div className="w-full space-y-2">
        <div className="flex items-center gap-2 group cursor-default ml-1">
          <Sparkles className="size-4 text-coral" />
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-ink leading-none">Ask our AI</h3>
          </div>
        </div>

        <div className="relative group">
          {/* Subtle Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-coral to-purple-500 rounded-[28px] blur opacity-10 group-focus-within:opacity-25 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative flex items-center bg-card rounded-[24px] border border-ink/10 shadow-soft p-1 tracking-tight overflow-hidden transition-all group-focus-within:border-coral group-focus-within:ring-4 group-focus-within:ring-coral/10">
            <textarea
              ref={textareaRef}
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={projectId ? "Ask anything about this codebase..." : "Select a project first..."}
              disabled={!projectId}
              className="flex-1 bg-transparent px-6 py-[10px] text-xs font-medium text-ink placeholder:text-ink-soft/70 focus:outline-none resize-none overflow-hidden min-h-[32px] flex items-center disabled:cursor-not-allowed"
              style={{ height: "32px" }}
            />
            
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !question.trim() || !projectId}
              className={cn(
                "group relative flex size-10 items-center justify-center rounded-2xl transition-all duration-300 mr-2",
                (question.trim() && projectId) 
                  ? "bg-coral shadow-soft hover:bg-coral/90 hover:scale-105 active:scale-95" 
                  : "bg-cream-deep text-ink-soft/70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin text-white" />
              ) : (
                <ArrowRight className={cn("size-6 transition-transform group-hover:translate-x-0.5", question.trim() ? "text-white" : "text-ink-soft/70")} />
              )}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full flex flex-col p-0 border-none shadow-2xl sm:max-w-4xl max-h-[90vh] focus-visible:outline-none bg-card rounded-[40px] overflow-hidden">
          <div className="flex flex-col h-full bg-card overflow-hidden">
            {/* ── Header ────────────────────────────────────── */}
            <div className="px-10 py-6 border-b border-ink/8 bg-card shadow-sm ring-1 ring-ink/8 relative z-20">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cream-deep/30 text-[9px] font-black uppercase tracking-widest text-ink-soft border border-ink/8">
                      <Sparkles className="size-2.5 text-coral" />
                      Analysis
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage/15 text-[9px] font-black uppercase tracking-widest text-sage border border-sage/20">
                      <div className="size-1 rounded-full bg-sage" />
                      Ready
                    </div>
                  </div>
                  
                  <DialogTitle className="text-xl font-black tracking-tight text-ink leading-tight line-clamp-2">
                    {question}
                  </DialogTitle>
                  
                  <div className="flex items-center gap-6 pt-3 border-t border-ink/8">
                    <div className="flex items-center gap-3">
                      {user?.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt="user"
                          width={24}
                          height={24}
                          className="rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="size-6 rounded-lg bg-cream-deep flex items-center justify-center">
                          <History className="size-3 text-ink-soft/70" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-ink leading-none">{user?.firstName || "User"}</span>
                      </div>
                    </div>
                    <div className="h-3 w-px bg-ink/8" />
                    <div className="flex items-center gap-2 text-[9px] font-black text-ink-soft/70 uppercase tracking-widest">
                      <Calendar className="size-2.5 text-ink-soft/50" />
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setOpen(false)}
                    className="size-11 rounded-2xl bg-cream-deep/30 hover:bg-destructive/10 hover:text-destructive transition-all border border-ink/8"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Content with Tabs ─────────────────────────── */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
              <Tabs defaultValue="summary" className="flex-1 flex flex-col min-h-0">
                <div className="px-10 py-3 bg-cream-deep/30 border-b border-ink/8 flex items-center justify-between">
                  <TabsList className="bg-cream-deep/80 p-1 rounded-2xl border border-ink/10 h-10 w-full max-w-[320px]">
                    <TabsTrigger 
                      value="summary" 
                      className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-ink data-[state=active]:shadow-md border-none"
                    >
                      Summary
                    </TabsTrigger>
                    <TabsTrigger 
                      value="files" 
                      className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-ink data-[state=active]:shadow-md border-none"
                    >
                      References
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2 text-[10px] font-bold text-ink-soft/70">
                    <Lightbulb className="size-3 text-amber-400" />
                    <span>Scroll for details</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 min-w-0 bg-card">
                  <TabsContent value="summary" className="m-0 focus-visible:outline-none" data-color-mode="light">
                    <div className="px-10 py-10 space-y-12">
                      {/* Visual Intro */}
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key="visual-intro"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative overflow-hidden rounded-[40px] bg-ink p-10 text-white shadow-2xl"
                        >
                          <div className="absolute right-[-40px] top-[-40px] scale-[2.5] opacity-10 pointer-events-none">
                            <Sparkles className="size-32 text-white" />
                          </div>
                          
                          <div className="flex items-center gap-4 mb-6">
                            <div className="size-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                              <Sparkles className="size-4 text-coral/60" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-coral/60 leading-none">Summary</h4>
                          </div>

                          <div className="relative">
                            <Quote className="absolute -left-4 -top-4 size-16 text-white opacity-10 -scale-x-100" />
                            <div className="relative prose prose-invert max-w-none 
                              prose-p:text-white prose-p:leading-tight prose-p:text-2xl prose-p:font-black prose-p:tracking-tight">
                              <MDEditor.Markdown
                                source={answer.split('\n\n')[0] || "Analyzing..."} 
                                style={{ background: "transparent", color: "inherit" }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      {/* Detailed Breakdown */}
                      <div className="space-y-10">
                        <div className="flex items-center gap-6">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-ink-soft/70 whitespace-nowrap">Detailed analysis</h3>
                          <div className="h-px w-full bg-ink/8" />
                        </div>
                        
                        <div className="prose prose-slate max-w-none 
                          prose-p:text-ink-soft prose-p:leading-relaxed prose-p:text-base prose-p:font-medium
                          prose-headings:font-black prose-headings:tracking-tight prose-headings:text-ink
                          prose-strong:text-coral prose-strong:font-black
                          prose-ul:list-none prose-ul:p-0
                          prose-li:relative prose-li:pl-8 prose-li:mb-6 prose-li:text-ink-soft prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[12px] prose-li:before:size-2 prose-li:before:rounded-full prose-li:before:bg-coral/80
                          prose-code:bg-cream-deep/30 prose-code:text-coral prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-code:font-bold prose-code:border prose-code:border-ink/8
                          prose-pre:bg-slate-900 prose-pre:text-white prose-pre:p-8 prose-pre:rounded-[32px] prose-pre:shadow-2xl prose-pre:border prose-pre:border-white/5
                        ">
                          <MDEditor.Markdown
                            source={answer.split('\n\n').slice(1).join('\n\n')} 
                            style={{ background: "transparent", color: "inherit" }}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="files" className="m-0 px-10 py-10 focus-visible:outline-none bg-cream-deep/30">
                    <div className="space-y-8">
                       <div className="space-y-2">
                          <h3 className="text-xl font-black text-ink tracking-tight">Source Material</h3>
                          <p className="text-sm font-medium text-ink-soft">Our AI analyzed these files to generate your insight.</p>
                       </div>
                       <FileReference
                         filesReferences={(filesReferences ?? []) as any}
                       />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
              
              {/* Subtle gradient overlay at bottom of scroll area */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cream to-transparent pointer-events-none z-10" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AskOwnYourCodeHero;
