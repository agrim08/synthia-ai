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
import {
  Sparkles,
  History,
  Trash2,
  Plus,
  ArrowUp,
  Loader2,
  User,
  Copy,
  FileCode2,
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
import IndexingStatusBanner from "@/components/IndexingStatusBanner";

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
      let parsedMessages = [];
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

  // Scroll to bottom only when new messages arrive (not on load)
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

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
  };

  const loadChat = (id: string) => {
    setCurrentQuestionId(id);
    setIsSheetOpen(false);
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
            filesReferences: {},
            messages: JSON.stringify(finalMessages),
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
          { questionId: currentQuestionId, messages: JSON.stringify(finalMessages) },
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

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto w-full">
      {projectId ? <IndexingStatusBanner projectId={projectId} /> : null}

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-2 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div>
            <span className="text-sm font-semibold text-slate-800 leading-none">
              {currentQuestionId ? "Conversation" : "New chat"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentQuestionId && (
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <Plus className="size-3.5" />
              New
            </button>
          )}

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200">
                <History className="size-3.5" />
                History
                {questions && questions.length > 0 && (
                  <span className="ml-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                    {questions.length}
                  </span>
                )}
              </button>
            </SheetTrigger>
                
            {/* ── History Sheet ── */}
            <SheetContent
              side="right"
              className="w-80 p-0 flex flex-col bg-white border-l border-slate-100"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <SheetTitle className="text-sm font-semibold text-slate-800">
                  History
                </SheetTitle>
                <button
                  onClick={startNewChat}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="size-3" />
                  New chat
                </button>
              </div>

              {/* Scrollable list — always scrollable from top */}
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
                            ? "bg-indigo-50"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-[13px] leading-snug line-clamp-2 font-medium",
                            currentQuestionId === ques.id
                              ? "text-indigo-700"
                              : "text-slate-700"
                          )}>
                            {ques.question}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {new Date(ques.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, ques.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0 mt-0.5"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                    <p className="text-sm font-medium text-slate-700">No conversations yet</p>
                    <p className="text-xs text-slate-400 mt-1">Your chats will appear here.</p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <hr className="border-slate-200 mx-2 mb-4" />

      {/* ── Chat scroll area — independently scrollable ── */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-2 pb-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          /* Empty state */
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <Logo width={56} height={56} />
            <h2 className="text-base font-semibold text-slate-800 mb-1.5 mt-2">
              Ask anything about your codebase
            </h2>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Synthia understands your entire repo — files, architecture, dependencies, and logic.
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
                  className="text-left text-sm text-slate-600 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <div className="space-y-6 pt-2 max-w-2xl mx-auto">
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
                  {msg.role === "bot" && (
                    <Logo width={36} height={36} className="shrink-0 -mt-1" />
                  )}

                  <div
                    className={cn(
                      "max-w-[82%]",
                      msg.role === "user"
                        ? "bg-slate-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
                        : "text-slate-800"
                    )}
                  >
                    {msg.role === "user" ? (
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-normal">
                        {msg.content}
                      </p>
                    ) : (
                      <div>
                        {msg.content === "" ? (
                          <div className="flex items-center gap-2 py-1 text-slate-400">
                            <Loader2 className="size-3.5 animate-spin" />
                            <span className="text-xs">Thinking…</span>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none
                            prose-p:text-[14px] prose-p:leading-relaxed prose-p:text-slate-700 prose-p:my-2
                            prose-headings:text-slate-900 prose-headings:font-semibold prose-headings:my-3
                            prose-strong:text-slate-900 prose-strong:font-semibold
                            prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none
                            prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-pre:shadow-none
                            prose-ul:my-2 prose-li:text-[14px] prose-li:text-slate-700 prose-li:my-1
                          ">
                            <div data-color-mode="light">
                              <MDEditor.Markdown
                                source={msg.content}
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

                                    return !inline && match ? (
                                      <SyntaxHighlighter
                                        style={atomDark}
                                        language={match[1]}
                                        PreTag="div"
                                        className="rounded-xl overflow-hidden shadow-sm border border-slate-800 my-3"
                                        customStyle={{
                                          background: "#1e293b",
                                          padding: "1rem",
                                          margin: 0,
                                        }}
                                        {...props}
                                      >
                                        {codeContent}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* File references */}
                        {msg.filesReferences && msg.filesReferences.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                            <span className="text-[11px] text-slate-400 font-medium self-center mr-1">
                              Sources
                            </span>
                            {msg.filesReferences.map((file: any, index: number) => (
                              <Dialog key={index}>
                                <DialogTrigger asChild>
                                  <button className="flex items-center gap-1 text-[12px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors border border-indigo-100">
                                    <FileCode2 className="size-3" />
                                    {file.fileName}
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-full flex flex-col max-h-[85vh] p-0 overflow-hidden bg-[#0d1117] border-slate-800">
                                  <DialogHeader className="px-5 py-3.5 border-b border-slate-800 flex flex-row items-center justify-between sticky top-0 bg-[#0d1117] z-10 shrink-0">
                                    <DialogTitle className="text-slate-300 font-mono text-[13px] flex items-center gap-2">
                                      <FileCode2 className="size-4 text-indigo-400" />
                                      {file.fileName}
                                    </DialogTitle>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 text-xs gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                                      onClick={() => {
                                        navigator.clipboard.writeText(file.sourceCode);
                                        toast.success("Copied to clipboard");
                                      }}
                                    >
                                      <Copy className="size-3.5" />
                                      Copy
                                    </Button>
                                  </DialogHeader>
                                  <div className="flex-1 overflow-y-auto">
                                    <SyntaxHighlighter
                                      language="typescript"
                                      style={atomDark}
                                      customStyle={{
                                        margin: 0,
                                        padding: "1.25rem",
                                        background: "transparent",
                                        fontSize: "0.8125rem",
                                        lineHeight: "1.6",
                                      }}
                                      wrapLines={true}
                                      showLineNumbers={true}
                                    >
                                      {file.sourceCode}
                                    </SyntaxHighlighter>
                                  </div>
                                </DialogContent>
                              </Dialog>
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
                          className="rounded-full ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="size-3.5 text-slate-500" />
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

      {/* ── Input area — fixed to bottom ── */}
      <div className="shrink-0 pt-2 pb-1 px-2">
        <div className="max-w-2xl mx-auto">
          <div className={cn(
            "relative flex items-end gap-2 bg-white border rounded-2xl px-4 py-3 shadow-sm transition-all duration-200",
            "border-slate-200 focus-within:border-indigo-400 focus-within:shadow-md focus-within:shadow-indigo-100/60"
          )}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your codebase…"
              className="flex-1 bg-transparent text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none min-h-[24px] max-h-40 leading-relaxed py-0.5"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !input.trim()}
              className={cn(
                "size-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                input.trim() && !loading
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:scale-105 active:scale-95"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ArrowUp className="size-3.5" />
              )}
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            Synthia answers from your connected codebase · <kbd className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">↵</kbd> to send
          </p>
        </div>
      </div>
    </div>
  );
}