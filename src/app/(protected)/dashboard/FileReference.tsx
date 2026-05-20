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
    <div className="flex flex-col items-center justify-center p-12 bg-cream-deep/30 border border-dashed border-ink/10 rounded-[32px] opacity-40">
       <span className="text-xs font-black uppercase tracking-widest text-ink-soft">No context sources available</span>
    </div>
  );

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        {/* Modern Tabs List with horizontal scroll */}
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <TabsList className="h-auto bg-cream-deep/30 p-2 rounded-2xl border border-ink/8 inline-flex min-w-full">
            {filesReferences.map((file) => (
              <TabsTrigger
                key={file.fileName}
                value={file.fileName}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 border border-transparent whitespace-nowrap",
                  "data-[state=active]:bg-card data-[state=active]:text-coral data-[state=active]:shadow-sm data-[state=active]:border-ink/8",
                  "hover:bg-cream-deep hover:text-ink"
                )}
              >
                <div className="inline-flex size-4 items-center justify-center rounded-md bg-coral/10 text-coral/80 group-data-[state=active]:bg-coral group-data-[state=active]:text-white">
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
              <div className="group relative overflow-hidden rounded-[32px] border border-ink/8 bg-cream-deep/30 p-2 shadow-inner ring-1 ring-ink/10">
                {/* Header for code block */}
                <div className="flex items-center justify-between px-6 py-4 bg-card rounded-t-[24px] border-b border-ink/8">
                   <div className="flex items-center gap-3">
                      <Code2 className="size-4 text-coral" />
                      <span className="text-sm font-black text-ink tracking-tight">{file.fileName}</span>
                   </div>
                </div>
                
                {/* Syntax Highlighter with Light Theme */}
                <div className="p-4 bg-card rounded-b-[24px]">
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
                  <div className="mt-4 p-6 bg-coral/10 border-t border-coral/10">
                     <div className="flex items-center gap-2 mb-2">
                        <Hash className="size-3 text-coral/80" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink">Context Summary</span>
                     </div>
                     <p className="text-sm font-medium leading-relaxed text-ink/60">
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
