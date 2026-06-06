import Link from "next/link";
import { getTasks, getProjects } from "@/lib/db";

// ISR - revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()]);
  const doneTasks = tasks.filter((t) => t.status === "done");
  const totalTasks = tasks.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">Atlasflow</div>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <Link href="/updates" className="landing-nav-link">Updates</Link>
          <Link href="/dashboard" className="landing-nav-link" style={{ color: "var(--text-primary)" }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero">
        <h1 className="landing-h1">
          Organize your tasks.<br />
          Focus on what matters.
        </h1>
        <p className="landing-sub">
          A minimal and powerful todo app to help you stay organized and get things done.
        </p>
        <div className="landing-cta-row">
          <Link href="/dashboard" className="btn-cta-primary">Get Started</Link>
          <Link href="/updates" className="btn-cta-secondary">
            Learn more <span>→</span>
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "flex",
        gap: 32,
        padding: "20px 32px",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{totalTasks}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total tasks</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{doneTasks.length}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Completed</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{projects.length}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Projects</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--status-done)" }}>
            {totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0}%
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Completion rate</div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="landing-features" style={{ marginTop: 40, borderTop: "none" }}>
        <div className="feature-item">
          <div className="feature-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div>
            <div className="feature-title">Stay organized</div>
            <div className="feature-desc">Keep all your tasks in one place and never miss a thing.</div>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <div className="feature-title">Track progress</div>
            <div className="feature-desc">Monitor your progress and achieve your goals.</div>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-5" />
            </svg>
          </div>
          <div>
            <div className="feature-title">Minimal & clean</div>
            <div className="feature-desc">No clutter, just focus. Built for productivity.</div>
          </div>
        </div>
      </div>

      {/* Recent tasks preview */}
      <div style={{ padding: "24px 32px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Recent tasks</div>
        {tasks.slice(0, 5).map((task) => (
          <div key={task.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              border: `1.5px solid ${task.status === "done" ? "var(--status-done)" : "var(--border-light)"}`,
              background: task.status === "done" ? "var(--status-done)" : "none",
              flexShrink: 0,
            }} />
            <span style={{
              flex: 1, fontSize: 13,
              color: task.status === "done" ? "var(--text-muted)" : "var(--text-primary)",
              textDecoration: task.status === "done" ? "line-through" : "none",
            }}>{task.title}</span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
              {task.priority}
            </span>
          </div>
        ))}
        <Link href="/dashboard" style={{
          display: "inline-block", marginTop: 16, fontSize: 12,
          color: "var(--text-secondary)", textDecoration: "none",
        }}>
          View all tasks →
        </Link>
      </div>
    </div>
  );
}
