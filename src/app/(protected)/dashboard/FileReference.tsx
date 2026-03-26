"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Code2, FileCode, Hash, Sparkles } from "lucide-react";

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const FileReference = ({ filesReferences }: Props) => {
  const [tab, setTab] = useState(filesReferences[0]?.fileName);

  if (filesReferences.length === 0) return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-[32px] opacity-40">
       <span className="text-xs font-black uppercase tracking-widest text-slate-500">No context sources available</span>
    </div>
  );

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        {/* Modern Tabs List with horizontal scroll */}
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <TabsList className="h-auto bg-slate-50/50 p-2 rounded-2xl border border-slate-100/50 inline-flex min-w-full">
            {filesReferences.map((file) => (
              <TabsTrigger
                key={file.fileName}
                value={file.fileName}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 border border-transparent whitespace-nowrap",
                  "data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm data-[state=active]:border-slate-100",
                  "hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="inline-flex size-4 items-center justify-center rounded-md bg-indigo-50 text-indigo-400 group-data-[state=active]:bg-indigo-700 group-data-[state=active]:text-white">
                   <FileCode className="size-2.5" />
                </div>
                {file.fileName}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          {filesReferences.map((file) => (
            <TabsContent
              value={file.fileName}
              key={file.fileName}
              className="w-full focus-visible:outline-none"
            >
              <div className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-slate-50/30 p-2 shadow-inner ring-1 ring-slate-200/20">
                {/* Header for code block */}
                <div className="flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md rounded-t-[24px] border-b border-slate-100/50">
                   <div className="flex items-center gap-3">
                      <Code2 className="size-4 text-indigo-500" />
                      <span className="text-sm font-black text-slate-900 tracking-tight">{file.fileName}</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm border border-emerald-100">
                      <Sparkles className="size-2.5" />
                      Contextual Block
                   </div>
                </div>
                
                {/* Syntax Highlighter with Light Theme */}
                <div className="max-h-[50vh] overflow-auto scroll-smooth p-4 custom-scrollbar bg-white rounded-b-[24px]">
                  <SyntaxHighlighter
                    language="typescript"
                    style={materialLight}
                    customStyle={{
                      margin: 0,
                      background: "transparent",
                      padding: "1rem",
                      fontSize: "0.85rem",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                    wrapLongLines={true}
                  >
                    {file.sourceCode}
                  </SyntaxHighlighter>
                </div>

                {/* Optional Summary Overlay if applicable */}
                {file.summary && (
                  <div className="mt-4 p-6 bg-indigo-50/30 border-t border-indigo-100/20">
                     <div className="flex items-center gap-2 mb-2">
                        <Hash className="size-3 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900">Context Summary</span>
                     </div>
                     <p className="text-sm font-medium leading-relaxed text-indigo-900/60">
                        {file.summary}
                     </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default FileReference;
