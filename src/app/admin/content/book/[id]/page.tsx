import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id: Number(id) },
    include: {
      chapters: {
        orderBy: { displayPosition: "asc" },
        include: { _count: { select: { verses: true } } },
      },
      testament: { select: { name: true } },
    },
  });
  if (!book) notFound();

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div>
          <div style={{ fontSize:".78rem", color:"var(--adm-soft)", marginBottom:".2rem" }}>
            <Link href="/admin/content">Books &amp; Chapters</Link> › {book.name}
          </div>
          <h1>{book.name}</h1>
          <p>{book.testament.name} · {book.chapters.length} chapters</p>
        </div>
        <Link href="/admin/content" className="adm-btn adm-btn--gray">← Back</Link>
      </div>

      <div className="adm-card">
        <div className="adm-card__head">
          <h2>Chapters</h2>
          <span style={{ fontSize:".78rem", color:"var(--adm-soft)" }}>To edit verses, use the <Link href="/admin/verse-editor" style={{ color:"var(--red)" }}>Verse Editor</Link></span>
        </div>
        <div className="adm-chapter-list">
          {book.chapters.map((c: any, i: number) => (
            <div key={c.id} className="adm-chapter-row">
              <div className="adm-chapter-row__num">{i + 1}</div>
              <div className="adm-chapter-row__name">{c.name}</div>
              <div className="adm-chapter-row__meta">{c._count.verses} verses</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
