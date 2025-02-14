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
import QuestionCard from "../dashboard/QuestionCard";
import Image from "next/image";
import MDEditor from "@uiw/react-md-editor";
import FileReference from "../dashboard/FileReference";

const QandA = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({
    projectId: projectId,
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <div className="container mx-auto max-w-7xl px-4">
        <QuestionCard />
        <div className="h-4"></div>
        <h1 className="text-xl font-semibold">Saved Questions</h1>
        <div className="h-2"></div>
        <div className="grid gap-2 sm:grid-cols-1 lg:grid-cols-2">
          {questions?.map((ques, index) => {
            return (
              <React.Fragment key={ques.id}>
                <SheetTrigger
                  onClick={() => setQuestionIndex(index)}
                  className="w-full"
                >
                  <div className="flex w-full items-start gap-4 rounded-lg border bg-gray-900 p-4 shadow transition-all hover:bg-gray-800">
                    <div className="flex-shrink-0">
                      <Image
                        src={ques?.user?.imageUrl || ""}
                        alt="user"
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="line-clamp-1 flex-1 text-lg font-medium text-white">
                          {ques.question}
                        </p>
                        <span className="flex-shrink-0 whitespace-nowrap text-xs text-gray-300">
                          {ques.createdAt?.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-3 text-sm text-white/70">
                        {ques.answer}
                      </p>
                    </div>
                  </div>
                </SheetTrigger>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {question && (
        <SheetContent
          className="w-[70vw] overflow-y-auto p-4 sm:max-w-[90vw] lg:max-w-[80vw]"
          side="right"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold">
              {question.question}
            </SheetTitle>
          </SheetHeader>
          <div className="prose prose-invert max-w-none">
            <MDEditor.Markdown
              source={question.answer}
              className="overflow-auto whitespace-nowrap"
            />
          </div>
          <div className="mt-6">
            <FileReference
              filesReferences={(question.filesReferences ?? []) as any}
            />
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QandA;
