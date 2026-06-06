# Atlasflow — Task Manager

A minimal and powerful full-stack todo app built with Next.js, demonstrating all major concepts from the Web Dev Cohort 2026 syllabus.

## Project Overview

Atlasflow is a clean, dark-themed task management application. Users can create projects, manage tasks with priorities and due dates, view task details, edit and delete tasks — all with a polished UI inspired by modern productivity tools.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS (custom design system)
- **Database**: JSON file-based (Node.js `fs`)
- **Server Actions**: Used for toggle and quick-add flows

## How to Run Locally

```bash
npm install
cp .env.example .env
npm run dev
# Open http://localhost:3000
```

## Environment Variables

```
DATABASE_URL="file:./dev.db"
```

No external DB setup needed — data stored in `data/db.json` (auto-created).

## Routes

| Route | Description | Rendering |
|-------|-------------|-----------|
| `/` | Landing page | ISR (60s) |
| `/dashboard` | Task manager | SSR |
| `/updates` | Changelog | SSG |

## API Routes

- `GET/POST /api/projects`
- `DELETE /api/projects/[id]`
- `GET/POST /api/tasks`
- `GET/PUT/PATCH/DELETE /api/tasks/[id]`

## Server Actions (`app/actions.ts`)

- `toggleTaskStatus` — toggle done/undone with cache revalidation
- `quickCreateTask` — create task from form action
- `createProjectAction` — create project with revalidation
- `deleteTaskAction` — delete with revalidation

## Rendering Strategies

| Strategy | Where | Why |
|----------|-------|-----|
| SSR | `/dashboard` | Always fresh task data |
| ISR (60s) | `/` | Stats update periodically |
| SSG | `/updates` | Static changelog |
