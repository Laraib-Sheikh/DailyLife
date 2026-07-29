"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface TagType { id: string; name: string; color: string; _count: { notes: number }; }

const TAG_COLORS = ["#D946EF","#34D399","#c0c1ff","#ffb4ab","#4338CA","#eab308","#06b6d4","#f97316","#14b8a6","#8b5cf6","#64748b","#4edea3"];

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

  useEffect(() => { fetchTags(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("TAG NAME REQUIRED"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { toast.success("TAG CREATED"); setShowForm(false); setForm({ name: "", color: TAG_COLORS[0] }); fetchTags(); }
      else { const err = await res.json(); toast.error(err.error?.toUpperCase() || "FAILED"); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("TAG DELETED"); setTags((p) => p.filter((t) => t.id !== id)); }
  };

  const cardBase: React.CSSProperties = {
    backgroundColor: "rgba(30,41,59,0.7)",
    backdropFilter: "blur(20px)",
    border: "2px solid #ffffff",
    padding: "24px",
    transition: "all 0.2s",
  };

  return (
    <div className="fade-in" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #ffffff", paddingBottom: "16px", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(32px,5vw,48px)", letterSpacing: "-0.02em", color: "#dae2fd", textTransform: "uppercase" }}>
            Tags
          </h1>
          <p style={{ fontFamily: "Inter", fontSize: "16px", color: "#908fa0", marginTop: "4px" }}>
            {tags.length} tag{tags.length !== 1 ? "s" : ""} — organize your notes
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            backgroundColor: "#34D399", color: "#0b1326",
            border: "2px solid #ffffff", padding: "10px 20px",
            fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 0 #D946EF"; (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
          New Tag
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ ...cardBase, height: "120px", opacity: 0.5 }} />)}
        </div>
      ) : tags.length === 0 ? (
        <div style={{ ...cardBase, padding: "80px", textAlign: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#2d3449", display: "block", marginBottom: "12px" }}>sell</span>
          <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#464554", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>No tags yet</p>
          <button onClick={() => setShowForm(true)} style={{ padding: "12px 24px", backgroundColor: "#34D399", color: "#0b1326", border: "2px solid #fff", fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
            Create First Tag
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {tags.map((tag) => (
            <div
              key={tag.id}
              style={{ ...cardBase, position: "relative", overflow: "hidden" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 0 0 ${tag.color}`; (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: tag.color }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", backgroundColor: `${tag.color}20`, border: `2px solid ${tag.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: tag.color }}>sell</span>
                </div>
                <button
                  onClick={() => handleDelete(tag.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#464554", display: "flex", padding: "2px", transition: "color 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffb4ab"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#464554"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                </button>
              </div>

              <div style={{ marginTop: "16px" }}>
                <p style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "18px", color: "#dae2fd" }}>{tag.name}</p>
                <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#908fa0", letterSpacing: "0.05em", marginTop: "4px" }}>
                  {tag._count.notes} note{tag._count.notes !== 1 ? "s" : ""}
                </p>
              </div>

              <div style={{ height: "4px", backgroundColor: `${tag.color}20`, marginTop: "16px", position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100%", backgroundColor: tag.color, opacity: 0.6 }} />
              </div>

              <span
                style={{
                  display: "inline-block", marginTop: "12px", padding: "3px 10px",
                  backgroundColor: `${tag.color}15`, border: `1px solid ${tag.color}40`,
                  fontFamily: "JetBrains Mono", fontSize: "11px", color: tag.color, letterSpacing: "0.05em",
                }}
              >
                {tag.name.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Create Tag Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowForm(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: "440px", backgroundColor: "#131b2e", border: "2px solid #ffffff", boxShadow: "8px 8px 0 0 #34D399" }} className="fade-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
              <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "20px", color: "#dae2fd" }}>New Tag</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#908fa0", display: "flex" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#908fa0" }}>Tag Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Work, Personal, Ideas..."
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: "2px solid rgba(255,255,255,0.3)", paddingBottom: "8px", color: "#dae2fd", fontFamily: "Inter", fontSize: "16px", outline: "none" }}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderBottomColor = "#34D399"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderBottomColor = "rgba(255,255,255,0.3)"; }}
                />
              </div>

              <div>
                <label style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#908fa0", display: "block", marginBottom: "12px" }}>Color</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm((p) => ({ ...p, color }))}
                      style={{
                        width: "32px", height: "32px", backgroundColor: color,
                        border: form.color === color ? "3px solid #ffffff" : "2px solid transparent",
                        cursor: "pointer", transform: form.color === color ? "scale(1.15)" : "scale(1)",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </div>

                {/* Preview */}
                <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#908fa0" }}>Preview:</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", padding: "3px 10px", backgroundColor: `${form.color}20`, border: `1px solid ${form.color}`, color: form.color, letterSpacing: "0.05em" }}>
                    {form.name || "TAG NAME"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 24px", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: "none", border: "2px solid rgba(255,255,255,0.2)", color: "#908fa0", fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#34D399", color: "#0b1326", border: "2px solid #ffffff", boxShadow: "4px 4px 0 0 #D946EF", fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 0.2s" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>sell</span>
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`input::placeholder { color: #464554; }`}</style>
    </div>
  );
}
