"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface TagType { id: string; name: string; color: string; }
interface Note {
  id: string; title: string; content: string; color: string;
  pinned: boolean; updatedAt: string; tags: { tag: TagType }[];
}

const cardBase: React.CSSProperties = {
  backgroundColor: "rgba(30,41,59,0.7)",
  backdropFilter: "blur(20px)",
  border: "2px solid #ffffff",
  transition: "all 0.2s",
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: "", content: "", color: "#1e293b", tagIds: [] as string[] });
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => { fetchTags(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchNotes, 300);
    return () => clearTimeout(t);
  }, [fetchNotes]);

  useEffect(() => {
    if (showForm) setTimeout(() => titleRef.current?.focus(), 50);
  }, [showForm]);

  const openCreate = () => {
    setEditingNote(null);
    setForm({ title: "", content: "", color: "#1e293b", tagIds: [] });
    setShowForm(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, color: note.color, tagIds: note.tags.map((t) => t.tag.id) });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("TITLE REQUIRED"); return; }
    setSaving(true);
    try {
      const url = editingNote ? `/api/notes/${editingNote.id}` : "/api/notes";
      const res = await fetch(url, {
        method: editingNote ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editingNote ? "NOTE UPDATED" : "NOTE SAVED");
        setShowForm(false);
        fetchNotes();
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("NOTE DELETED"); setNotes((p) => p.filter((n) => n.id !== id)); }
  };

  const handlePin = async (note: Note) => {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !note.pinned }),
    });
    if (res.ok) fetchNotes();
  };

  const allLabels = ["All", ...tags.map((t) => t.name)];
  const visibleNotes = activeFilter === "All"
    ? notes
    : notes.filter((n) => n.tags.some((t) => t.tag.name === activeFilter));
  const pinnedNotes = visibleNotes.filter((n) => n.pinned);
  const unpinnedNotes = visibleNotes.filter((n) => !n.pinned);

  return (
    <div className="fade-in" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Ambient */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "50vw", height: "300px", background: "rgba(217,70,239,0.07)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #ffffff", paddingBottom: "16px", marginBottom: "32px", position: "relative", zIndex: 1 }}>
        <div>
          <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.02em", color: "#dae2fd", textTransform: "uppercase" }}>
            All Notes
          </h1>
          <p style={{ fontFamily: "Inter", fontSize: "16px", color: "#908fa0", marginTop: "4px" }}>
            {notes.length} note{notes.length !== 1 ? "s" : ""} in your system
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "rgba(34,42,61,0.8)", border: "2px solid rgba(255,255,255,0.3)" }}>
            <span className="material-symbols-outlined" style={{ color: "#34D399", fontSize: "16px" }}>search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH NOTES..."
              style={{ background: "none", border: "none", outline: "none", color: "#dae2fd", fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.05em", width: "140px" }}
            />
          </div>
          {/* New Note */}
          <button
            onClick={openCreate}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "#D946EF", color: "#ffffff",
              border: "2px solid #ffffff", padding: "10px 20px",
              fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 0 #34D399"; (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
            New Note
          </button>
        </div>
      </div>

      {/* Quick create card */}
      <div style={{ ...cardBase, padding: "24px", marginBottom: "32px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            placeholder="QUICK NOTE TITLE..."
            style={{ background: "transparent", border: "none", outline: "none", fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "22px", color: "#dae2fd", letterSpacing: "-0.01em" }}
            onFocus={openCreate}
            readOnly
          />
          <textarea
            placeholder="Start typing your thought..."
            readOnly
            rows={2}
            style={{ background: "transparent", border: "none", outline: "none", fontFamily: "Inter", fontSize: "16px", color: "#908fa0", resize: "none", cursor: "text" }}
            onFocus={openCreate}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              {["format_bold", "format_list_bulleted", "label"].map((icon) => (
                <button
                  key={icon}
                  onClick={openCreate}
                  style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)", background: "none", cursor: "pointer", color: "#c7c4d7", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#34D399"; (e.currentTarget as HTMLElement).style.borderColor = "#34D399"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#c7c4d7"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{icon}</span>
                </button>
              ))}
            </div>
            <button
              onClick={openCreate}
              style={{
                padding: "8px 20px", border: "2px solid #34D399", background: "transparent",
                color: "#34D399", fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.08em",
                textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#34D399"; (e.currentTarget as HTMLElement).style.color = "#0b1326"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#34D399"; }}
            >
              Save Note
            </button>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div style={{ display: "flex", gap: "24px", borderBottom: "2px solid rgba(255,255,255,0.1)", marginBottom: "24px", overflowX: "auto", paddingBottom: "12px", position: "relative", zIndex: 1 }}>
        {allLabels.map((label) => (
          <button
            key={label}
            onClick={() => setActiveFilter(label)}
            style={{
              fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: 500, letterSpacing: "0.08em",
              textTransform: "uppercase", background: "none", border: "none", cursor: "pointer",
              paddingBottom: "8px", whiteSpace: "nowrap", transition: "color 0.15s",
              color: activeFilter === label ? "#34D399" : "#908fa0",
              borderBottom: activeFilter === label ? "4px solid #34D399" : "4px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notes grid */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ ...cardBase, height: "180px", opacity: 0.5 }} />
            ))}
          </div>
        ) : visibleNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#2d3449", display: "block", marginBottom: "16px" }}>note_stack</span>
            <p style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#464554", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {search ? "No notes match your search" : "No notes yet — create your first one"}
            </p>
            <button
              onClick={openCreate}
              style={{ marginTop: "20px", padding: "12px 24px", backgroundColor: "#D946EF", color: "#fff", border: "2px solid #fff", fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
            >
              + New Note
            </button>
          </div>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#D946EF" }}>push_pin</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#908fa0", letterSpacing: "0.1em", textTransform: "uppercase" }}>Pinned</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {pinnedNotes.map((note) => (
                    <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={handleDelete} onPin={handlePin} />
                  ))}
                </div>
              </div>
            )}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#908fa0", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "16px" }}>Other Notes</span>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {unpinnedNotes.map((note) => (
                    <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={handleDelete} onPin={handlePin} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Note Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowForm(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: "640px", backgroundColor: "#131b2e", border: "2px solid #ffffff", boxShadow: "8px 8px 0 0 #D946EF" }} className="fade-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
              <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "20px", color: "#dae2fd" }}>
                {editingNote ? "Edit Note" : "New Note"}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#908fa0", display: "flex" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <input
                ref={titleRef}
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Note title..."
                style={{
                  width: "100%", background: "transparent", border: "none",
                  borderBottom: "2px solid rgba(255,255,255,0.3)", paddingBottom: "8px",
                  color: "#dae2fd", fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "22px",
                  outline: "none", letterSpacing: "-0.01em",
                }}
                onFocus={(e) => { (e.target as HTMLElement).style.borderBottomColor = "#D946EF"; }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderBottomColor = "rgba(255,255,255,0.3)"; }}
              />

              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write your note here..."
                rows={8}
                style={{
                  width: "100%", background: "rgba(6,14,32,0.5)",
                  border: "2px solid rgba(255,255,255,0.1)", padding: "16px",
                  color: "#dae2fd", fontFamily: "Inter", fontSize: "16px",
                  outline: "none", resize: "vertical", lineHeight: 1.6,
                }}
                onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(217,70,239,0.5)"; }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              />

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#908fa0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
                    Tags
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {tags.map((tag) => {
                      const selected = form.tagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => setForm((p) => ({ ...p, tagIds: selected ? p.tagIds.filter((id) => id !== tag.id) : [...p.tagIds, tag.id] }))}
                          style={{
                            padding: "4px 12px",
                            border: `2px solid ${selected ? tag.color : "rgba(255,255,255,0.2)"}`,
                            backgroundColor: selected ? `${tag.color}20` : "transparent",
                            color: selected ? tag.color : "#908fa0",
                            fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.05em",
                            textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 24px", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: "10px 20px", background: "none", border: "2px solid rgba(255,255,255,0.2)", color: "#908fa0", fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px",
                  backgroundColor: "#34D399", color: "#0b1326",
                  border: "2px solid #ffffff",
                  fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
                  boxShadow: "4px 4px 0 0 #D946EF", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { if (!saving) { (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "6px 6px 0 0 #D946EF"; } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 0 #D946EF"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>save</span>
                {editingNote ? "Save Changes" : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`input::placeholder, textarea::placeholder { color: #464554; }`}</style>
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete, onPin }: { note: Note; onEdit: (n: Note) => void; onDelete: (id: string) => void; onPin: (n: Note) => void; }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "rgba(30,41,59,0.7)",
        backdropFilter: "blur(20px)",
        border: `2px solid ${note.pinned ? "#34D399" : "#ffffff"}`,
        padding: "24px",
        display: "flex", flexDirection: "column", gap: "16px",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? (note.pinned ? "0 0 20px rgba(52,211,153,0.3)" : "0 8px 24px rgba(0,0,0,0.3)") : "none",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {note.pinned && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #34D399, #D946EF)" }} />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c7c4d7", backgroundColor: "#1f2937", padding: "3px 8px", border: "1px solid rgba(255,255,255,0.15)" }}>
          {note.tags[0]?.tag.name ?? "Note"}
        </div>
        <div style={{ display: "flex", gap: "4px", opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
          <button
            onClick={() => onPin(note)}
            title={note.pinned ? "Unpin" : "Pin"}
            style={{ background: "none", border: "none", cursor: "pointer", color: note.pinned ? "#34D399" : "#c7c4d7", display: "flex", padding: "2px", transition: "color 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#D946EF"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = note.pinned ? "#34D399" : "#c7c4d7"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: note.pinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
          </button>
          <button
            onClick={() => onEdit(note)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#c7c4d7", display: "flex", padding: "2px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#34D399"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#c7c4d7"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "18px", color: "#dae2fd", marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {note.title}
        </h3>
        <p style={{ fontFamily: "Inter", fontSize: "14px", color: "#908fa0", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {note.content || "No content"}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
        <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#464554", letterSpacing: "0.05em" }}>
          {format(new Date(note.updatedAt), "MMM d").toUpperCase()}
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          {note.tags.slice(0, 2).map(({ tag }) => (
            <span key={tag.id} style={{ fontFamily: "JetBrains Mono", fontSize: "10px", padding: "2px 6px", border: `1px solid ${tag.color}40`, color: tag.color }}>
              {tag.name}
            </span>
          ))}
          <button
            onClick={() => onDelete(note.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#464554", display: "flex", padding: "2px", transition: "color 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffb4ab"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#464554"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
          </button>
        </div>
        {note.pinned && (
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34D399", animation: "pulseGlow 2s infinite" }} />
        )}
      </div>
    </div>
  );
}
