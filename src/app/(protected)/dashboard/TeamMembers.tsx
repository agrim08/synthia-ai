"use client";

import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  return (
    <div className="flex items-center gap-3">
       <div className="flex -space-x-2.5 overflow-hidden">
        {members?.map((member) => (
          <Image
            key={member.id}
            src={member.user.imageUrl as string}
            alt={member.user.firstName || "Member"}
            width={28}
            height={28}
            className="inline-block size-7 rounded-full ring-2 ring-white cursor-pointer hover:z-10 relative transition-transform hover:scale-110"
            title={member.user.firstName || "Member"}
          />
        ))}
      </div>
      <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
        {members?.length || 0} {members?.length === 1 ? 'member' : 'members'}
      </span>
    </div>
  );
};

export default TeamMembers;
