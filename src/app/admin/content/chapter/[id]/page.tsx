import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { saveChapter, deleteVerse } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ChapterDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id: Number(id) },
    include: { book: true, verses: { orderBy: { order: "asc" } } },
  });
  if (!chapter) notFound();
  const inp = { width: "100%", padding: ".6rem", marginBottom: "1rem", border: "1px solid var(--rule)" } as const;

  return (
    <main className="container reading">
      <p className="eyebrow">{chapter.book.name}</p>
      <h1 className="title">{chapter.name}</h1>

      <details style={{ marginBottom: "2rem" }}>
        <summary style={{ cursor: "pointer", fontFamily: "var(--sans)", fontSize: ".85rem" }}>Edit chapter details</summary>
        <form action={saveChapter} style={{ marginTop: "1rem" }}>
          <input type="hidden" name="id" value={chapter.id} />
          <input type="hidden" name="bookId" value={chapter.bookId} />
          <label className="eyebrow">Name</label>
          <input name="name" defaultValue={chapter.name} style={inp} required />
          <label className="eyebrow">Heading</label>
          <input name="heading" defaultValue={chapter.heading ?? ""} style={inp} />
          <label className="eyebrow">Audio URL (chapter narration)</label>
          <input name="audioUrl" defaultValue={chapter.audioUrl ?? ""} placeholder="https://… (upload to Vercel Blob later)" style={inp} />
          <label className="eyebrow">Display position</label>
          <input name="displayPosition" type="number" defaultValue={chapter.displayPosition} style={inp} />
          <button className="btn" type="submit">Save</button>
        </form>
      </details>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ fontSize: "1.2rem" }}>Verses ({chapter.verses.length})</h2>
        <Link className="btn" href={`/admin/content/verse/new?chapter=${chapter.id}`}>Add verse</Link>
      </div>
      {chapter.verses.map((v: any) => (
        <div key={v.id} className="result" style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <span style={{ flex: 1 }}>
            <span className="verse__no">{v.verseNo}</span>
            <span dangerouslySetInnerHTML={{ __html: v.verse.replace(/<[^>]+>/g, "").slice(0, 120) }} />
          </span>
          <span style={{ display: "flex", gap: ".5rem" }}>
            <Link href={`/admin/content/verse/${v.id}`}>Edit</Link>
            <form action={deleteVerse.bind(null, v.id, chapter.id)}>
              <button className="btn btn--ghost" type="submit">Delete</button>
            </form>
          </span>
        </div>
      ))}
    </main>
  );
}
