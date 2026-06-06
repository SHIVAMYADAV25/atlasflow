import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  status: "todo" | "in-progress" | "done";
  dueDate?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

interface DB {
  projects: Project[];
  tasks: Task[];
}

function ensureDB(): DB {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(DB_PATH)) {
    const now = new Date().toISOString();
    const seed: DB = {
      projects: [
        { id: "proj_personal", name: "Personal", icon: "folder", createdAt: now },
        { id: "proj_work", name: "Work", icon: "folder", createdAt: now },
        { id: "proj_study", name: "Study", icon: "folder", createdAt: now },
        { id: "proj_health", name: "Health", icon: "folder", createdAt: now },
        { id: "proj_finance", name: "Finance", icon: "folder", createdAt: now },
        { id: "proj_ideas", name: "Ideas", icon: "folder", createdAt: now },
        { id: "proj_archive", name: "Archive", icon: "folder", createdAt: now },
      ],
      tasks: [
        {
          id: "task_1",
          title: "Design landing page",
          description: "Create a modern and responsive landing page for the product.",
          priority: "High",
          status: "in-progress",
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          projectId: "proj_personal",
          createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        },
        {
          id: "task_2",
          title: "Build authentication",
          priority: "Medium",
          status: "todo",
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          projectId: "proj_personal",
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: "task_3",
          title: "Setup database",
          priority: "High",
          status: "todo",
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          projectId: "proj_personal",
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        {
          id: "task_4",
          title: "Write API documentation",
          priority: "Low",
          status: "todo",
          dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
          projectId: "proj_personal",
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: "task_5",
          title: "Deploy to production",
          priority: "Medium",
          status: "todo",
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          projectId: "proj_personal",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "task_6",
          title: "Setup project repository",
          priority: "High",
          status: "done",
          projectId: "proj_personal",
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        {
          id: "task_7",
          title: "Initialize Next.js app",
          priority: "High",
          status: "done",
          projectId: "proj_personal",
          createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }

  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function saveDB(data: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Projects ──────────────────────────────────────────────
export function getProjects(): Project[] {
  return ensureDB().projects;
}

export function createProject(name: string): Project {
  const db = ensureDB();
  const project: Project = {
    id: generateId("proj"),
    name,
    icon: "folder",
    createdAt: new Date().toISOString(),
  };
  db.projects.push(project);
  saveDB(db);
  return project;
}

export function deleteProject(id: string): boolean {
  const db = ensureDB();
  const idx = db.projects.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  db.projects.splice(idx, 1);
  db.tasks = db.tasks.filter((t) => t.projectId !== id);
  saveDB(db);
  return true;
}

// ── Tasks ──────────────────────────────────────────────────
export function getTasks(projectId?: string): Task[] {
  const db = ensureDB();
  return projectId ? db.tasks.filter((t) => t.projectId === projectId) : db.tasks;
}

export function getTask(id: string): Task | undefined {
  return ensureDB().tasks.find((t) => t.id === id);
}

export function createTask(data: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const db = ensureDB();
  const now = new Date().toISOString();
  const task: Task = { ...data, id: generateId("task"), createdAt: now, updatedAt: now };
  db.tasks.push(task);
  saveDB(db);
  return task;
}

export function updateTask(id: string, data: Partial<Omit<Task, "id" | "createdAt">>): Task | null {
  const db = ensureDB();
  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.tasks[idx] = { ...db.tasks[idx], ...data, updatedAt: new Date().toISOString() };
  saveDB(db);
  return db.tasks[idx];
}

export function deleteTask(id: string): boolean {
  const db = ensureDB();
  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  db.tasks.splice(idx, 1);
  saveDB(db);
  return true;
}
