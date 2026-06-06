import { NextRequest, NextResponse } from "next/server";
import { getTask, updateTask, deleteTask } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = getTask(id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const task = updateTask(id, {
      title: body.title?.trim(),
      description: body.description?.trim() || undefined,
      priority: body.priority,
      status: body.status,
      dueDate: body.dueDate || undefined,
    });
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const task = updateTask(id, body);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteTask(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 });
  }
}
