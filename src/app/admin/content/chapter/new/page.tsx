import { saveChapter } from "../../actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewChapter({ searchParams }: { searchParams: Promise<{ book?: string }> }) {
  const { book } = await searchParams;
  const bk = book ? await prisma.book.findUnique({ where: { id: Number(book) } }) : null;
  if (!bk) notFound();
  const inp = { width: "100%", padding: ".6rem", marginBottom: "1rem", border: "1px solid var(--rule)" } as const;
  return (
    <main className="container reading">
      <p className="eyebrow">{bk.name}</p>
      <h1 className="title">New Chapter</h1>
      <form action={saveChapter}>
        <input type="hidden" name="bookId" value={bk.id} />
        <label className="eyebrow">Name (e.g. "Ch. 1")</label>
        <input name="name" style={inp} required />
        <label className="eyebrow">Heading (optional)</label>
        <input name="heading" style={inp} />
        <label className="eyebrow">Display position</label>
        <input name="displayPosition" type="number" defaultValue={0} style={inp} />
        <button className="btn" type="submit">Save chapter</button>
      </form>
    </main>
  );
}
