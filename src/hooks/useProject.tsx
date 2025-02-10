import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("Synthia-Project-key", "");
  const project = projects?.find((project) => project.id === projectId);

  return { projectId, setProjectId, project, projects };
};

export default useProject;
