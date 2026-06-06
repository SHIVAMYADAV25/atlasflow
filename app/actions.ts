"use server";

import { revalidatePath } from "next/cache";
import { createTask, updateTask, deleteTask, createProject } from "@/lib/db";

// Server Action: Toggle task status (used in dashboard for quick complete/uncomplete)
export async function toggleTaskStatus(taskId: string, currentStatus: string) {
  const newStatus = currentStatus === "done" ? "todo" : "done";
  const task = updateTask(taskId, { status: newStatus });
  if (!task) throw new Error("Task not found");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return task;
}

// Server Action: Quick create task from dashboard
export async function quickCreateTask(formData: FormData) {
  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;

  if (!title?.trim()) throw new Error("Title is required");
  if (!projectId) throw new Error("Project is required");

  const task = createTask({
    title: title.trim(),
    priority: "Medium",
    status: "todo",
    projectId,
  });

  revalidatePath("/dashboard");
  return task;
}

// Server Action: Create a new project
export async function createProjectAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("Project name is required");

  const project = createProject(name.trim());
  revalidatePath("/dashboard");
  revalidatePath("/");
  return project;
}

// Server Action: Delete task
export async function deleteTaskAction(taskId: string) {
  const deleted = deleteTask(taskId);
  if (!deleted) throw new Error("Task not found");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { success: true };
}
