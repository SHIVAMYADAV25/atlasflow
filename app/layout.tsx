import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { getProjects } from "@/lib/db";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Atlasflow — Organize your tasks",
  description: "A minimal and powerful todo app to help you stay organized and get things done.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch projects server-side so Sidebar doesn't need a client fetch on first paint
  let projects: { id: string; name: string }[] = [];
  try {
    projects = getProjects().map(({ id, name }) => ({ id, name }));
  } catch {
    // db not initialised yet on very first render — sidebar will fetch client-side
  }

  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Suspense>
            <Sidebar initialProjects={projects} />
          </Suspense>
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
