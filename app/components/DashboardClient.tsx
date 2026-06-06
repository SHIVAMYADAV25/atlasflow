"use client";

import { useState, useCallback } from "react";
import { toggleTaskStatus } from "../actions";
import type { Task, Project } from "@/lib/db";

interface Props {
  initialTasks: Task[];
  initialProjects: Project[];
}

function formatDueDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const taskDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (taskDay.getTime() === today.getTime()) return `Today`;
  if (taskDay.getTime() === tomorrow.getTime()) return `Tomorrow`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardClient({ initialTasks, initialProjects }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects] = useState<Project[]>(initialProjects);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    dueDate: "",
    projectId: projects[0]?.id || "",
  });

  const todoTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  async function handleToggle(task: Task) {
    try {
      const updated = await toggleTaskStatus(task.id, task.status);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? (updated as Task) : t)));
      if (selectedTask?.id === task.id) setSelectedTask(updated as Task);
    } catch {}
  }

  async function handleDelete(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, projectId: form.projectId || projects[0]?.id }),
    });
    const d = await res.json();
    if (d.success) {
      setTasks((prev) => [...prev, d.data]);
      setForm({ title: "", description: "", priority: "Medium", dueDate: "", projectId: projects[0]?.id || "" });
      setShowCreate(false);
    }
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: quickTitle.trim(), priority: "Medium", status: "todo", projectId: projects[0]?.id }),
    });
    const d = await res.json();
    if (d.success) {
      setTasks((prev) => [...prev, d.data]);
      setQuickTitle("");
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask) return;
    const res = await fetch(`/api/tasks/${editingTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate,
      }),
    });
    const d = await res.json();
    if (d.success) {
      setTasks((prev) => prev.map((t) => (t.id === d.data.id ? d.data : t)));
      setSelectedTask(d.data);
      setEditingTask(null);
    }
  }

  const priorityClass = (p: string) => p.toLowerCase();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Main task list */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Topbar */}
        <div className="topbar">
          <span>Personal</span>
          <span className="topbar-sep">/</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span className="topbar-current">Today</span>
        </div>

        <div className="page-container">
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div className="page-title">
              Today
              <span className="task-count-badge">{todoTasks.length} tasks</span>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 7, background: "var(--text-primary)",
                color: "var(--bg-primary)", border: "none", fontSize: 12, fontWeight: 600,
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            <input
              className="quick-add-input"
              placeholder="Add a task..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
            />
            <span className="kbd">⌘ N</span>
          </form>

          {/* Todo tasks */}
          {todoTasks.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>No tasks yet. Add one above!</div>
          ) : (
            todoTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isSelected={selectedTask?.id === task.id}
                onToggle={() => handleToggle(task)}
                onClick={() => setSelectedTask(task)}
                onDelete={() => handleDelete(task.id)}
              />
            ))
          )}

          {/* Completed section */}
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
                  onClick={() => setSelectedTask(task)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Detail / Edit panel */}
      {selectedTask && (
        <div className="detail-panel">
          <div className="detail-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Personal</span>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Today</span>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Task</span>
            <button
              onClick={() => setSelectedTask(null)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
            >×</button>
          </div>

          <div className="detail-body">
            {editingTask ? (
              <form onSubmit={handleSaveEdit}>
                <div className="detail-priority-badge">
                  <div className={`priority-dot ${priorityClass(editingTask.priority)}`} />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Priority</span>
                </div>
                <input
                  className="edit-input"
                  style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
                <textarea
                  className="edit-input"
                  style={{ minHeight: 80, resize: "vertical" }}
                  placeholder="Description..."
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {(["Low", "Medium", "High"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditingTask({ ...editingTask, priority: p })}
                      className={`priority-option ${editingTask.priority === p ? `selected ${p.toLowerCase()}` : ""}`}
                    >
                      <div className={`priority-dot ${p.toLowerCase()}`} />
                      {p}
                    </button>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="detail-field-label">Due date</label>
                  <input
                    type="datetime-local"
                    className="edit-input"
                    value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                  <button type="button" className="btn btn-primary" onClick={() => setEditingTask(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="detail-priority-badge">
                  <div className={`priority-dot ${priorityClass(selectedTask.priority)}`} />
                  <span className={`priority-label ${priorityClass(selectedTask.priority)}`}>{selectedTask.priority}</span>
                </div>

                <div className="detail-title">{selectedTask.title}</div>

                {selectedTask.description && (
                  <div className="detail-field">
                    <div className="detail-field-label">Description</div>
                    <div className="detail-field-value muted">{selectedTask.description}</div>
                  </div>
                )}

                <div className="detail-field">
                  <div className="detail-field-label">Due date</div>
                  <div className="detail-field-value">{formatDateTime(selectedTask.dueDate)}</div>
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">Priority</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className={`priority-dot ${priorityClass(selectedTask.priority)}`} />
                    <span className={`detail-field-value priority-label ${priorityClass(selectedTask.priority)}`}>{selectedTask.priority}</span>
                  </div>
                </div>

                <div className="detail-field">
                  <div className="detail-field-label">Status</div>
                  <span className={`status-badge ${selectedTask.status}`}>
                    {selectedTask.status === "in-progress" ? "In Progress" : selectedTask.status === "done" ? "Done" : "To Do"}
                  </span>
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

      {/* Create task modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal">
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 6, fontSize: 12, color: "var(--text-muted)", alignItems: "center" }}>
                  <span>Personal</span><span>/</span><span>New task</span>
                </div>
                <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>×</button>
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
                    placeholder="Add a detailed description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Priority</label>
                  <div className="priority-picker">
                    {(["Low", "Medium", "High"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, priority: p })}
                        className={`priority-option ${form.priority === p ? `selected ${p.toLowerCase()}` : ""}`}
                      >
                        <div className={`priority-dot ${p.toLowerCase()}`} />
                        {p}
                      </button>
                    ))}
                  </div>
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
                <button type="submit" className="btn-submit">Create task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task, isSelected, onToggle, onClick, onDelete,
}: {
  task: Task;
  isSelected: boolean;
  onToggle: () => void;
  onClick: () => void;
  onDelete: () => void;
}) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isToday = dueDate
    ? new Date(dueDate.toDateString()).getTime() === new Date(new Date().toDateString()).getTime()
    : false;
  const isTomorrow = dueDate
    ? new Date(dueDate.toDateString()).getTime() === new Date(new Date(Date.now() + 86400000).toDateString()).getTime()
    : false;

  const timeLabel = dueDate
    ? isToday
      ? dueDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : isTomorrow
        ? "Tomorrow"
        : dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <div
      className={`task-row ${task.status === "done" ? "done" : ""}`}
      onClick={onClick}
      style={{ background: isSelected ? "var(--bg-secondary)" : undefined, borderColor: isSelected ? "var(--border)" : undefined }}
    >
      <button
        className={`task-checkbox ${task.status === "done" ? "checked" : ""}`}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      />
      <span className="task-title">{task.title}</span>
      <div className={`priority-dot ${task.priority.toLowerCase()}`} />
      <span className={`priority-label ${task.priority.toLowerCase()}`}>{task.priority}</span>
      <span className="task-time">{timeLabel}</span>
      <button
        className="task-delete-btn"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Delete"
      >✕</button>
    </div>
  );
}
