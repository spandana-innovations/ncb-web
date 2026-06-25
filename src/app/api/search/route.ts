import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const testament = url.searchParams.get("testament"); // "old" | "new" | null
  if (q.length < 2) return fail("Enter at least 2 characters");

  // Map the toggle to testament displayPosition (1 = Old, 2 = New)
  const testamentFilter =
    testament === "old" ? { chapter: { book: { testament: { displayPosition: 1 } } } }
    : testament === "new" ? { chapter: { book: { testament: { displayPosition: 2 } } } }
    : {};

  const verses = await prisma.verse.findMany({
    where: { verse: { contains: q }, ...testamentFilter },
    orderBy: { order: "asc" },
    take: 200,
    include: { chapter: { include: { book: { include: { testament: true } } } } },
  });

  // shape for the client: keep what's needed for grouping
  const results = verses.map((v: any) => ({
    id: v.id,
    verse: v.verse,
    verseNo: v.verseNo,
    chapterId: v.chapter.id,
    chapterName: v.chapter.name,
    book: v.chapter.book.name,
    testamentPos: v.chapter.book.testament.displayPosition,
  }));

  return ok({ query: q, count: results.length, verses: results });
}
