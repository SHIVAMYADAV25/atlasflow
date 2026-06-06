import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") ?? undefined;
    const tasks = getTasks(projectId);
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: "Task title is required" }, { status: 400 });
    }
    if (!body.projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }
    const task = createTask({
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      priority: body.priority || "Medium",
      status: body.status || "todo",
      dueDate: body.dueDate || undefined,
      projectId: body.projectId,
    });
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 });
  }
}
