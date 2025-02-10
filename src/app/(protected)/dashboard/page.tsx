"use client";

import useProject from "@/hooks/useProject";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";

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
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.githubUrl}
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
          {/* {ask and meeting} */}
        </div>
      </div>

      <div className="mt-8">Commits</div>
    </div>
  );
};

export default page;
