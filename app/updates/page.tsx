// SSG - statically generated at build time (changelog doesn't change at runtime)
export const dynamic = "force-static";

const UPDATES = [
  {
    version: "Version 1.2.0",
    date: "20 May 2025",
    desc: "Added task priority and due date filtering.",
    latest: true,
  },
  {
    version: "Version 1.1.0",
    date: "15 May 2025",
    desc: "Improved task detail view and added edit functionality.",
    latest: false,
  },
  {
    version: "Version 1.0.0",
    date: "10 May 2025",
    desc: "Initial release with core features.",
    latest: false,
  },
  {
    version: "Version 0.9.0",
    date: "05 May 2025",
    desc: "Beta testing and performance improvements.",
    latest: false,
  },
];

export default function UpdatesPage() {
  return (
    <div>
      <div className="topbar">
        <span>Personal</span>
        <span className="topbar-sep">/</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span className="topbar-current">Updates</span>
      </div>

      <div className="updates-container">
        <h1 className="page-title" style={{ marginBottom: 28 }}>Updates</h1>

        <div className="update-timeline">
          {UPDATES.map((u) => (
            <div key={u.version} className="update-item">
              <div className={`update-dot ${u.latest ? "latest" : ""}`} />
              <div className="update-date">{u.date}</div>
              <div className="update-version">{u.version}</div>
              <div className="update-desc">{u.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
