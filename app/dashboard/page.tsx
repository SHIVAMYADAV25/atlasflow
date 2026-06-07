import { getTasks, getProjects } from "@/lib/db";
import DashboardClient from "../components/DashboardClient";

// SSR — always fresh, reads ?project= from searchParams
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ project?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { project: projectId } = await searchParams;
  const [allProjects, allTasks] = await Promise.all([getProjects(), getTasks()]);

  // Default to first project if none specified
  const activeProject = allProjects.find((p) => p.id === projectId) ?? allProjects[0] ?? null;
  const tasks = activeProject
    ? allTasks.filter((t) => t.projectId === activeProject.id)
    : [];

  return (
    <DashboardClient
      initialTasks={tasks}
      initialProjects={allProjects}
      activeProject={activeProject}
    />
  );
}
