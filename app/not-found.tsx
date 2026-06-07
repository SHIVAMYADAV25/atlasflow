import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12, color: "var(--text-muted)" }}>
      <div style={{ fontSize: 48 }}>404</div>
      <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Page not found</div>
      <Link href="/dashboard" style={{ marginTop: 8, fontSize: 13, color: "var(--text-primary)", textDecoration: "none", padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 7 }}>
        Go to dashboard
      </Link>
    </div>
  );
}
