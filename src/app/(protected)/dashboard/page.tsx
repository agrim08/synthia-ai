"use client";

import useProject from "@/hooks/useProject";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLogs from "./CommitLogs";
import QuestionCard from "./QuestionCard";
import MeetingCard from "./MeetingCard";

const page = () => {
  const { project } = useProject();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* {Github link} */}
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center gap-x-2">
            <Github className="size-6 text-white" />
            <div className="m1-2">
              {/* {ToDo hide link} */}
              <p className="text-sm font-medium text-white/80">
                This project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="text-md inline-flex items-center font-bold text-white hover:underline"
                >
                  {project?.name}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="flex items-center gap-4">{/* {Team Member} */}</div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <QuestionCard />
          <MeetingCard />
        </div>
      </div>

      <div className="mt-8">Commits</div>
      <CommitLogs />
    </div>
  );
};

export default page;
