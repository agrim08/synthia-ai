import { api } from "@/trpc/react";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api?.project?.getProjects?.useQuery();
  const [projectId, setProjectId] = useLocalStorage("Synthia-Project-key", "");

  // Clear stale projectId if it doesn't exist in the current user's project list
  useEffect(() => {
    if (projects && projectId && !projects.find((p) => p.id === projectId)) {
      setProjectId("");
    }
  }, [projects, projectId, setProjectId]);

  const project = projects?.find((project) => project.id === projectId);

  return { 
    projectId: project ? project.id : "", 
    setProjectId, 
    project, 
    projects 
  };
};

export default useProject;
