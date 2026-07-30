import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, isToday, isTomorrow, isPast } from "date-fns";

type TagType = { id: string; name: string; color: string };
type NoteWithTags = {
  id: string; title: string; content: string; color: string;
  pinned: boolean; updatedAt: Date;
  tags: { tag: TagType }[];
};
type ReminderType = {
  id: string; title: string; dueDate: Date;
  completed: boolean; priority: string;
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [notesCount, remindersCount, tagsCount, recentNotes, upcomingReminders] =
    await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.reminder.count({ where: { userId, completed: false } }),
      prisma.tag.count({ where: { userId } }),
      prisma.note.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { tags: { include: { tag: true } } },
      }),
      prisma.reminder.findMany({
        where: { userId, completed: false },
        orderBy: { dueDate: "asc" },
        take: 6,
      }),
    ]);

  const overdueCount = upcomingReminders.filter(
    (r: ReminderType) => isPast(new Date(r.dueDate)) && !isToday(new Date(r.dueDate))
  ).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  function getReminderLabel(dueDate: Date) {
    if (isPast(dueDate) && !isToday(dueDate)) return { label: "OVERDUE", color: "#ffb4ab" };
    if (isToday(dueDate)) return { label: "TODAY", color: "#34D399" };
    if (isTomorrow(dueDate)) return { label: "TOMORROW", color: "#D946EF" };
    return { label: format(dueDate, "MMM d").toUpperCase(), color: "#c7c4d7" };
  }

  const cardStyle = {
    backgroundColor: "rgba(30,41,59,0.7)",
    backdropFilter: "blur(20px)",
    border: "2px solid #ffffff",
    padding: "24px",
    transition: "all 0.2s",
  } as React.CSSProperties;

  const statColors = ["#D946EF", "#34D399", "#ffb4ab", "#c0c1ff"];

  return (
    <div className="fade-in" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <style>{`
        .stat-card:hover { transform: translate(-2px,-2px); }
        .stat-card-purple:hover  { box-shadow: 4px 4px 0 0 #D946EF; }
        .stat-card-green:hover   { box-shadow: 4px 4px 0 0 #34D399; }
        .stat-card-red:hover     { box-shadow: 4px 4px 0 0 #ffb4ab; }
        .stat-card-indigo:hover  { box-shadow: 4px 4px 0 0 #c0c1ff; }
        .note-row:hover  { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.03); }
        .reminder-row-purple:hover { border-color: #D946EF !important; }
        .reminder-row-green:hover  { border-color: #34D399 !important; }
        .reminder-row-red:hover    { border-color: #ffb4ab !important; }
        .reminder-row-indigo:hover { border-color: #c7c4d7 !important; }
        .add-reminder-btn:hover { border-color: #34D399 !important; color: #34D399 !important; }
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Page header */}
      <div style={{ borderBottom: "2px solid #ffffff", paddingBottom: "16px", marginBottom: "32px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "50vw", height: "300px", background: "rgba(217,70,239,0.08)", filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />
        <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.02em", color: "#dae2fd", textTransform: "uppercase", position: "relative" }}>
          Dashboard
        </h1>
        <p style={{ fontFamily: "Inter", fontSize: "18px", color: "#908fa0", marginTop: "4px", position: "relative" }}>
          {greeting}, {session.user.name?.split(" ")[0] ?? "there"} — {format(new Date(), "EEEE, MMMM d")}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Notes",       value: notesCount,     icon: "description",        color: statColors[0], cls: "stat-card-purple", href: "/dashboard/notes" },
          { label: "Pending Reminders", value: remindersCount, icon: "notifications_active",color: statColors[1], cls: "stat-card-green",  href: "/dashboard/reminders" },
          { label: "Overdue",           value: overdueCount,   icon: "crisis_alert",        color: statColors[2], cls: "stat-card-red",    href: "/dashboard/reminders" },
          { label: "Tags",              value: tagsCount,      icon: "sell",                color: statColors[3], cls: "stat-card-indigo", href: "/dashboard/tags" },
        ].map(({ label, value, icon, color, cls, href }) => (
          <Link
            key={label}
            href={href}
            className={`stat-card ${cls}`}
            style={{
              ...cardStyle,
              display: "block",
              textDecoration: "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", backgroundColor: color }} />
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color, marginBottom: "12px", display: "block" }}>
              {icon}
            </span>
            <p style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "36px", color: "#dae2fd", lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#908fa0", marginTop: "4px" }}>
              {label}
            </p>
          </Link>
        ))}
      </div>

      {/* Two-column section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px" }} className="dashboard-grid">
        {/* Recent Notes */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid rgba(255,255,255,0.15)", paddingBottom: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "#D946EF", fontSize: "20px" }}>description</span>
              <h2 style={{ fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#dae2fd" }}>
                Recent Notes
              </h2>
            </div>
            <Link href="/dashboard/notes" style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#34D399", textDecoration: "none", letterSpacing: "0.05em" }}>
              VIEW ALL →
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#2d3449", display: "block", marginBottom: "12px" }}>note_add</span>
              <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#464554", letterSpacing: "0.08em", textTransform: "uppercase" }}>No notes yet</p>
              <Link href="/dashboard/notes" style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#34D399", textDecoration: "none", marginTop: "8px", display: "inline-block" }}>
                WRITE YOUR FIRST NOTE →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentNotes.map((note: NoteWithTags) => (
                <Link
                  key={note.id}
                  href="/dashboard/notes"
                  className="note-row"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px",
                    border: "2px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#D946EF", flexShrink: 0, marginTop: "2px" }}>article</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "14px", color: "#dae2fd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {note.title}
                    </p>
                    <p style={{ fontFamily: "Inter", fontSize: "13px", color: "#908fa0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                      {note.content.slice(0, 60) || "No content"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#464554" }}>
                        {format(new Date(note.updatedAt), "MMM d").toUpperCase()}
                      </span>
                      {note.tags.slice(0, 2).map(({ tag }) => (
                        <span
                          key={tag.id}
                          style={{ fontFamily: "JetBrains Mono", fontSize: "10px", padding: "2px 8px", border: `1px solid ${tag.color}40`, color: tag.color, letterSpacing: "0.05em" }}
                        >
                          {tag.name.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders sidebar */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid rgba(255,255,255,0.15)", paddingBottom: "12px", marginBottom: "20px" }}>
            <span className="material-symbols-outlined" style={{ color: "#D946EF", fontSize: "20px" }}>notifications</span>
            <h2 style={{ fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#dae2fd" }}>
              Upcoming
            </h2>
          </div>

          {upcomingReminders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "#2d3449", display: "block", marginBottom: "8px" }}>notifications_none</span>
              <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#464554", letterSpacing: "0.08em", textTransform: "uppercase" }}>All clear</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {upcomingReminders.map((reminder: ReminderType) => {
                const { label, color } = getReminderLabel(new Date(reminder.dueDate));
                const rowCls = color === "#ffb4ab" ? "reminder-row-red"
                  : color === "#34D399" ? "reminder-row-green"
                  : color === "#D946EF" ? "reminder-row-purple"
                  : "reminder-row-indigo";
                return (
                  <Link
                    key={reminder.id}
                    href="/dashboard/reminders"
                    className={rowCls}
                    style={{
                      display: "block",
                      padding: "12px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      textDecoration: "none",
                      position: "relative",
                      overflow: "hidden",
                      transition: "border-color 0.15s",
                    }}
                  >
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", backgroundColor: color }} />
                    <div style={{ paddingLeft: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color, letterSpacing: "0.08em" }}>{label}</span>
                        <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#464554" }}>schedule</span>
                      </div>
                      <p style={{ fontFamily: "Inter", fontSize: "13px", color: "#dae2fd", lineHeight: 1.4 }}>{reminder.title}</p>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono",
                          fontSize: "10px",
                          padding: "2px 6px",
                          marginTop: "6px",
                          display: "inline-block",
                          border: `1px solid ${reminder.priority === "HIGH" ? "#ffb4ab" : reminder.priority === "MEDIUM" ? "#D946EF" : "#34D399"}40`,
                          color: reminder.priority === "HIGH" ? "#ffb4ab" : reminder.priority === "MEDIUM" ? "#D946EF" : "#34D399",
                        }}
                      >
                        {reminder.priority}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <Link
            href="/dashboard/reminders"
            className="add-reminder-btn"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginTop: "16px",
              padding: "10px",
              border: "2px solid rgba(255,255,255,0.2)",
              fontFamily: "JetBrains Mono",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#908fa0",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>add</span>
            Add Reminder
          </Link>
        </div>
      </div>
    </div>
  );
}
