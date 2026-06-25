import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteBook } from "./actions";

export const dynamic = "force-dynamic";

export default async function ContentIndex() {
  const testaments = await prisma.testament.findMany({
    orderBy: { displayPosition: "asc" },
    include: {
      books: {
        orderBy: { displayPosition: "asc" },
        include: { _count: { select: { chapters: true } } },
      },
    },
  });

  const maxChapters = Math.max(...testaments.flatMap((t: any) => t.books.map((b: any) => b._count.chapters)), 1);

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div><h1>Books &amp; Chapters</h1><p>Structure and organisation of the Bible content.</p></div>
      </div>

      {testaments.map((t: any) => (
        <div key={t.id} className="adm-card" style={{ marginBottom: "1.5rem", overflow: "visible", border: "none", background: "none", boxShadow: "none", padding: 0 }}>
          <div className="adm-testament-head">
            <h2>{t.name}</h2>
            <div style={{ display: "flex", gap: ".6rem" }}>
              <span style={{ fontSize: ".78rem", opacity: .8 }}>{t.books.length} books</span>
              <Link href={`/admin/content/book/new?testament=${t.id}`} className="adm-btn adm-btn--sm"
                style={{ background: "rgba(255,255,255,.2)", color: "#fff", border: "1px solid rgba(255,255,255,.3)" }}>
                + Add book
              </Link>
            </div>
          </div>
          <div className="adm-books-grid" style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "0 0 var(--r-lg) var(--r-lg)", padding: "1rem", borderTop: "none" }}>
            {t.books.map((b: any) => (
              <Link key={b.id} href={`/admin/content/book/${b.id}`} className="adm-book-card">
                <div className="adm-book-card__name">{b.name}</div>
                <div className="adm-book-card__meta">{b._count.chapters} chapter{b._count.chapters !== 1 ? "s" : ""}</div>
                <div className="adm-book-card__bar">
                  <div style={{ width: `${(b._count.chapters / maxChapters) * 100}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
