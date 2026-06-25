import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

// Returns all verses cross-referenced to the given verse.
// A "cross reference" = a footnote group; this verse's linked verses are
// every OTHER verse sharing a footnote with it.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const verseId = Number(id);
  if (!Number.isInteger(verseId)) return fail("Invalid verse id");

  // footnote groups this verse belongs to
  const memberships = await prisma.footnoteVerse.findMany({
    where: { verseId },
    select: { footnoteId: true },
  });
  const footnoteIds = memberships.map((m: { footnoteId: number }) => m.footnoteId);
  if (footnoteIds.length === 0) return ok({ verseId, references: [] });

  // all other verses in those groups
  const links = await prisma.footnoteVerse.findMany({
    where: { footnoteId: { in: footnoteIds }, verseId: { not: verseId } },
    include: {
      verse: { include: { chapter: { include: { book: true } } } },
    },
  });

  // de-dupe (a verse could share multiple groups) and shape
  const seen = new Set<number>();
  const references = [];
  for (const l of links) {
    if (seen.has(l.verse.id)) continue;
    seen.add(l.verse.id);
    references.push({
      verseId: l.verse.id,
      chapterId: l.verse.chapterId,
      ref: `${l.verse.chapter.book.name} ${l.verse.chapter.name}:${l.verse.verseNo}`,
      book: l.verse.chapter.book.name,
      chapter: l.verse.chapter.name,
      verseNo: l.verse.verseNo,
      text: l.verse.verse.replace(/<[^>]+>/g, ""),
    });
  }

  return ok({ verseId, references });
}
