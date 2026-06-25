import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const bookId = Number(url.searchParams.get("bookId"));
  if (!bookId) return NextResponse.json({ chapters: [] });

  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    orderBy: { displayPosition: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json({ chapters });
}
