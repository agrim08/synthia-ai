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
import { MessageSquare, Sparkles, X, History, Calendar, Lightbulb, Zap, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const QandA = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({
    projectId: projectId as string,
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      <Sheet>
        {/* Ask Prompt Section */}
        <section className="relative">
          <div className="absolute -left-10 -top-10 size-64 rounded-full bg-indigo-50 blur-3xl opacity-60" />
          <AskSynthiaHero />
        </section>

        {/* History / Knowledge Base Section */}
        <section className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between px-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-7 items-center justify-center rounded-xl text-white">
                   <History className="size-5 text-indigo-500" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  History
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-indigo-50 transition-transform hover:scale-105">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-900">
                {questions?.length || 0} Questions
              </span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {questions?.map((ques, index) => (
              <SheetTrigger
                key={ques.id}
                onClick={() => setQuestionIndex(index)}
                className="group relative flex flex-col items-start gap-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/20 transition-all hover:bg-slate-50 hover:border-indigo-200 hover:shadow-2xl hover:translate-y-[-4px] active:translate-y-0 text-left cursor-pointer focus:ring-4 focus:ring-indigo-100/50 outline-none"
              >
                <div className="flex-1 space-y-4">
                  <h3 className="line-clamp-2 text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
                    {ques.question}
                  </h3>
                  <p className="line-clamp-3 text-xs font-medium leading-relaxed text-slate-500">
                    {ques.answer}
                  </p>
                </div>

                <div className="mt-4 flex w-full items-center justify-between pt-6 border-t border-slate-100/50">
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <Image
                          src={ques?.user?.imageUrl || ""}
                          alt="user"
                          width={28}
                          height={28}
                          className="rounded-full ring-2 ring-white shadow-sm"
                        />
                        <div className="absolute -right-1 -top-1 size-2 rounded-full border border-white bg-indigo-500 shadow-sm" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700 leading-none">{ques.user?.firstName || "Unknown Agent"}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{ques.createdAt?.toLocaleDateString()}</span>
                     </div>
                  </div>
                </div>
              </SheetTrigger>
            ))}
          </div>

          {!questions?.length && (
            <div className="flex flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-slate-100 bg-slate-50/30 py-24 text-center">
              <div className="rounded-xl bg-slate-100 p-2 mb-6 shadow-inner ring-1 ring-slate-200/50">
                <MessageSquare className="size-5 text-slate-300" />
              </div>
              <h3 className="text-xl text-slate-900 tracking-tight">Knowledge Base Empty</h3>
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
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                      <Sparkles className="size-2.5 text-indigo-500" />
                      Insight Detail
                    </div>
                  </div>
                  
                  <SheetTitle className="text-xl font-black tracking-tight text-slate-900 leading-tight line-clamp-2">
                    {question.question}
                  </SheetTitle>
                  
                  <div className="flex items-center gap-6 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <Image
                        src={question.user?.imageUrl || ""}
                        alt="user"
                        width={24}
                        height={24}
                        className="rounded-lg shadow-sm"
                      />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900 leading-none">{question.user?.firstName}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">AI Analyst</span>
                      </div>
                    </div>
                    <div className="h-3 w-px bg-slate-100" />
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <Calendar className="size-2.5 text-slate-300" />
                      {question.createdAt?.toLocaleDateString()}
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
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-900 leading-none">Instant Insights</h4>
                               </div>
                            </div>

                            <div className="relative">
                               <Quote className="absolute -left-2 -top-2 size-12 text-indigo-100 opacity-50 -scale-x-100" />
                               <div className="relative prose prose-blue max-w-none 
                                  prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-xl prose-p:font-bold prose-p:tracking-tight
                                  prose-code:text-indigo-600 prose-code:bg-white prose-code:px-2 prose-code:rounded-lg prose-code:ring-1 prose-code:ring-slate-200">
                                  <MDEditor.Markdown
                                    source={question.answer.split('\n\n')[0]} // First paragraph as 'Lead'
                                    style={{ background: "transparent", color: "inherit" }}
                                  />
                               </div>
                            </div>
                         </motion.div>

                         {/* Detailed Breakdown */}
                         <div className="space-y-10">
                            <div className="flex items-center gap-4">
                               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Detailed Trace</h3>
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
                                 source={question.answer.split('\n\n').slice(1).join('\n\n')} // Rest of the text
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
              
              {/* ── Footer ────────────────────────────────────── */}
              <div className="px-10 py-6 border-t border-slate-100 bg-white flex justify-end">
                 <Button
                    variant="ghost"
                    onClick={() => {}} 
                    className="rounded-2xl h-12 px-8 font-black text-slate-900 hover:bg-slate-50 transition-all border border-slate-100 shadow-sm"
                 >
                    Share Insight →
                 </Button>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
};

export default QandA;
