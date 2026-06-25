import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export const revalidate = 86400;

// Resolves plan chapter strings like "Genesis Ch.1" to chapter IDs
// POST body: { chapters: ["Genesis Ch.1", "Matthew Ch.1", ...] }
export async function POST(req: Request) {
  const { chapters } = await req.json();
  if (!Array.isArray(chapters)) return fail("Invalid input");

  const results: { label: string; chapterId: number; bookName: string; chapterName: string }[] = [];

  for (const label of chapters as string[]) {
    // Parse "Genesis Ch.1" → book="Genesis", chapterNum="1"
    const match = label.match(/^(.+?)\s+Ch\.(\d+)$/);
    if (!match) continue;
    const [, bookName, chNum] = match;
    const chapterName = `Ch. ${chNum}`;

    const chapter = await prisma.chapter.findFirst({
      where: {
        name: chapterName,
        book: { name: bookName },
      },
      select: { id: true, name: true, book: { select: { name: true } } },
    });

    if (chapter) {
      results.push({
        label,
        chapterId: chapter.id,
        bookName: chapter.book.name,
        chapterName: chapter.name,
      });
    }
  }

  return ok(results);
}
