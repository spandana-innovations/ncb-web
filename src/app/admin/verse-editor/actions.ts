"use server";
import { prisma } from "@/lib/prisma";

// ── Save verse + commentary ────────────────────────────────────────────────────
export async function saveVerseAction({
  id, verse, commentaryTitle, commentaryContent, order,
}: {
  id: number; verse: string; order?: number;
  commentaryTitle: string | null; commentaryContent: string | null;
}) {
  // Store as plain text wrapped in <p> to keep HTML structure
  const htmlVerse = verse.trim().includes("<") ? verse.trim() : `<p>${verse.trim()}</p>`;
  await prisma.verse.update({
    where: { id },
    data: { 
      verse: htmlVerse, 
      commentaryTitle, 
      commentaryContent,
      ...(order !== undefined ? { order } : {}),
    },
  });
}

// ── Jump-bar: resolve a reference string to chapter + verses ──────────────────
// Input: "Gen 1" → { chapters, verses } | "Gen 1:3" → { verse }
export async function resolveJumpAction(query: string): Promise<{
  type: "chapter" | "verse" | "none";
  chapterId?: number;
  verseId?: number;
  bookName?: string;
  chapterName?: string;
  verseNo?: string;
}> {
  const q = query.trim();
  if (!q) return { type: "none" };

  // Pattern: "Book Chapter:Verse" e.g. "John 3:16" or "1 Cor 13:4"
  const verseMatch = q.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (verseMatch) {
    const [, bookPart, chNum, verseNo] = verseMatch;
    const verse = await prisma.verse.findFirst({
      where: {
        verseNo,
        chapter: {
          name: { contains: chNum },
          book: { name: { contains: bookPart } },
        },
      },
      include: { chapter: { include: { book: { select: { name: true } } } } },
    });
    if (verse) return {
      type: "verse",
      verseId: verse.id,
      chapterId: verse.chapterId,
      bookName: (verse as any).chapter.book.name,
      chapterName: (verse as any).chapter.name,
      verseNo: verse.verseNo,
    };
  }

  // Pattern: "Book Chapter" e.g. "Genesis 1" or "1 Kings 3"
  const chapterMatch = q.match(/^(.+?)\s+(\d+)$/);
  if (chapterMatch) {
    const [, bookPart, chNum] = chapterMatch;
    const chapter = await prisma.chapter.findFirst({
      where: {
        name: { contains: chNum },
        book: { name: { contains: bookPart } },
      },
      include: { book: { select: { name: true } } },
    });
    if (chapter) return {
      type: "chapter",
      chapterId: chapter.id,
      bookName: (chapter as any).book.name,
      chapterName: chapter.name,
    };
  }

  return { type: "none" };
}

// ── Cross-ref: look up a single verse by exact reference ─────────────────────
// Input: "John 3:16" → returns the verse card to preview before linking
export async function lookupVerseRefAction(ref: string, excludeVerseId: number): Promise<{
  id: number; ref: string; text: string; html: string;
} | null> {
  const q = ref.trim();
  const m = q.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!m) return null;

  const [, bookPart, chNum, verseNo] = m;
  const verse = await prisma.verse.findFirst({
    where: {
      verseNo,
      id: { not: excludeVerseId },
      chapter: {
        name: { contains: chNum },
        book: { name: { contains: bookPart } },
      },
    },
    include: { chapter: { include: { book: { select: { name: true } } } } },
  });

  if (!verse) return null;
  const v = verse as any;
  return {
    id: v.id,
    ref: `${v.chapter.book.name} ${v.chapter.name}:${v.verseNo}`,
    text: v.verse.replace(/<[^>]+>/g, ""),
    html: v.verse,
  };
}

