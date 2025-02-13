import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api?.project?.getProjects?.useQuery();
  const [projectId, setProjectId] = useLocalStorage("Synthia-Project-key", "");
  const project = projects?.find((project) => project.id === projectId);

  // console.log("Project ID:", projectId);
  // console.log("Projects:", projects);
  // console.log("Selected Project:", project);

  return { projectId, setProjectId, project, projects };
};

export default useProject;
