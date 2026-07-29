"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  X,
  Tag,
  Palette,
  NotebookPen,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TagType {
  id: string;
  name: string;
  color: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  updatedAt: string;
  tags: { tag: TagType }[];
}

const NOTE_COLORS = [
  "#1e293b", "#1e1e2e", "#0f1f0f", "#1f0f0f",
  "#0f0f1f", "#1f1a0f", "#0f1f1a", "#1a0f1f",
];

const COLOR_LABELS = [
  "Slate", "Dark", "Forest", "Ruby",
  "Navy", "Amber", "Teal", "Grape",
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    color: NOTE_COLORS[0],
    tagIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedTag) params.set("tagId", selectedTag);
    const res = await fetch(`/api/notes?${params}`);
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  }, [search, selectedTag]);

  const fetchTags = async () => {
    const res = await fetch("/api/tags");
    if (res.ok) setTags(await res.json());
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchNotes, 300);
    return () => clearTimeout(timeout);
  }, [fetchNotes]);

  const openCreateForm = () => {
    setEditingNote(null);
    setForm({ title: "", content: "", color: NOTE_COLORS[0], tagIds: [] });
    setShowForm(true);
  };

  const openEditForm = (note: Note) => {
    setEditingNote(note);
    setForm({
      title: note.title,
      content: note.content,
      color: note.color,
      tagIds: note.tags.map((t) => t.tag.id),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const url = editingNote ? `/api/notes/${editingNote.id}` : "/api/notes";
      const method = editingNote ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editingNote ? "Note updated!" : "Note created!");
        closeForm();
        fetchNotes();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save note");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Note deleted");
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleTogglePin = async (note: Note) => {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !note.pinned }),
    });
    if (res.ok) fetchNotes();
  };

  const toggleTagInForm = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const pinnedNotes = notes.filter((n) => n.pinned);
  const unpinnedNotes = notes.filter((n) => !n.pinned);

  return (
    <div className="max-w-6xl mx-auto fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <NotebookPen className="w-6 h-6 text-indigo-400" />
            My Notes
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedTag("")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              selectedTag === ""
                ? "bg-indigo-600 text-white"
                : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-600"
            )}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(selectedTag === tag.id ? "" : tag.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                selectedTag === tag.id ? "opacity-100" : "opacity-70 hover:opacity-100"
              )}
              style={{
                backgroundColor: selectedTag === tag.id ? tag.color + "30" : "transparent",
                borderColor: tag.color + "60",
                color: tag.color,
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 h-40 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-700/60 rounded w-full mb-2" />
              <div className="h-3 bg-slate-700/60 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
            <NotebookPen className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-1">No notes found</h3>
          <p className="text-slate-500 text-sm mb-4">
            {search ? "Try a different search term" : "Create your first note to get started"}
          </p>
          {!search && (
            <button
              onClick={openCreateForm}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all"
            >
              Create Note
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Pinned */}
          {pinnedNotes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" />
                Pinned
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Others */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Others
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Note Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeForm}
          />
          <div className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">
                {editingNote ? "Edit Note" : "New Note"}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Note title..."
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium"
              />

              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write your note here..."
                rows={8}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
              />

              {/* Color Picker */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <Palette className="w-4 h-4" />
                  Note Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {NOTE_COLORS.map((color, i) => (
                    <button
                      key={color}
                      title={COLOR_LABELS[i]}
                      onClick={() => setForm((p) => ({ ...p, color }))}
                      className={cn(
                        "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                        form.color === color
                          ? "border-indigo-400 scale-110"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTagInForm(tag.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          form.tagIds.includes(tag.id) ? "opacity-100" : "opacity-50 hover:opacity-80"
                        )}
                        style={{
                          backgroundColor: form.tagIds.includes(tag.id) ? tag.color + "30" : "transparent",
                          borderColor: tag.color,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingNote ? "Save Changes" : "Create Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (n: Note) => void;
}) {
  return (
    <div
      className="note-card glass rounded-2xl p-5 flex flex-col gap-3 border border-slate-700/50 hover:border-indigo-500/30 transition-all cursor-pointer group"
      style={{ borderLeftColor: note.color !== "#1e293b" ? note.color : undefined, borderLeftWidth: note.color !== "#1e293b" ? "3px" : undefined }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 flex-1">
          {note.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onTogglePin(note)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-all"
            title={note.pinned ? "Unpin" : "Pin"}
          >
            {note.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-indigo-400 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
        {note.content || "No content"}
      </p>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/30">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map(({ tag }) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: tag.color + "20", color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        <span className="text-xs text-slate-600 flex-shrink-0">
          {format(new Date(note.updatedAt), "MMM d")}
        </span>
      </div>
    </div>
  );
}
