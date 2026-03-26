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
import MDEditor from "@uiw/react-md-editor";
import FileReference from "../dashboard/FileReference";
import { MessageSquare, Sparkles, X, History, Calendar } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
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
                <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-700 text-white shadow-xl shadow-indigo-100 ring-1 ring-indigo-500/50">
                   <History className="size-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  History
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-50 shadow-sm border border-indigo-100 transition-transform hover:scale-105">
              <MessageSquare className="size-4 text-indigo-600" />
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
                  <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-700 group-hover:text-white transition-all transform group-hover:rotate-12">
                     <History className="size-4" />
                  </div>
                </div>
              </SheetTrigger>
            ))}
          </div>

          {!questions?.length && (
            <div className="flex flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-slate-100 bg-slate-50/30 py-24 text-center">
              <div className="rounded-3xl bg-slate-100 p-6 mb-6 shadow-inner ring-1 ring-slate-200/50">
                <MessageSquare className="size-12 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Knowledge Base Empty</h3>
              <p className="text-xs font-bold text-slate-500 max-w-[400px] mt-2 uppercase tracking-widest leading-relaxed">
                 Aggregate intelligence by submitting inquiries through the RAG engine interface above.
              </p>
            </div>
          )}
        </section>

        {question && (
          <SheetContent
            className="w-full overflow-hidden p-0 border-none shadow-3xl sm:max-w-3xl focus-visible:outline-none"
            side="right"
          >
            <div className="flex h-full flex-col bg-white overflow-hidden">
               {/* Header Section for Insight */}
              <div className="relative border-b border-slate-100 bg-indigo-700 px-10 py-16 text-white overflow-hidden">
                 <div className="absolute -right-20 -top-20 size-80 rounded-full bg-indigo-500/20 blur-3xl opacity-60" />
                 <div className="absolute -left-10 bottom-0 size-48 rounded-full bg-slate-800/80 blur-2xl" />
                 
                 <div className="relative space-y-6">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 border border-indigo-500/30 w-fit">
                       <Sparkles className="size-3 mr-1" />
                       Intelligence Trace
                    </div>
                    <SheetTitle className="text-4xl font-black tracking-tight text-white leading-tight">
                      {question.question}
                    </SheetTitle>
                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800">
                       <div className="flex items-center gap-3">
                          <Image
                             src={question.user?.imageUrl || ""}
                             alt="user"
                             width={40}
                             height={40}
                             className="rounded-xl shadow-lg ring-2 ring-slate-800"
                           />
                           <div className="flex flex-col">
                             <span className="text-sm font-black text-white">{question.user?.firstName}</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SaaS Originator</span>
                           </div>
                       </div>
                       <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest h-full">
                          <div className="h-4 w-px bg-slate-800 hidden md:block" />
                          <div className="flex items-center gap-2">
                             <Calendar className="size-3.5 text-indigo-500" />
                             {question.createdAt?.toLocaleDateString()}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Scrollable Answer Area */}
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="prose prose-blue max-w-none 
                   prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-lg prose-p:font-medium
                   prose-pre:bg-slate-50 prose-pre:rounded-[32px] prose-pre:p-8 prose-pre:border prose-pre:border-slate-100 prose-pre:my-10
                   prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 prose-headings:scroll-mt-20">
                  <MDEditor.Markdown
                    source={question.answer}
                    className="bg-transparent text-slate-700"
                  />
                </div>
                
                {/* Contextual Context Section */}
                <div className="mt-20 space-y-10 bg-slate-50/50 rounded-[48px] p-12 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                       <History className="size-3.5 text-indigo-600" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Repository Evidence Trace</span>
                    </div>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                  <FileReference
                    filesReferences={(question.filesReferences ?? []) as any}
                  />
                </div>
              </div>
              
              {/* Footer CTA */}
              <div className="px-10 py-6 border-t border-slate-100 bg-white flex justify-end">
                 <Button
                    variant="ghost"
                    onClick={() => {}} // Placeholder for "Copy Quote" or "Share"
                    className="rounded-2xl h-12 px-8 font-black text-slate-900 hover:bg-slate-50 transition-all border border-slate-100"
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
