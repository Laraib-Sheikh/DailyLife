import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reminderSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
  });

  return NextResponse.json(reminders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, dueDate, priority } = reminderSchema.parse(body);

    const reminder = await prisma.reminder.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority ?? "MEDIUM",
        userId: session.user.id,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
