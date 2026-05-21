import { api } from "@/trpc/react";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects, isLoading } = api?.project?.getProjects?.useQuery();
  const [projectId, setProjectId] = useLocalStorage("OwnYourCode-Project-key", "");
  const [recentProjects, setRecentProjects] = useLocalStorage<string[]>("recent-projects-order", []);

  // Track recent projects when projectId changes
  useEffect(() => {
    if (projectId) {
      setRecentProjects((prev) => {
        const withoutCurrent = prev.filter(id => id !== projectId);
        return [projectId, ...withoutCurrent].slice(0, 50); // keep max 50
      });
    }
  }, [projectId, setRecentProjects]);

  // Clear stale projectId if it doesn't exist in the current user's project list
  useEffect(() => {
    if (projects && projectId && !projects.find((p) => p.id === projectId)) {
      setProjectId("");
    }
  }, [projects, projectId, setProjectId]);

  const project = projects?.find((project) => project.id === projectId);

  return {
    projectId: project?.id ?? null,
    setProjectId,
    project,
    projects,
    recentProjects,
    isLoading,
  };
};

export default useProject;
