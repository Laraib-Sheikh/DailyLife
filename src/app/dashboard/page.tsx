import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  NotebookPen,
  Bell,
  Tag,
  TrendingUp,
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

  const stats = [
    {
      label: "Total Notes",
      value: notesCount,
      icon: NotebookPen,
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-500/10",
      href: "/dashboard/notes",
    },
    {
      label: "Pending Reminders",
      value: remindersCount,
      icon: Bell,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-500/10",
      href: "/dashboard/reminders",
    },
    {
      label: "Tags",
      value: tagsCount,
      icon: Tag,
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-500/10",
      href: "/dashboard/tags",
    },
    {
      label: "Today",
      value: format(new Date(), "MMM d"),
      icon: TrendingUp,
      color: "from-pink-500 to-rose-500",
      bg: "bg-pink-500/10",
      href: "/dashboard/notes",
    },
  ];

  function getReminderStatus(dueDate: Date) {
    if (isPast(dueDate) && !isToday(dueDate)) return "overdue";
    if (isToday(dueDate)) return "today";
    if (isTomorrow(dueDate)) return "tomorrow";
    return "upcoming";
  }

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
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="glass rounded-2xl p-5 hover:border-indigo-500/40 transition-all group hover:scale-[1.02]"
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 bg-gradient-to-br ${color} bg-clip-text`} style={{color: 'transparent', backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`}} />
              <Icon className="w-5 h-5 text-white opacity-0 absolute" />
            </div>
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3 -mt-10`}>
              <Icon className="w-5 h-5 text-current" style={{color: `hsl(${label === 'Total Notes' ? '239,84%,67%' : label === 'Pending Reminders' ? '38,92%,50%' : label === 'Tags' ? '160,84%,39%' : '330,81%,60%'})`}} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <NotebookPen className="w-5 h-5 text-indigo-400" />
              Recent Notes
            </h2>
            <Link
              href="/dashboard/notes"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all →
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <NotebookPen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No notes yet</p>
              <Link
                href="/dashboard/notes"
                className="text-indigo-400 text-sm hover:text-indigo-300 mt-1 inline-block"
              >
                Write your first note →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  href="/dashboard/notes"
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-all group"
                >
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: note.color === "#ffffff" ? "#6366f1" : note.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                      {note.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {note.content.slice(0, 60)}...
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-xs text-slate-600">
                        {format(new Date(note.updatedAt), "MMM d")}
                      </span>
                      {note.tags.map(({ tag }) => (
                        <span
                          key={tag.id}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                          }}
                        >
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
            <Link
              href="/dashboard/reminders"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all →
            </Link>
          </div>

          {upcomingReminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No upcoming reminders</p>
              <Link
                href="/dashboard/reminders"
                className="text-indigo-400 text-sm hover:text-indigo-300 mt-1 inline-block"
              >
                Add a reminder →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => {
                const status = getReminderStatus(new Date(reminder.dueDate));
                const priorityColors = {
                  HIGH: "text-red-400 bg-red-500/10",
                  MEDIUM: "text-amber-400 bg-amber-500/10",
                  LOW: "text-emerald-400 bg-emerald-500/10",
                };

                return (
                  <Link
                    key={reminder.id}
                    href="/dashboard/reminders"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="mt-0.5">
                      {status === "overdue" ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                        {reminder.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            status === "overdue"
                              ? "text-red-400 bg-red-500/10"
                              : status === "today"
                              ? "text-amber-400 bg-amber-500/10"
                              : status === "tomorrow"
                              ? "text-blue-400 bg-blue-500/10"
                              : "text-slate-400 bg-slate-700/50"
                          }`}
                        >
                          {status === "overdue"
                            ? "Overdue"
                            : status === "today"
                            ? "Today"
                            : status === "tomorrow"
                            ? "Tomorrow"
                            : format(new Date(reminder.dueDate), "MMM d")}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            priorityColors[reminder.priority]
                          }`}
                        >
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
