import { saveVerse } from "../../actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewVerse({ searchParams }: { searchParams: Promise<{ chapter?: string }> }) {
  const { chapter } = await searchParams;
  const ch = chapter ? await prisma.chapter.findUnique({ where: { id: Number(chapter) }, include: { book: true } }) : null;
  if (!ch) notFound();
  const nextOrder = (await prisma.verse.count({ where: { chapterId: ch.id } })) + 1;
  const inp = { width: "100%", padding: ".6rem", marginBottom: "1rem", border: "1px solid var(--rule)" } as const;
  return (
    <main className="container reading">
      <p className="eyebrow">{ch.book.name} · {ch.name}</p>
      <h1 className="title">New Verse</h1>
      <form action={saveVerse}>
        <input type="hidden" name="chapterId" value={ch.id} />
        <label className="eyebrow">Verse number</label>
        <input name="verseNo" style={inp} required />
        <label className="eyebrow">Order</label>
        <input name="order" type="number" defaultValue={nextOrder} style={inp} />
        <label className="eyebrow">Verse text (HTML allowed)</label>
        <textarea name="verse" rows={5} style={{ ...inp, fontFamily: "var(--serif)" }} />
        <label className="eyebrow">Commentary title (optional)</label>
        <input name="commentaryTitle" style={inp} />
        <label className="eyebrow">Commentary content (optional, HTML)</label>
        <textarea name="commentaryContent" rows={4} style={{ ...inp, fontFamily: "var(--serif)" }} />
        <button className="btn" type="submit">Save verse</button>
      </form>
    </main>
  );
}