// ── Cross-ref: add link between two verses ────────────────────────────────────
export async function addCrossRefAction(fromVerseId: number, toVerseId: number): Promise<{ footnoteId: number } | null> {
  const fromFNs = await prisma.footnoteVerse.findMany({
    where: { verseId: fromVerseId }, select: { footnoteId: true },
  });
  const fromIds = fromFNs.map((f: any) => f.footnoteId);

  if (fromIds.length > 0) {
    const existing = await prisma.footnoteVerse.findFirst({
      where: { footnoteId: { in: fromIds }, verseId: toVerseId },
    });
    if (existing) return null;
  }

  const toFN = await prisma.footnoteVerse.findFirst({
    where: { verseId: toVerseId }, select: { footnoteId: true },
  });

  let footnoteId: number;
  if (toFN) {
    footnoteId = toFN.footnoteId;
    await prisma.footnoteVerse.create({ data: { footnoteId, verseId: fromVerseId } });
  } else if (fromIds.length > 0) {
    footnoteId = fromIds[0];
    await prisma.footnoteVerse.create({ data: { footnoteId, verseId: toVerseId } });
  } else {
    const fn = await prisma.footnote.create({ data: {} });
    footnoteId = fn.id;
    await prisma.footnoteVerse.createMany({
      data: [
        { footnoteId, verseId: fromVerseId },
        { footnoteId, verseId: toVerseId },
      ],
    });
  }
  return { footnoteId };
}

// ── Cross-ref: remove a link ──────────────────────────────────────────────────
export async function removeCrossRefAction(footnoteId: number, fromVerseId: number, toVerseId: number) {
  await prisma.footnoteVerse.deleteMany({ where: { footnoteId, verseId: toVerseId } });
  const remaining = await prisma.footnoteVerse.count({ where: { footnoteId } });
  if (remaining <= 1) {
    await prisma.footnoteVerse.deleteMany({ where: { footnoteId } });
    await prisma.footnote.delete({ where: { id: footnoteId } });
  }
}

// ── Chapter verses (for jump navigation) ─────────────────────────────────────
export async function loadChapterAction(chapterId: number) {
  const verses = await prisma.verse.findMany({
    where: { chapterId },
    orderBy: { order: "asc" },
    select: {
      id: true, verseNo: true, verse: true, order: true,
      commentaryTitle: true, commentaryContent: true,
      footnotes: { select: { footnoteId: true } },
    },
  });
  return verses.map((v: any) => ({
    id: v.id,
    verseNo: v.verseNo,
    order: v.order,
    text: v.verse.replace(/<[^>]+>/g, "").slice(0, 80),
    hasCommentary: !!(v.commentaryTitle || v.commentaryContent),
    xrefCount: v.footnotes?.length ?? 0,
    verse: v.verse,
    commentaryTitle: v.commentaryTitle ?? null,
    commentaryContent: v.commentaryContent ?? null,
  }));
}

// ── Load cross-refs for a specific verse ──────────────────────────────────────
export async function loadCrossRefsAction(verseId: number) {
  const footnoteVerses = await prisma.footnoteVerse.findMany({
    where: { verseId }, select: { footnoteId: true },
  });
  const footnoteIds = footnoteVerses.map((f: any) => f.footnoteId);
  if (footnoteIds.length === 0) return [];

  const linked = await prisma.footnoteVerse.findMany({
    where: { footnoteId: { in: footnoteIds }, verseId: { not: verseId } },
    include: {
      verse: {
        select: {
          id: true, verseNo: true, verse: true,
          chapter: { include: { book: { select: { name: true } } } },
        },
      },
    },
  });

  const seen = new Set<number>();
  const result: any[] = [];
  for (const fv of linked) {
    if (!seen.has(fv.verse.id)) {
      seen.add(fv.verse.id);
      const v = fv.verse as any;
      result.push({
        footnoteId: fv.footnoteId,
        verseId: v.id,
        ref: `${v.chapter.book.name} ${v.chapter.name}:${v.verseNo}`,
        text: v.verse.replace(/<[^>]+>/g, ""),
        html: v.verse,
      });
    }
  }
  return result;
}
