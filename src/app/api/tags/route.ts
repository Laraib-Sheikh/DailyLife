import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { notes: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, color } = tagSchema.parse(body);

  const existing = await prisma.tag.findUnique({
    where: { name_userId: { name, userId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Tag already exists" }, { status: 400 });
  }

  const tag = await prisma.tag.create({
    data: { name, color: color ?? "#6366f1", userId: session.user.id },
  });

  return NextResponse.json(tag, { status: 201 });
}
