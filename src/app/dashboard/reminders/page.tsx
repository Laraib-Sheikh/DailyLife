"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Bell,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  X,
  Save,
  AlertCircle,
  Clock,
  Flag,
} from "lucide-react";
import toast from "react-hot-toast";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
}

const PRIORITY_CONFIG = {
  HIGH: { label: "High", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  MEDIUM: { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  LOW: { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
  });
  const [saving, setSaving] = useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    const res = await fetch("/api/reminders");
    if (res.ok) setReminders(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const openCreateForm = () => {
    setEditingReminder(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setForm({
      title: "",
      description: "",
      dueDate: tomorrow.toISOString().slice(0, 16),
      priority: "MEDIUM",
    });
    setShowForm(true);
  };

  const openEditForm = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setForm({
      title: reminder.title,
      description: reminder.description || "",
      dueDate: new Date(reminder.dueDate).toISOString().slice(0, 16),
      priority: reminder.priority,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReminder(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.dueDate) {
      toast.error("Due date is required");
      return;
    }
    setSaving(true);
    try {
      const url = editingReminder
        ? `/api/reminders/${editingReminder.id}`
        : "/api/reminders";
      const method = editingReminder ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          dueDate: new Date(form.dueDate).toISOString(),
          priority: form.priority,
        }),
      });
      if (res.ok) {
        toast.success(editingReminder ? "Reminder updated!" : "Reminder created!");
        closeForm();
        fetchReminders();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reminder?")) return;
    const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Reminder deleted");
      setReminders((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    const res = await fetch(`/api/reminders/${reminder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !reminder.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setReminders((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      toast.success(updated.completed ? "Marked complete!" : "Marked incomplete");
    }
  };

  const filteredReminders = reminders.filter((r) => {
    if (filter === "pending") return !r.completed;
    if (filter === "completed") return r.completed;
    return true;
  });

  function getDateLabel(dateStr: string) {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return "Overdue";
    return format(date, "MMM d, yyyy");
  }

  function getDateStyle(dateStr: string, completed: boolean) {
    if (completed) return "text-slate-500";
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return "text-red-400";
    if (isToday(date)) return "text-amber-400";
    if (isTomorrow(date)) return "text-blue-400";
    return "text-slate-400";
  }

  const pendingCount = reminders.filter((r) => !r.completed).length;
  const overdueCount = reminders.filter(
    (r) => !r.completed && isPast(new Date(r.dueDate)) && !isToday(new Date(r.dueDate))
  ).length;

  return (
    <div className="max-w-3xl mx-auto fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            Reminders
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-slate-400">{pendingCount} pending</span>
            {overdueCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {overdueCount} overdue
              </span>
            )}
          </div>
        </div>
        <button
          onClick={openCreateForm}
          className="sm:ml-auto flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Reminder
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl mb-6 w-fit">
        {(["pending", "all", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              filter === f
                ? "bg-slate-700 text-white shadow"
                : "text-slate-400 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 h-20 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-700/60 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
            <Bell className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-1">
            {filter === "completed" ? "No completed reminders" : "No reminders"}
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            {filter === "pending" ? "All caught up! Add a new reminder." : ""}
          </p>
          {filter !== "completed" && (
            <button
              onClick={openCreateForm}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-all"
            >
              Create Reminder
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((reminder) => {
            const priority = PRIORITY_CONFIG[reminder.priority];
            const dateLabel = getDateLabel(reminder.dueDate);
            const dateStyle = getDateStyle(reminder.dueDate, reminder.completed);

            return (
              <div
                key={reminder.id}
                className={cn(
                  "glass rounded-2xl p-5 flex items-start gap-4 group transition-all hover:border-slate-600",
                  reminder.completed && "opacity-60"
                )}
              >
                <button
                  onClick={() => handleToggleComplete(reminder)}
                  className="mt-0.5 flex-shrink-0 transition-colors"
                >
                  {reminder.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium text-white",
                      reminder.completed && "line-through text-slate-500"
                    )}
                  >
                    {reminder.title}
                  </p>
                  {reminder.description && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {reminder.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={cn("text-xs flex items-center gap-1", dateStyle)}>
                      {dateLabel === "Overdue" ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {dateLabel} · {format(new Date(reminder.dueDate), "h:mm a")}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1",
                        priority.color,
                        priority.bg,
                        priority.border
                      )}
                    >
                      <Flag className="w-3 h-3" />
                      {priority.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditForm(reminder)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-indigo-400 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reminder Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeForm}
          />
          <div className="relative w-full max-w-lg glass rounded-2xl shadow-2xl fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">
                {editingReminder ? "Edit Reminder" : "New Reminder"}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Reminder title..."
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                <div className="flex gap-2">
                  {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    return (
                      <button
                        key={p}
                        onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                          form.priority === p
                            ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                            : "bg-slate-800/60 text-slate-400 border-slate-600 hover:border-slate-500"
                        )}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingReminder ? "Save Changes" : "Create Reminder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
