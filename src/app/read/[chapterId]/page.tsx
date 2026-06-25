import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ChapterReader, { type VerseData } from "@/components/ChapterReader";
import TrackReading from "@/components/TrackReading";

// Cache for 24 hours — content never changes
export const revalidate = 86400;

// Pre-render ALL 1328 chapters at build time → instant load for every chapter
export async function generateStaticParams() {
  const chapters = await prisma.chapter.findMany({ select: { id: true } });
  return chapters.map((c: { id: number }) => ({ chapterId: String(c.id) }));
}

export default async function ReadChapter({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const id = Number(chapterId);
  if (!Number.isInteger(id)) notFound();

  // Step 1: get chapter (needed for bookId to fetch siblings)
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { book: { select: { id: true, name: true } } },
  });
  if (!chapter) notFound();

  // Step 2: verses + siblings in parallel (now we have bookId)
  const [verses, siblings] = await Promise.all([
    prisma.verse.findMany({
      where: { chapterId: id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        verseNo: true,
        verse: true,
        commentaryTitle: true,
        commentaryContent: true,
        footnotes: { select: { footnoteId: true } },
      },
    }),
    prisma.chapter.findMany({
      where: { bookId: chapter.bookId },
      orderBy: { displayPosition: "asc" },
      select: { id: true },
    }),
  ]);

  // Step 3: cross-ref counts (depends on verses)
  const allFootnoteIds = Array.from(
    new Set(verses.flatMap((v: any) => v.footnotes.map((f: any) => f.footnoteId)))
  ) as number[];

  const groupCounts = allFootnoteIds.length > 0
    ? await prisma.footnoteVerse.groupBy({
        by: ["footnoteId"],
        where: { footnoteId: { in: allFootnoteIds } },
        _count: { verseId: true },
      })
    : [];

  const groupSize = new Map<number, number>(
    groupCounts.map((g: any) => [g.footnoteId, g._count.verseId])
  );
  const groupsWithLinks = new Set(
    groupCounts.filter((g: any) => g._count.verseId > 1).map((g: any) => g.footnoteId)
  );

  const sibIdx = siblings.findIndex((c: any) => c.id === id);
  const prev = siblings[sibIdx - 1] ?? null;
  const next = siblings[sibIdx + 1] ?? null;

  const heading = /lorem ipsum/i.test(chapter.heading ?? "") ? null : chapter.heading;
  const chapterDisplay = chapter.name.replace(/^Ch\.\s*/i, "Chapter ");

  const verseData: VerseData[] = verses.map((v: any) => {
    const fids = v.footnotes
      .map((f: any) => f.footnoteId)
      .filter((fid: number) => groupsWithLinks.has(fid)) as number[];
    const xrefCount = fids.reduce(
      (sum: number, fid: number) => sum + Math.max((groupSize.get(fid) ?? 1) - 1, 0), 0
    );
    return {
      id: v.id,
      verseNo: v.verseNo,
      html: v.verse,
      text: v.verse.replace(/<[^>]+>/g, ""),
      hasXref: fids.length > 0,
      xrefCount,
      commentaryTitle: v.commentaryTitle ?? null,
      commentaryContent: v.commentaryContent ?? null,
    };
  });

  return (
    <main className="container reading">
      <p className="eyebrow">{chapter.book.name}</p>
      {heading ? <p className="chapter-heading" style={{ marginTop: 0 }}>{heading}</p> : null}
      {/* Chapter nav: top */}
      <nav className="chapter-nav chapter-nav--top">
        {prev ? <Link href={`/read/${prev.id}`} className="chapter-nav__btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Previous</span>
        </Link> : <span />}
        {next ? <Link href={`/read/${next.id}`} className="chapter-nav__btn chapter-nav__btn--next">
          <span>Next</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link> : <span />}
      </nav>
      <ChapterReader
        verses={verseData}
        chapterId={chapter.id}
        bookName={chapter.book.name}
        chapterName={chapterDisplay}
        prevId={prev?.id ?? null}
        nextId={next?.id ?? null}
      />
      {/* Chapter nav: bottom */}
      <nav className="chapter-nav chapter-nav--bottom">
        {prev ? <Link href={`/read/${prev.id}`} className="chapter-nav__btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Previous</span>
        </Link> : <span />}
        {next ? <Link href={`/read/${next.id}`} className="chapter-nav__btn chapter-nav__btn--next">
          <span>Next</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link> : <span />}
      </nav>
      <TrackReading chapterId={chapter.id} label={`${chapter.book.name} · ${chapter.name}`} />
    </main>
  );
}
