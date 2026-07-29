import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const noteSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  color: z.string().optional(),
  pinned: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const tagId = searchParams.get("tagId") || "";

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(tagId && {
        tags: { some: { tagId } },
      }),
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, color, pinned, tagIds } = noteSchema.parse(body);

    const note = await prisma.note.create({
      data: {
        title,
        content,
        color: color ?? "#ffffff",
        pinned: pinned ?? false,
        userId: session.user.id,
        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }),
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
