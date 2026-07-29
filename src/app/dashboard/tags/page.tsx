"use client";

import { useState, useEffect } from "react";
import { Plus, Tag, Trash2, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface TagType {
  id: string;
  name: string;
  color: string;
  _count: { notes: number };
}

const TAG_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#64748b", "#a78bfa",
];

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", color: TAG_COLORS[0] });
  const [saving, setSaving] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    const res = await fetch("/api/tags");
    if (res.ok) setTags(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Tag name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Tag created!");
        setShowForm(false);
        setForm({ name: "", color: TAG_COLORS[0] });
        fetchTags();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create tag");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tag? It will be removed from all notes.")) return;
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Tag deleted");
      setTags((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="max-w-3xl mx-auto fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-emerald-400" />
            Tags
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {tags.length} tag{tags.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="sm:ml-auto flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Tag
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
            <Tag className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-1">No tags yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            Create tags to organize your notes
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all"
          >
            Create Tag
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="glass rounded-2xl p-5 flex flex-col gap-3 group hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: tag.color + "20" }}
                >
                  <Tag className="w-5 h-5" style={{ color: tag.color }} />
                </div>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <p className="font-medium text-white">{tag.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tag._count.notes} note{tag._count.notes !== 1 ? "s" : ""}
                </p>
              </div>
              <div
                className="h-1 rounded-full"
                style={{ backgroundColor: tag.color + "40" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ backgroundColor: tag.color, width: "100%" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tag Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">New Tag</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tag Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Work, Personal, Ideas..."
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm((p) => ({ ...p, color }))}
                      className={cn(
                        "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                        form.color === color ? "border-white scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Preview */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-slate-400">Preview:</span>
                  <span
                    className="text-sm px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: form.color + "20",
                      color: form.color,
                    }}
                  >
                    {form.name || "Tag name"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
