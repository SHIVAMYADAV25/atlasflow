"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.data || []));
  }, []);

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const d = await res.json();
    if (d.success) {
      setProjects((p) => [...p, d.data]);
      setNewName("");
      setAdding(false);
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="user-avatar">A</div>
          <span className="user-email">aaron.mahlke@gm...</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: "auto", color: "var(--text-muted)", flexShrink: 0 }}>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div style={{ marginBottom: 16 }}>
          <div className="sidebar-section-label">Projects</div>

          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard?project=${p.id}`}
              className={`sidebar-link ${pathname === "/dashboard" ? "active" : ""}`}
            >
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              {p.name}
            </Link>
          ))}

          {adding ? (
            <form onSubmit={handleAddProject} style={{ padding: "4px 8px" }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => { if (!newName.trim()) setAdding(false); }}
                placeholder="Project name…"
                style={{
                  width: "100%",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 5,
                  padding: "5px 8px",
                  color: "var(--text-primary)",
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </form>
          ) : (
            <button className="sidebar-add-btn" onClick={() => setAdding(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New project
            </button>
          )}
        </div>

        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Pages</div>

        <Link href="/" className={`sidebar-link ${pathname === "/" ? "active" : ""}`}>
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </Link>

        <Link href="/dashboard" className={`sidebar-link ${pathname === "/dashboard" ? "active" : ""}`}>
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Today
        </Link>

        <Link href="/updates" className={`sidebar-link ${pathname === "/updates" ? "active" : ""}`}>
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Updates
        </Link>
      </nav>
    </aside>
  );
}
