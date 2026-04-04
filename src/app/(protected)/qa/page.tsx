"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import AskSynthiaHero from "../dashboard/AskSynthiaHero";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MDEditor from "@uiw/react-md-editor";
import FileReference from "../dashboard/FileReference";
import { MessageSquare, Sparkles, X, History, Calendar, Lightbulb, Zap, Quote, Trash2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const QandA = () => {
  const { projectId } = useProject();
  const utils = api.useUtils();
  const { data: questions } = api.project.getQuestions.useQuery({
    projectId: projectId as string,
  });
  const deleteQuestion = api.project.deleteQuestion.useMutation();

  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteQuestion.mutateAsync({ questionId: id });
      toast.success("Question removed from history");
      utils.project.getQuestions.invalidate();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      <Sheet>
        {/* Ask Prompt Section */}
        <section className="relative">
          <div className="absolute -left-20 -top-20 size-80 rounded-full bg-indigo-100 blur-[100px] opacity-40 -z-10" />
          <AskSynthiaHero />
        </section>

        {/* History / Knowledge Base Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
                 <History className="size-5 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                  History
                </h2>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                   {questions?.length || 0} questions
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {questions?.map((ques, index) => (
              <motion.div 
                key={ques.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div
                  className="relative flex flex-col gap-6 p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 hover:shadow-2xl hover:shadow-indigo-100/20 hover:scale-[1.01] hover:border-indigo-100 active:scale-95 cursor-pointer"
                >
                  <SheetTrigger asChild onClick={() => setQuestionIndex(index)}>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                              <Sparkles className="size-2.5 text-indigo-500" />
                              Analysis
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                              {new Date(ques.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight line-clamp-2">
                            {ques.question}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {ques.user?.imageUrl && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/50 border border-slate-100 transition-all group-hover:bg-white group-hover:shadow-sm shadow-indigo-100/10">
                              <Image
                                src={ques.user.imageUrl}
                                alt="user"
                                width={20}
                                height={20}
                                className="rounded-lg shadow-sm"
                              />
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                {ques.user.firstName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="prose prose-sm prose-slate max-w-none line-clamp-2 text-slate-500 font-medium leading-relaxed opacity-70">
                        <MDEditor.Markdown
                          source={ques.answer}
                          style={{ background: "transparent", color: "inherit" }}
                        />
                      </div>
                    </div>
                  </SheetTrigger>

                  {/* Move Delete Button INSIDE card to match meetings page */}
                  <div className="absolute right-6 bottom-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10 rounded-xl hover:bg-red-50 hover:text-red-500 shadow-sm border border-transparent hover:border-red-100 transition-all bg-white"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(e, ques.id);
                      }}
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {!questions?.length && (
            <div className="flex flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-slate-100 bg-slate-50/30 py-32 text-center">
              <div className="rounded-2xl bg-white p-4 mb-6 shadow-sm ring-1 ring-slate-100">
                <MessageSquare className="size-8 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Repository is Empty</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-[200px]">Start by asking Synthia a question above.</p>
            </div>
          )}
        </section>

        {question && (
          <SheetContent
            className="w-full flex flex-col p-0 border-none shadow-2xl sm:max-w-3xl focus-visible:outline-none bg-white"
            side="right"
          >
            <div className="flex flex-col h-full bg-white">
              {/* ── Header ────────────────────────────────────── */}
              <div className="px-10 py-6 border-b border-slate-100 bg-white shadow-sm ring-1 ring-slate-50">
                <div className="space-y-4">
                  
                  <SheetTitle className="text-xl font-black tracking-tight text-slate-900 leading-tight line-clamp-2">
                    {question.question}
                  </SheetTitle>
                  
                  <div className="flex items-center gap-6 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      {question.user?.imageUrl && (
                        <Image
                          src={question.user.imageUrl}
                          alt="user"
                          width={24}
                          height={24}
                          className="rounded-lg shadow-sm"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900 leading-none">{question.user?.firstName}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Analyst</span>
                      </div>
                    </div>
                    <div className="h-3 w-px bg-slate-100" />
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <Calendar className="size-2.5 text-slate-300" />
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Content with Tabs ─────────────────────────── */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <Tabs defaultValue="summary" className="flex-1 flex flex-col min-h-0">
                  <div className="px-10 py-2.5 bg-slate-50 border-b border-slate-100">
                    <TabsList className="bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 h-10 w-full max-w-[300px]">
                      <TabsTrigger 
                        value="summary" 
                        className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                      >
                        Summary
                      </TabsTrigger>
                      <TabsTrigger 
                        value="files" 
                        className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                      >
                        Reference
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 min-w-0">
                    <TabsContent value="summary" className="m-0 focus-visible:outline-none" data-color-mode="light">
                      <div className="px-10 py-8 space-y-10">
                         {/* Visual Intro */}
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="relative overflow-hidden rounded-[32px] bg-slate-50 p-8 border border-slate-100"
                         >
                            <div className="absolute right-[-20px] top-[-20px] scale-[2] opacity-5 pointer-events-none">
                               <Sparkles className="size-24 text-indigo-700" />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                               <div>
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-900 leading-none">Summary</h4>
                               </div>
                            </div>

                            <div className="relative">
                               <Quote className="absolute -left-2 -top-2 size-12 text-indigo-100 opacity-50 -scale-x-100" />
                               <div className="relative prose prose-blue max-w-none 
                                  prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-xl prose-p:font-bold prose-p:tracking-tight
                                  prose-code:text-indigo-600 prose-code:bg-white prose-code:px-2 prose-code:rounded-lg prose-code:ring-1 prose-code:ring-slate-200">
                                  <MDEditor.Markdown
                                    source={question.answer.split('\n\n')[0]} 
                                    style={{ background: "transparent", color: "inherit" }}
                                  />
                               </div>
                            </div>
                         </motion.div>

                         {/* Detailed Breakdown */}
                         <div className="space-y-10">
                            <div className="flex items-center gap-4">
                               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Analysis</h3>
                               <div className="h-px flex-1 bg-slate-100" />
                            </div>
                            
                            <div className="prose prose-slate max-w-none 
                               prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base prose-p:font-medium
                               prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                               prose-strong:text-indigo-600 prose-strong:font-black
                               prose-ul:list-none prose-ul:p-0
                               prose-li:relative prose-li:pl-8 prose-li:mb-6 prose-li:text-slate-600 prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[12px] prose-li:before:size-2 prose-li:before:rounded-full prose-li:before:bg-indigo-400
                               prose-code:bg-slate-50 prose-code:text-indigo-600 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                               prose-pre:bg-slate-900 prose-pre:text-white prose-pre:p-6 prose-pre:rounded-[24px] prose-pre:shadow-xl
                            ">
                               <MDEditor.Markdown
                                 source={question.answer.split('\n\n').slice(1).join('\n\n')} 
                                 style={{ background: "transparent", color: "inherit" }}
                               />
                            </div>
                         </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="files" className="m-0 px-10 py-8 focus-visible:outline-none bg-slate-50/30">
                      <FileReference
                        filesReferences={(question.filesReferences ?? []) as any}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
};

export default QandA;
