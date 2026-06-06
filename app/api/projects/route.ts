import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = getProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: "Project name is required" }, { status: 400 });
    }
    const project = createProject(body.name.trim());
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
  }
}
