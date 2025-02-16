"use client";

import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import Image from "next/image";
import React, { useState } from "react";

const TeamMembers = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({
    projectId,
  });
  return (
    <div className="flex space-x-2">
      {members?.map((member) => (
        <div
          key={member.id}
          className="group relative" // "group" for hover styling
        >
          <Image
            src={member.user.imageUrl as string}
            alt={
              member?.user?.firstName ? member?.user?.firstName[0] || "" : ""
            }
            width={32}
            height={32}
            className="cursor-pointer rounded-full"
            onClick={() =>
              setSelectedMemberId((prev) =>
                prev === member.id ? null : member.id,
              )
            }
          />

          {/* Tooltip */}
          <div
            className={`invisible absolute left-1/2 top-full mt-2 flex h-10 w-14 -translate-x-1/2 items-center justify-center rounded-md bg-gray-700 text-sm text-black opacity-0 shadow group-hover:visible group-hover:opacity-100 ${
              selectedMemberId === member.id ? "visible opacity-100" : ""
            } `}
          >
            {member.user.firstName || "user"}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamMembers;
