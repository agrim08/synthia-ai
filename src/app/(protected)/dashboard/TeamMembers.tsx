"use client";

import useProject from "@/hooks/useProject";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({
    projectId: projectId,
  });
  return (
    <div>
      {members?.map((member) => (
        <Image
          src={member.user.imageUrl as string}
          alt={
            member.user.firstName ? (member.user.firstName[0] as string) : ""
          }
          key={member.id}
          width={32}
          height={32}
          className="rounded-full"
        />
      ))}
    </div>
  );
};

export default TeamMembers;
