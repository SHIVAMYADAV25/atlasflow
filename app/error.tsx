"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12, color: "var(--text-muted)" }}>
      <div style={{ fontSize: 32, color: "var(--priority-high)" }}>⚠</div>
      <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Something went wrong</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 320, textAlign: "center" }}>{error.message}</div>
      <button
        onClick={reset}
        style={{ marginTop: 8, fontSize: 13, color: "var(--text-primary)", cursor: "pointer", padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 7, background: "none", fontFamily: "inherit" }}
      >
        Try again
      </button>
    </div>
  );
}
