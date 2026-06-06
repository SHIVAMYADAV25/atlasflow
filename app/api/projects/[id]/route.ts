import { NextRequest, NextResponse } from "next/server";
import { deleteProject } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteProject(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 });
  }
}
