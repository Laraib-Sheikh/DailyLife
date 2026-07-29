import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  NotebookPen,
  Bell,
  Tag,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format, isToday, isTomorrow, isPast } from "date-fns";

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
        take: 5,
      }),
    ]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  function getReminderLabel(dueDate: Date) {
    if (isPast(dueDate) && !isToday(dueDate)) return { label: "Overdue", cls: "text-red-400 bg-red-500/10" };
    if (isToday(dueDate)) return { label: "Today", cls: "text-amber-400 bg-amber-500/10" };
    if (isTomorrow(dueDate)) return { label: "Tomorrow", cls: "text-blue-400 bg-blue-500/10" };
    return { label: format(dueDate, "MMM d"), cls: "text-slate-400 bg-slate-700/50" };
  }

  const priorityColors: Record<string, string> = {
    HIGH: "text-red-400 bg-red-500/10",
    MEDIUM: "text-amber-400 bg-amber-500/10",
    LOW: "text-emerald-400 bg-emerald-500/10",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {greeting},{" "}
          <span className="gradient-text">
            {session.user.name?.split(" ")[0] ?? "there"}
          </span>{" "}
          👋
        </h1>
        <p className="text-slate-400 mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/notes" className="glass rounded-2xl p-5 hover:border-indigo-500/40 transition-all hover:scale-[1.02] group">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-3">
            <NotebookPen className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{notesCount}</p>
          <p className="text-sm text-slate-400 mt-0.5">Total Notes</p>
        </Link>

        <Link href="/dashboard/reminders" className="glass rounded-2xl p-5 hover:border-amber-500/40 transition-all hover:scale-[1.02] group">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-3">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{remindersCount}</p>
          <p className="text-sm text-slate-400 mt-0.5">Pending Reminders</p>
        </Link>

        <Link href="/dashboard/tags" className="glass rounded-2xl p-5 hover:border-emerald-500/40 transition-all hover:scale-[1.02] group">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3">
            <Tag className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{tagsCount}</p>
          <p className="text-sm text-slate-400 mt-0.5">Tags</p>
        </Link>

        <div className="glass rounded-2xl p-5">
          <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center mb-3">
            <CalendarDays className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-2xl font-bold text-white">{format(new Date(), "d")}</p>
          <p className="text-sm text-slate-400 mt-0.5">{format(new Date(), "MMMM yyyy")}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <NotebookPen className="w-5 h-5 text-indigo-400" />
              Recent Notes
            </h2>
            <Link href="/dashboard/notes" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <NotebookPen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No notes yet</p>
              <Link href="/dashboard/notes" className="text-indigo-400 text-sm hover:text-indigo-300 mt-1 inline-block">
                Write your first note →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <Link key={note.id} href="/dashboard/notes" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-all group">
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: note.color === "#1e293b" ? "#6366f1" : note.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                      {note.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {note.content.slice(0, 50) || "No content"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(note.updatedAt), "MMM d")}
                      </span>
                      {note.tags.slice(0, 2).map(({ tag }) => (
                        <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: tag.color + "20", color: tag.color }}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Upcoming Reminders
            </h2>
            <Link href="/dashboard/reminders" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>

          {upcomingReminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No upcoming reminders</p>
              <Link href="/dashboard/reminders" className="text-indigo-400 text-sm hover:text-indigo-300 mt-1 inline-block">
                Add a reminder →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingReminders.map((reminder) => {
                const { label, cls } = getReminderLabel(new Date(reminder.dueDate));
                const isOverdue = label === "Overdue";
                return (
                  <Link key={reminder.id} href="/dashboard/reminders" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-all group">
                    {isOverdue ? (
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                        {reminder.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${cls}`}>{label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${priorityColors[reminder.priority]}`}>
                          {reminder.priority}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
