import { getTasks, getProjects } from "@/lib/db";
import DashboardClient from "../components/DashboardClient";

// SSR - fetches fresh data on every request
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()]);

  return <DashboardClient initialTasks={tasks} initialProjects={projects} />;
}
