"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import MDEditor from "@uiw/react-md-editor";
import { Logo } from "@/components/Logo";
import TextareaAutosize from "react-textarea-autosize";
import {
  History,
  Trash2,
  Plus,
  ArrowUp,
  Loader2,
  User,
  Copy,
  FileCode2,
  X,
  PanelRightOpen,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { askChatBot } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { useUser } from "@clerk/nextjs";
import useRefetch from "@/hooks/useRefetch";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

function useSmoothStream(text: string, isStreaming: boolean) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }
    
    // If text was reset, reset displayed text
    if (text.length < displayedText.length) {
      setDisplayedText(text);
      return;
    }

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        // Add chunks of characters based on how far behind we are
        const diff = text.length - displayedText.length;
        const chunkSize = Math.max(1, Math.floor(diff / 5));
        setDisplayedText((prev) => text.slice(0, prev.length + chunkSize));
      }, 20); // 20ms per tick
      return () => clearTimeout(timeout);
    }
  }, [text, displayedText, isStreaming]);

  return displayedText;
}

function StreamingMarkdown({ content, isStreaming }: { content: string, isStreaming: boolean }) {
  const displayedContent = useSmoothStream(content, isStreaming);

  return (
    <div className="prose prose-sm max-w-none
      prose-p:text-[14px] prose-p:leading-relaxed prose-p:text-ink prose-p:my-2
      prose-headings:text-ink prose-headings:font-semibold prose-headings:my-3
      prose-strong:text-ink prose-strong:font-semibold
      prose-code:text-coral prose-code:bg-coral/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none
      prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-pre:shadow-none
      prose-ul:my-2 prose-li:text-[14px] prose-li:text-ink prose-li:my-1
    ">
      <div className="markdown-body dark:bg-transparent bg-transparent">
        <MDEditor.Markdown
          source={displayedContent}
          style={{ background: "transparent", color: "inherit", fontSize: "14px" }}
          components={{
            code: ({ inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || "");
              const extractText = (child: any): string => {
                if (typeof child === "string" || typeof child === "number") return String(child);
                if (Array.isArray(child)) return child.map(extractText).join("");
                if (child && child.props && child.props.children) return extractText(child.props.children);
                return "";
              };
              const codeContent = extractText(children).replace(/\n$/, "");

              const hasNewlines = String(codeContent).includes('\n');
              const isBlock = !inline && (match || hasNewlines);

              // Render block code (with or without a language) using a dark container
              if (isBlock) {
                return (
                  <div className="rounded-xl overflow-x-auto shadow-sm border border-[#1e293b] my-3 bg-[#0d1117] p-4">
                    {match ? (
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ background: "transparent", padding: 0, margin: 0 }}
                        {...props}
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                    ) : (
                      <pre className="text-[#e6edf3] font-mono text-[13px] m-0 p-0 bg-transparent">
                        <code {...props}>{codeContent}</code>
                      </pre>
                    )}
                  </div>
                );
              }

              // Render inline code
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        />
      </div>
    </div>
  );
}

// ─── Code Viewer Panel ──────────────────────────────────────────────
function CodeViewerPanel({
  file,
  onClose,
}: {
  file: { fileName: string; sourceCode: string } | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(file.sourceCode);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-hidden">
      {/* File header */}
      <div className="relative flex items-center px-4 py-3 border-b border-white/8 bg-[#161b22] shrink-0 min-h-[48px]">
        <div className="flex items-center gap-2.5 pr-24 w-full">
          <div className="p-1 rounded-md bg-coral/15 shrink-0">
            <FileCode2 className="size-3.5 text-coral" />
          </div>
          <span className="text-sm font-mono text-[#e6edf3] truncate">
            {file.fileName}
          </span>
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-[#161b22] pl-2">
          <button
            onClick={handleCopy}
            title="Copy code"
            className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] px-2.5 py-1.5 rounded-md hover:bg-white/8 transition-colors"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
          
          <div className="w-px h-4 bg-white/10 mx-0.5" />
          
          <button
            onClick={onClose}
            title="Close code viewer"
            className="flex items-center justify-center p-1.5 rounded-md text-coral/80 hover:text-white hover:bg-coral/20 bg-coral/10 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto min-w-0">
        <SyntaxHighlighter
          language="typescript"
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: "1.25rem",
            background: "transparent",
            fontSize: "13px",
            lineHeight: "1.7",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
          wrapLines={true}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: "#4b5563",
            textAlign: "right",
          }}
        >
          {file.sourceCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function ThinkingState() {
  const [phase, setPhase] = useState("Analyzing request...");

  useEffect(() => {
    const phases = [
      "Analyzing request...",
      "Searching codebase...",
      "Filtering relevant files...",
      "Reading source code...",
      "Formulating response...",
      "Almost there..."
    ];
    let idx = 0;

    const interval = setInterval(() => {
      idx++;
      if (idx >= phases.length - 1) {
        setPhase(phases[phases.length - 1]);
        clearInterval(interval);
      } else {
        setPhase(phases[idx]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 py-1 text-ink-soft">
      <Loader2 className="size-3.5 animate-spin" />
      <span className="text-xs transition-opacity duration-300">{phase}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function QandA() {
  const { projectId } = useProject();
  const { user } = useUser();
  const utils = api.useUtils();
  const refetch = useRefetch();

  const { data: questions } = api.project.getQuestions.useQuery(
    { projectId: projectId as string },
    { enabled: !!projectId }
  );
  const deleteQuestion = api.project.deleteQuestion.useMutation();
  const saveAnswer = api.project.saveAnswer.useMutation();
  const updateQuestion = api.project.updateQuestion.useMutation();

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string; filesReferences?: any[] }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{ fileName: string; sourceCode: string } | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: activeQuestion } = api.project.getQuestionById.useQuery(
    { questionId: currentQuestionId as string },
    { enabled: !!currentQuestionId }
  );

  useEffect(() => {
    if (activeQuestion) {
      const q = activeQuestion as any;
      let parsedMessages: any[] = [];
      try {
        if (q.messages && q.messages !== "[]" && typeof q.messages === "string") {
          parsedMessages = JSON.parse(q.messages);
        } else if (typeof q.messages === "object" && Array.isArray(q.messages)) {
          parsedMessages = q.messages;
        }
      } catch (e) {}

      if (parsedMessages.length === 0) {
        parsedMessages = [
          { role: "user", content: activeQuestion.question },
          { role: "bot", content: activeQuestion.answer },
        ];
      }
      setMessages(parsedMessages);
    }
  }, [activeQuestion]);

  // Scroll to bottom when new messages are added, but not during stream updates
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteQuestion.mutateAsync({ questionId: id });
      toast.success("Conversation deleted");
      if (currentQuestionId === id) startNewChat();
      utils.project.getQuestions.invalidate();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const startNewChat = () => {
    setCurrentQuestionId(null);
    setMessages([]);
    setInput("");
    setIsSheetOpen(false);
    setViewerFile(null);
  };

  // Reset chat when project changes
  useEffect(() => {
    startNewChat();
  }, [projectId]);

  const loadChat = (id: string) => {
    setCurrentQuestionId(id);
    setIsSheetOpen(false);
    setViewerFile(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !projectId || loading) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      setMessages((prev) => [...prev, { role: "bot", content: "" }]);

      const { output, filesReferences } = await askChatBot(userMessage, projectId, messages);

      let fullAnswer = "";
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          fullAnswer += delta;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "bot", content: fullAnswer, filesReferences };
            return updated;
          });
        }
      }

      const finalMessages = [...newMessages, { role: "bot", content: fullAnswer, filesReferences }];

      if (!currentQuestionId) {
        saveAnswer.mutate(
          {
            projectId,
            question: userMessage,
            answer: fullAnswer,
            filesReferences: filesReferences,
            messages: finalMessages,
          },
          {
            onSuccess: (data) => {
              setCurrentQuestionId(data.id);
              utils.project.getQuestions.invalidate();
              refetch();
            },
          }
        );
      } else {
        updateQuestion.mutate(
          { questionId: currentQuestionId, messages: finalMessages },
          { onSuccess: () => utils.project.getQuestions.invalidate() }
        );
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
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

  const openFileInViewer = (file: { fileName: string; sourceCode: string }) => {
    setViewerFile(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full max-w-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="flex-1 w-full max-w-full overflow-hidden">
        {/* ━━━ LEFT PANEL: Chat ━━━ */}
        <ResizablePanel defaultSize={viewerFile ? 55 : 100} minSize={35}>
          <div className="flex flex-col h-full">
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-ink/6">
              <div className="flex items-center gap-2.5">
                <div className="size-2 rounded-full bg-coral animate-pulse" />
                <span className="text-sm font-semibold text-ink leading-none tracking-tight">
                  {currentQuestionId ? "Conversation" : "New chat"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentQuestionId && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={startNewChat}
                    className="gap-1.5 h-8 rounded-lg bg-ink text-cream px-3 text-[11px] font-bold transition-all hover:bg-ink/85 shadow-sm flex items-center"
                  >
                    <Plus className="size-3.5" />
                    New Chat
                  </Button>
                )}

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={!projectId}
                      className="gap-1.5 h-8 rounded-lg bg-ink text-cream px-3 text-[11px] font-bold transition-all hover:bg-ink/85 shadow-sm flex items-center"
                    >
                      <History className="size-3.5" />
                      History
                      {questions && questions.length > 0 && (
                        <span className="ml-1 bg-coral text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                          {questions.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>

                  {/* ── History Sheet ── */}
                  <SheetContent
                    side="right"
                    className="w-80 p-0 flex flex-col bg-cream border-l border-ink/10"
                  >
                    <div className="px-5 py-4 border-b border-ink/10 flex items-center justify-between shrink-0">
                      <SheetTitle className="text-sm font-semibold text-ink">
                        History
                      </SheetTitle>
                      <button
                        onClick={startNewChat}
                        className="flex items-center gap-1.5 text-xs text-coral hover:text-coral font-medium px-2.5 py-1.5 rounded-lg hover:bg-coral/10 transition-colors"
                      >
                        <Plus className="size-3" />
                        New chat
                      </button>
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto py-2">
                      {questions && questions.length > 0 ? (
                        <div className="px-3 space-y-0.5">
                          {questions.map((ques) => (
                            <div
                              key={ques.id}
                              onClick={() => loadChat(ques.id)}
                              className={cn(
                                "group relative flex items-start justify-between gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                                currentQuestionId === ques.id
                                  ? "bg-coral/10 border border-coral/20"
                                  : "hover:bg-cream-deep"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "text-[13px] leading-snug line-clamp-2 font-medium",
                                    currentQuestionId === ques.id
                                      ? "text-coral"
                                      : "text-ink"
                                  )}
                                >
                                  {ques.question}
                                </p>
                                <p className="text-[11px] text-ink-soft/60 mt-1">
                                  {new Date(ques?.createdAt || Date.now()).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={(e) => handleDelete(e, ques.id)}
                                className="opacity-100 p-1 rounded-md hover:bg-red-50 text-ink-soft/50 hover:text-red-500 shrink-0 mt-0.5"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                          <p className="text-sm font-medium text-ink">No conversations yet</p>
                          <p className="text-xs text-ink-soft mt-1">Your chats will appear here.</p>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* ── Chat scroll area ── */}
            <div
              ref={scrollAreaRef}
              className="flex-1 overflow-y-auto px-5 pb-4 scroll-smooth"
            >
              {messages.length === 0 ? (
                /* Empty state */
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="p-3 rounded-2xl bg-cream-deep border border-ink/6 mb-4">
                    <Logo width={40} height={40} />
                  </div>
                  <h2 className="text-base font-semibold text-ink mb-1.5">
                    Ask anything about your codebase
                  </h2>
                  <p className="text-sm text-ink-soft max-w-xs leading-relaxed">
                    Our AI understands your entire repo — files, architecture, dependencies, and logic.
                  </p>

                  {/* Suggestion chips */}
                  <div className="mt-8 flex flex-col gap-2 w-full max-w-sm">
                    {[
                      "How is authentication handled?",
                      "Explain the folder structure",
                      "Where is the API layer defined?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="text-left text-sm text-ink-soft px-4 py-2.5 rounded-xl border border-ink/10 hover:border-coral/30 hover:bg-coral/10 hover:text-coral transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  <div className="space-y-6 pt-4 max-w-4xl mx-auto w-full">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={cn(
                          "flex gap-3",
                          msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {/* Bot avatar */}
                        {msg.role !== "user" && (
                          <div className="shrink-0 mt-1">
                            <div className="size-7 rounded-lg bg-cream-deep border border-ink/8 flex items-center justify-center">
                              <Logo width={18} height={18} />
                            </div>
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[82%]",
                            msg.role === "user"
                              ? "bg-coral text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm shadow-sm"
                              : "bg-cream-deep px-5 py-4 rounded-2xl rounded-tl-sm border border-ink/8 shadow-sm"
                          )}
                        >
                          {msg.role === "user" ? (
                            <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-normal">
                              {msg.content}
                            </p>
                          ) : (
                            <div>
                              {msg.content === "" ? (
                                <ThinkingState />
                              ) : (
                                <StreamingMarkdown 
                                  content={msg.content} 
                                  isStreaming={loading && idx === messages.length - 1} 
                                />
                              )}

                              {/* File references — open in right panel */}
                              {msg.filesReferences && msg.filesReferences.length > 0 && (
                                <div className="mt-4 p-3.5 rounded-2xl bg-coral/5 border border-coral/15 flex flex-wrap gap-2 shadow-sm">
                                  <div className="w-full mb-1 flex items-center gap-1.5">
                                    <div className="size-1.5 rounded-full bg-coral animate-pulse" />
                                    <span className="text-[11px] text-coral font-bold uppercase tracking-wider">
                                      References
                                    </span>
                                  </div>
                                  {msg.filesReferences.map((file: any, index: number) => (
                                    <button
                                      key={index}
                                      onClick={() => openFileInViewer(file)}
                                      className="flex items-center gap-1.5 text-[12px] font-semibold text-ink bg-cream hover:bg-coral/10 hover:text-coral px-3 py-1.5 rounded-xl transition-all border border-ink/10 hover:border-coral/25 shadow-sm hover:shadow-md active:scale-95"
                                    >
                                      <FileCode2 className="size-3.5 text-coral" />
                                      {file.fileName}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* User avatar */}
                        {msg.role === "user" && (
                          <div className="shrink-0 mt-0.5">
                            {user?.imageUrl ? (
                              <Image
                                src={user.imageUrl}
                                alt="You"
                                width={28}
                                height={28}
                                className="rounded-full ring-2 ring-cream shadow-sm"
                              />
                            ) : (
                              <div className="size-7 rounded-full bg-cream-deep flex items-center justify-center border border-ink/8">
                                <User className="size-3.5 text-ink-soft" />
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* ── Input area ── */}
            <div className="shrink-0 pt-2 pb-3 px-5 border-t border-ink/6">
              <div className="max-w-4xl mx-auto w-full">
                <div
                  className={cn(
                    "relative flex items-end gap-2 bg-cream border rounded-2xl px-4 py-3 shadow-sm transition-all duration-200",
                    "border-ink/12 focus-within:border-coral focus-within:shadow-md focus-within:shadow-coral/10"
                  )}
                >
                  <TextareaAutosize
                    ref={textareaRef}
                    minRows={1}
                    maxRows={6}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={projectId ? "Ask about your codebase…" : "Select a project to start chatting…"}
                    disabled={!projectId}
                    className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-soft/50 focus:outline-none resize-none min-h-[24px] max-h-40 leading-relaxed py-0.5 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={() => handleSubmit()}
                    disabled={loading || !input.trim() || !projectId}
                    className={cn(
                      "size-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      input.trim() && !loading && projectId
                        ? "bg-coral hover:bg-coral/90 text-white shadow-sm hover:scale-105 active:scale-95"
                        : "bg-cream-deep text-ink-soft cursor-not-allowed"
                    )}
                  >
                    {loading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ArrowUp className="size-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-center text-[11px] text-ink-soft/60 mt-2">
                  Our AI answers from your connected codebase ·{" "}
                  <kbd className="text-[10px] bg-cream-deep px-1.5 py-0.5 rounded font-mono border border-ink/8">
                    ↵
                  </kbd>{" "}
                  to send
                </p>
              </div>
            </div>
          </div>
        </ResizablePanel>

        {/* ━━━ RESIZE HANDLE + RIGHT PANEL: Code Viewer ━━━ */}
        {viewerFile && (
          <>
            <ResizableHandle withHandle className="bg-ink/6 hover:bg-coral/20 transition-colors" />
            <ResizablePanel defaultSize={45} minSize={25} maxSize={65}>
              <CodeViewerPanel file={viewerFile} onClose={() => setViewerFile(null)} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}