import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chapterId = Number(id);
  if (!Number.isInteger(chapterId)) return fail("Invalid chapter id");

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { book: { include: { testament: true } } },
  });
  if (!chapter) return fail("Chapter not found", 404);

  const verses = await prisma.verse.findMany({
    where: { chapterId },
    orderBy: { order: "asc" },
    include: {
      footnotes: { include: { footnote: true } },
      commentaries: { include: { commentary: true } },
    },
  });

  return ok({ chapter, verses });
}
