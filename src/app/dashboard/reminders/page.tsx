"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { format, isPast, isToday, isTomorrow } from "date-fns";

interface Reminder {
  id: string; title: string; description?: string;
  dueDate: string; completed: boolean; priority: "LOW" | "MEDIUM" | "HIGH";
}

const PRIORITY = {
  HIGH: { label: "HIGH PRIORITY", color: "#ffb4ab", bg: "rgba(255,180,171,0.1)", border: "#ffb4ab40" },
  MEDIUM: { label: "MEDIUM PRIORITY", color: "#D946EF", bg: "rgba(217,70,239,0.1)", border: "#D946EF40" },
  LOW: { label: "LOW PRIORITY", color: "#34D399", bg: "rgba(52,211,153,0.1)", border: "#34D39940" },
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "upcoming" | "completed">("today");
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "MEDIUM" as "LOW"|"MEDIUM"|"HIGH" });
  const [saving, setSaving] = useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    const res = await fetch("/api/reminders");
    if (res.ok) setReminders(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchReminders(); }, []);

  const openCreate = () => {
    setEditingReminder(null);
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0);
    setForm({ title: "", description: "", dueDate: d.toISOString().slice(0, 16), priority: "MEDIUM" });
    setShowForm(true);
  };

  const openEdit = (r: Reminder) => {
    setEditingReminder(r);
    setForm({ title: r.title, description: r.description || "", dueDate: new Date(r.dueDate).toISOString().slice(0, 16), priority: r.priority });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.dueDate) { toast.error("TITLE & DATE REQUIRED"); return; }
    setSaving(true);
    try {
      const url = editingReminder ? `/api/reminders/${editingReminder.id}` : "/api/reminders";
      const res = await fetch(url, {
        method: editingReminder ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dueDate: new Date(form.dueDate).toISOString() }),
      });
      if (res.ok) { toast.success(editingReminder ? "REMINDER UPDATED" : "REMINDER SET"); setShowForm(false); fetchReminders(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reminder?")) return;
    const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("REMINDER DELETED"); setReminders((p) => p.filter((r) => r.id !== id)); }
  };

  const handleToggle = async (r: Reminder) => {
    const res = await fetch(`/api/reminders/${r.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !r.completed }),
    });
    if (res.ok) { const updated = await res.json(); setReminders((p) => p.map((x) => x.id === updated.id ? updated : x)); }
  };

  const todayItems = reminders.filter((r) => !r.completed && isToday(new Date(r.dueDate)));
  const upcomingItems = reminders.filter((r) => !r.completed && !isToday(new Date(r.dueDate)));
  const completedItems = reminders.filter((r) => r.completed);
  const overdueCount = upcomingItems.filter((r) => isPast(new Date(r.dueDate))).length;

  const displayList = filter === "today" ? todayItems : filter === "upcoming" ? upcomingItems : completedItems;

  function getDateLabel(d: Date) {
    if (isPast(d) && !isToday(d)) return { label: "OVERDUE", color: "#ffb4ab" };
    if (isToday(d)) return { label: "TODAY", color: "#34D399" };
    if (isTomorrow(d)) return { label: "TOMORROW", color: "#D946EF" };
    return { label: format(d, "MMM d").toUpperCase(), color: "#c7c4d7" };
  }

  const cardBase: React.CSSProperties = {
    backgroundColor: "rgba(30,41,59,0.7)",
    backdropFilter: "blur(20px)",
    border: "2px solid #ffffff",
    transition: "all 0.2s",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "transparent", border: "none",
    borderBottom: "2px solid rgba(255,255,255,0.3)", paddingBottom: "8px",
    color: "#dae2fd", fontFamily: "Inter", fontSize: "16px", outline: "none",
  };

  return (
    <div className="fade-in" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Ambient */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "40vw", height: "300px", background: "rgba(52,211,153,0.06)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", position: "relative", zIndex: 1 }}>
        <div>
          <h1
            style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(32px,5vw,48px)", letterSpacing: "-0.02em", color: "#dae2fd", textTransform: "uppercase", textShadow: "4px 4px 0 #D946EF" }}
          >
            Reminders
          </h1>
          <p style={{ fontFamily: "Inter", fontSize: "16px", color: "#908fa0", marginTop: "4px" }}>
            Keep track of your time. Precision scheduling.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={openCreate}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "#D946EF", color: "#ffffff",
              border: "2px solid #ffffff", padding: "10px 20px",
              fontFamily: "JetBrains Mono", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 0 #34D399"; (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
            New Reminder
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0", borderBottom: "2px solid #ffffff", marginBottom: "32px", overflowX: "auto", position: "relative", zIndex: 1 }}>
        {([
          ["today", `Today (${todayItems.length})`],
          ["upcoming", `Upcoming (${upcomingItems.length})`],
          ["completed", `Completed (${completedItems.length})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "12px 24px", background: "none",
              border: "none", borderBottom: filter === key ? "4px solid #34D399" : "4px solid transparent",
              cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
              color: filter === key ? "#34D399" : "#908fa0",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }} className="reminders-grid">
        <style>{`.reminders-grid { @media (max-width: 1024px) { grid-template-columns: 1fr !important; } }`}</style>

        {/* Left — Reminder list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} style={{ ...cardBase, height: "100px", opacity: 0.5 }} />)
          ) : displayList.length === 0 ? (
            <div style={{ ...cardBase, padding: "60px", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#2d3449", display: "block", marginBottom: "12px" }}>notifications_none</span>
              <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#464554", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {filter === "today" ? "No reminders for today" : filter === "completed" ? "No completed reminders" : "No upcoming reminders"}
              </p>
            </div>
          ) : (
            displayList.map((r) => {
              const { label, color } = getDateLabel(new Date(r.dueDate));
              const p = PRIORITY[r.priority];
              return (
                <div
                  key={r.id}
                  style={{
                    ...cardBase,
                    padding: "24px",
                    position: "relative",
                    opacity: r.completed ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "8px 8px 0 0 #34D399"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  {/* Priority sidebar */}
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "4px", backgroundColor: p.color }} />

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", paddingLeft: "8px" }}>
                    <div style={{ display: "flex", gap: "16px", flex: 1 }}>
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(r)}
                        style={{
                          width: "28px", height: "28px", borderRadius: "50%",
                          border: `2px solid ${r.completed ? "#34D399" : "#464554"}`,
                          background: r.completed ? "rgba(52,211,153,0.2)" : "none",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, marginTop: "2px", transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!r.completed) (e.currentTarget as HTMLElement).style.borderColor = "#34D399"; }}
                        onMouseLeave={(e) => { if (!r.completed) (e.currentTarget as HTMLElement).style.borderColor = "#464554"; }}
                      >
                        {r.completed && <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#34D399" }}>check</span>}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
                          <h3 style={{
                            fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "18px", color: "#dae2fd",
                            textDecoration: r.completed ? "line-through" : "none",
                          }}>
                            {r.title}
                          </h3>
                          <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", padding: "3px 8px", border: `1px solid ${p.border}`, color: p.color, backgroundColor: p.bg, letterSpacing: "0.08em" }}>
                            {p.label}
                          </span>
                        </div>
                        {r.description && (
                          <p style={{ fontFamily: "Inter", fontSize: "14px", color: "#908fa0", marginBottom: "10px" }}>{r.description}</p>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px", color }}>schedule</span>
                            <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color, letterSpacing: "0.05em" }}>
                              {label}, {format(new Date(r.dueDate), "h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                      <button
                        onClick={() => openEdit(r)}
                        style={{ padding: "6px", background: "#171f33", border: "2px solid transparent", cursor: "pointer", color: "#c7c4d7", display: "flex", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#ffffff"; (e.currentTarget as HTMLElement).style.color = "#34D399"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#c7c4d7"; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{ padding: "6px", background: "#171f33", border: "2px solid transparent", cursor: "pointer", color: "#c7c4d7", display: "flex", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#ffb4ab"; (e.currentTarget as HTMLElement).style.color = "#ffb4ab"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#c7c4d7"; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right — Quick Add + Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
          {/* Quick Add */}
          <div style={{ ...cardBase, padding: "24px" }}>
            <h4 style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#908fa0", borderBottom: "2px solid rgba(255,255,255,0.1)", paddingBottom: "12px", marginBottom: "20px" }}>
              Quick Add
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input
                placeholder="What needs to be done?"
                style={{ ...inputStyle, fontFamily: "Inter", fontSize: "16px" }}
                onFocus={openCreate}
                readOnly
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                {["Today", "Tmrw", "📅"].map((label) => (
                  <button
                    key={label}
                    onClick={openCreate}
                    style={{
                      flex: 1, padding: "8px 4px", border: "2px solid rgba(255,255,255,0.2)",
                      background: "none", color: "#908fa0", fontFamily: "JetBrains Mono", fontSize: "11px",
                      letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#34D399"; (e.currentTarget as HTMLElement).style.color = "#34D399"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget as HTMLElement).style.color = "#908fa0"; }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={openCreate}
                style={{
                  width: "100%", padding: "12px", marginTop: "4px",
                  backgroundColor: "#4338CA", border: "2px solid #ffffff",
                  color: "#ffffff", fontFamily: "JetBrains Mono", fontSize: "11px",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 0 #34D399"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>add_alarm</span>
                Save Reminder
              </button>
            </div>
          </div>

          {/* Productivity Pulse */}
          <div style={{ backgroundColor: "#222a3d", border: "2px solid #ffffff", padding: "24px", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", right: "-32px", top: "-32px", width: "128px", height: "128px", backgroundColor: "#34D399", filter: "blur(48px)", opacity: 0.2, borderRadius: "50%" }} />
            <h4 style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#dae2fd", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "#34D399", fontSize: "16px" }}>insights</span>
              Productivity Pulse
            </h4>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px", marginBottom: "16px" }}>
              {[30, 50, 80, 40, 20, 65, 90].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    backgroundColor: i === 6 ? "#34D399" : "#2d3449",
                    height: `${h}%`,
                    border: i === 6 ? "2px solid #ffffff" : "none",
                    position: "relative",
                    cursor: "help",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => { if (i !== 6) (e.currentTarget as HTMLElement).style.backgroundColor = "#D946EF"; }}
                  onMouseLeave={(e) => { if (i !== 6) (e.currentTarget as HTMLElement).style.backgroundColor = "#2d3449"; }}
                  title={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid rgba(255,255,255,0.1)", paddingTop: "12px" }}>
              <span style={{ fontFamily: "Inter", fontSize: "14px", color: "#908fa0" }}>Tasks Completed</span>
              <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "28px", color: "#dae2fd" }}>
                {completedItems.length}
              </span>
            </div>
          </div>

          {/* Overdue alert */}
          {overdueCount > 0 && (
            <div style={{ ...cardBase, padding: "16px", borderColor: "#ffb4ab", backgroundColor: "rgba(255,180,171,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#ffb4ab", fontSize: "20px" }}>crisis_alert</span>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#ffb4ab", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {overdueCount} Overdue
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowForm(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: "520px", backgroundColor: "#131b2e", border: "2px solid #ffffff", boxShadow: "8px 8px 0 0 #34D399" }} className="fade-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
              <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "20px", color: "#dae2fd" }}>
                {editingReminder ? "Edit Reminder" : "New Reminder"}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#908fa0", display: "flex" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#908fa0" }}>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Reminder title..."
                  style={{ ...inputStyle }}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderBottomColor = "#34D399"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderBottomColor = "rgba(255,255,255,0.3)"; }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#908fa0" }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={3}
                  style={{ width: "100%", background: "rgba(6,14,32,0.5)", border: "2px solid rgba(255,255,255,0.1)", padding: "12px", color: "#dae2fd", fontFamily: "Inter", fontSize: "14px", outline: "none", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#908fa0" }}>Due Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#908fa0" }}>Priority</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["LOW","MEDIUM","HIGH"] as const).map((p) => {
                    const cfg = PRIORITY[p];
                    const selected = form.priority === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                        style={{
                          flex: 1, padding: "10px 4px",
                          border: `2px solid ${selected ? cfg.color : "rgba(255,255,255,0.2)"}`,
                          backgroundColor: selected ? cfg.bg : "transparent",
                          color: selected ? cfg.color : "#908fa0",
                          fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 24px", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: "none", border: "2px solid rgba(255,255,255,0.2)", color: "#908fa0", fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px",
                  backgroundColor: "#34D399", color: "#0b1326",
                  border: "2px solid #ffffff", boxShadow: "4px 4px 0 0 #D946EF",
                  fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 0.2s",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>add_alarm</span>
                {editingReminder ? "Save Changes" : "Set Reminder"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`input::placeholder, textarea::placeholder { color: #464554; } input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }`}</style>
    </div>
  );
}
