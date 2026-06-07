"use client";

import { useState } from "react";
import { toggleTaskStatus } from "../actions";
import type { Task, Project } from "@/lib/db";

interface Props {
  initialTasks: Task[];
  initialProjects: Project[];
  activeProject: Project | null;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

function dueDateLabel(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const todayMs = new Date(new Date().toDateString()).getTime();
  const taskMs = new Date(d.toDateString()).getTime();
  if (taskMs === todayMs)
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (taskMs === todayMs + 86400000) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function pCls(p: string) {
  return p.toLowerCase() as "low" | "medium" | "high";
}

// ── toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: "error" | "ok" }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 200,
        padding: "10px 16px",
        borderRadius: 8,
        fontSize: 13,
        background: type === "error" ? "rgba(239,68,68,.15)" : "rgba(74,222,128,.12)",
        border: `1px solid ${type === "error" ? "rgba(239,68,68,.4)" : "rgba(74,222,128,.3)"}`,
        color: type === "error" ? "var(--priority-high)" : "var(--status-done)",
        backdropFilter: "blur(4px)",
        boxShadow: "0 4px 24px rgba(0,0,0,.4)",
        maxWidth: 320,
      }}
    >
      {msg}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function DashboardClient({ initialTasks, initialProjects, activeProject }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "error" | "ok" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    status: "todo" as "todo" | "in-progress" | "done",
    dueDate: "",
    projectId: activeProject?.id ?? projects[0]?.id ?? "",
  });

  const todoTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  function showToast(msg: string, type: "error" | "ok" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── toggle ──────────────────────────────────────────────────────────────────

  async function handleToggle(task: Task) {
    // Optimistic update
    const optimistic: Task = {
      ...task,
      status: task.status === "done" ? "todo" : "done",
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? optimistic : t)));
    if (selectedTask?.id === task.id) setSelectedTask(optimistic);

    try {
      const updated = await toggleTaskStatus(task.id, task.status);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? (updated as Task) : t)));
      if (selectedTask?.id === task.id) setSelectedTask(updated as Task);
    } catch (err) {
      // Roll back
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      if (selectedTask?.id === task.id) setSelectedTask(task);
      showToast("Failed to update task status", "error");
    }
  }

  // ── delete ──────────────────────────────────────────────────────────────────

  async function handleDelete(taskId: string) {
    const backup = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Delete failed");
      showToast("Task deleted", "ok");
    } catch (err) {
      // Roll back
      if (backup) setTasks((prev) => [...prev, backup].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      showToast((err as Error).message || "Failed to delete task", "error");
    }
  }

  // ── quick add ───────────────────────────────────────────────────────────────

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = quickTitle.trim();
    if (!title) return;
    const projectId = activeProject?.id ?? projects[0]?.id;
    if (!projectId) { showToast("No project selected", "error"); return; }

    setQuickTitle("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority: "Medium", status: "todo", projectId }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Create failed");
      setTasks((prev) => [...prev, d.data]);
    } catch (err) {
      setQuickTitle(title); // restore
      showToast((err as Error).message || "Failed to add task", "error");
    }
  }

  // ── create modal ─────────────────────────────────────────────────────────────

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Create failed");
      // Only add to local list if it belongs to the current project view
      if (!activeProject || d.data.projectId === activeProject.id) {
        setTasks((prev) => [...prev, d.data]);
      }
      setForm({ title: "", description: "", priority: "Medium", status: "todo", dueDate: "", projectId: activeProject?.id ?? projects[0]?.id ?? "" });
      setShowCreate(false);
      showToast("Task created", "ok");
    } catch (err) {
      showToast((err as Error).message || "Failed to create task", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // ── save edit ─────────────────────────────────────────────────────────────────

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description || undefined,
          priority: editingTask.priority,
          status: editingTask.status,
          dueDate: editingTask.dueDate || undefined,
        }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Update failed");
      setTasks((prev) => prev.map((t) => (t.id === d.data.id ? d.data : t)));
      setSelectedTask(d.data);
      setEditingTask(null);
      showToast("Task saved", "ok");
    } catch (err) {
      showToast((err as Error).message || "Failed to save task", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const projectName = activeProject?.name ?? "All";
  const topbarLabel = activeProject ? activeProject.name : "Today";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Task list ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Topbar */}
        <div className="topbar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
          <span>{projectName}</span>
          <span className="topbar-sep">/</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span className="topbar-current">{topbarLabel}</span>
        </div>

        <div className="page-container">
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div className="page-title">
              {topbarLabel}
              <span className="task-count-badge">{todoTasks.length} tasks</span>
            </div>
            <button
              onClick={() => { setForm((f) => ({ ...f, projectId: activeProject?.id ?? projects[0]?.id ?? "" })); setShowCreate(true); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 7,
                background: "var(--text-primary)", color: "var(--bg-primary)",
                border: "none", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New task
            </button>
          </div>

          {/* Quick add */}
          <form onSubmit={handleQuickAdd} className="quick-add-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: "var(--text-muted)", flexShrink: 0 }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            <input
              className="quick-add-input"
              placeholder="Add a task…"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
            />
            <span className="kbd">⌘ N</span>
          </form>

          {/* Empty state */}
          {todoTasks.length === 0 && doneTasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>No tasks in {projectName}</div>
              <div style={{ fontSize: 12 }}>Add one above or click "New task"</div>
            </div>
          )}

          {/* Todo tasks */}
          {todoTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isSelected={selectedTask?.id === task.id}
              onToggle={() => handleToggle(task)}
              onClick={() => { setSelectedTask(task); setEditingTask(null); }}
              onDelete={() => handleDelete(task.id)}
            />
          ))}

          {/* Completed */}
          {doneTasks.length > 0 && (
            <>
              <div className="section-header">
                <span className="section-title">Completed</span>
                <span className="task-count-badge">{doneTasks.length} tasks</span>
              </div>
              {doneTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isSelected={selectedTask?.id === task.id}
                  onToggle={() => handleToggle(task)}
                  onClick={() => { setSelectedTask(task); setEditingTask(null); }}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Detail / Edit panel ────────────────────────────────────────────── */}
      {selectedTask && (
        <div className="detail-panel">
          <div className="detail-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: "var(--text-muted)" }}>
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{projectName}</span>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: "var(--text-muted)" }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{topbarLabel}</span>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Task</span>
            <button
              onClick={() => { setSelectedTask(null); setEditingTask(null); }}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
            >×</button>
          </div>

          <div className="detail-body">
            {editingTask ? (
              /* ── Edit form ── */
              <form onSubmit={handleSaveEdit}>
                <div style={{ marginBottom: 16 }}>
                  <label className="detail-field-label" style={{ display: "block", marginBottom: 4 }}>Title</label>
                  <input
                    className="edit-input"
                    style={{ fontSize: 16, fontWeight: 600 }}
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="detail-field-label" style={{ display: "block", marginBottom: 4 }}>Description</label>
                  <textarea
                    className="edit-input"
                    style={{ minHeight: 72, resize: "vertical" }}
                    placeholder="Add a description…"
                    value={editingTask.description || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="detail-field-label" style={{ display: "block", marginBottom: 6 }}>Priority</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["Low", "Medium", "High"] as const).map((p) => (
                      <button
                        key={p} type="button"
                        onClick={() => setEditingTask({ ...editingTask, priority: p })}
                        className={`priority-option ${editingTask.priority === p ? `selected ${pCls(p)}` : ""}`}
                      >
                        <div className={`priority-dot ${pCls(p)}`} />
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="detail-field-label" style={{ display: "block", marginBottom: 4 }}>Status</label>
                  <select
                    className="edit-input"
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as Task["status"] })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="detail-field-label" style={{ display: "block", marginBottom: 4 }}>Due date</label>
                  <input
                    type="datetime-local"
                    className="edit-input"
                    value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                    }
                  />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                    {submitting ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button" className="btn btn-primary"
                    onClick={() => setEditingTask(null)}
                    disabled={submitting}
                  >Cancel</button>
                </div>
              </form>
            ) : (
              /* ── Detail view ── */
              <>
                <div className="detail-priority-badge">
                  <div className={`priority-dot ${pCls(selectedTask.priority)}`} />
                  <span className={`priority-label ${pCls(selectedTask.priority)}`}>{selectedTask.priority}</span>
                </div>

                <div className="detail-title">{selectedTask.title}</div>

                {selectedTask.description && (
                  <div className="detail-field">
                    <div className="detail-field-label">Description</div>
                    <div className="detail-field-value muted" style={{ lineHeight: 1.6 }}>{selectedTask.description}</div>
                  </div>
                )}

                <div className="detail-field">
                  <div className="detail-field-label">Due date</div>
                  <div className="detail-field-value">{formatDateTime(selectedTask.dueDate)}</div>
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">Priority</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className={`priority-dot ${pCls(selectedTask.priority)}`} />
                    <span className={`priority-label ${pCls(selectedTask.priority)}`}>{selectedTask.priority}</span>
                  </div>
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">Status</div>
                  <span className={`status-badge ${selectedTask.status}`}>
                    {selectedTask.status === "in-progress" ? "In Progress"
                      : selectedTask.status === "done" ? "Done" : "To Do"}
                  </span>
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">Project</div>
                  <div className="detail-field-value muted">
                    {projects.find((p) => p.id === selectedTask.projectId)?.name ?? selectedTask.projectId}
                  </div>
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">Created</div>
                  <div className="detail-field-value muted">{formatDateTime(selectedTask.createdAt)}</div>
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">Updated</div>
                  <div className="detail-field-value muted">{formatDateTime(selectedTask.updatedAt)}</div>
                </div>
              </>
            )}
          </div>

          {!editingTask && (
            <div className="detail-actions">
              <button className="btn btn-primary" onClick={() => setEditingTask({ ...selectedTask })}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit task
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(selectedTask.id)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
                Delete task
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Create task modal ──────────────────────────────────────────────── */}
      {showCreate && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 6, fontSize: 12, color: "var(--text-muted)", alignItems: "center" }}>
                  <span>{projects.find((p) => p.id === form.projectId)?.name ?? "Personal"}</span>
                  <span>/</span>
                  <span>New task</span>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}
                >×</button>
              </div>
              <div className="modal-title">New task</div>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-field">
                  <label className="form-label">Title</label>
                  <input
                    autoFocus
                    className="form-input"
                    placeholder="e.g. Design landing page"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Add a detailed description…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Priority</label>
                  <div className="priority-picker">
                    {(["Low", "Medium", "High"] as const).map((p) => (
                      <button
                        key={p} type="button"
                        onClick={() => setForm({ ...form, priority: p })}
                        className={`priority-option ${form.priority === p ? `selected ${pCls(p)}` : ""}`}
                      >
                        <div className={`priority-dot ${pCls(p)}`} />
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Task["status"] })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Project</label>
                  <select
                    className="form-input"
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Due date</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? "Creating…" : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ── TaskRow ───────────────────────────────────────────────────────────────────

function TaskRow({
  task, isSelected, onToggle, onClick, onDelete,
}: {
  task: Task;
  isSelected: boolean;
  onToggle: () => void;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`task-row ${task.status === "done" ? "done" : ""}`}
      onClick={onClick}
      style={{
        background: isSelected ? "var(--bg-secondary)" : undefined,
        borderColor: isSelected ? "var(--border)" : undefined,
      }}
    >
      <button
        className={`task-checkbox ${task.status === "done" ? "checked" : ""}`}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      />
      <span className="task-title">{task.title}</span>
      <div className={`priority-dot ${task.priority.toLowerCase()}`} />
      <span className={`priority-label ${task.priority.toLowerCase()}`}>{task.priority}</span>
      <span className="task-time">{dueDateLabel(task.dueDate)}</span>
      <button
        className="task-delete-btn"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Delete task"
      >✕</button>
    </div>
  );
}
