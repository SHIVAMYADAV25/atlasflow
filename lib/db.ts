import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type { Project, Task } from "@prisma/client";

// ── Projects ──────────────────────────────────────────────

export async function getProjects() {
  return prisma.project.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createProject(name: string) {
  return prisma.project.create({
    data: { name },
  });
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ── Tasks ─────────────────────────────────────────────────

export async function getTasks(projectId?: string) {
  return prisma.task.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { createdAt: "asc" },
  });
}

export async function getTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  return task ?? undefined;
}

export async function createTask(
  data: Omit<import("@prisma/client").Task, "id" | "createdAt" | "updatedAt">
) {
  return prisma.task.create({ data });
}

export async function updateTask(
  id: string,
  data: Partial<Omit<import("@prisma/client").Task, "id" | "createdAt">>
) {
  try {
    return await prisma.task.update({ where: { id }, data });
  } catch {
    return null;
  }
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}