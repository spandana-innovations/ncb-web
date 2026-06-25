import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function VerseSearch({ searchParams }: { searchParams: Promise<{ q?: string; book?: string; page?: string }> }) {
  const { q, book, page } = await searchParams;
  const pg = Math.max(1, Number(page) || 1);
  const take = 30; const skip = (pg - 1) * take;

  const where: any = {};
  if (q?.trim()) where.verse = { contains: q.trim() };
  if (book) where.chapter = { bookId: Number(book) };

  const [verses, total, books] = await Promise.all([
    prisma.verse.findMany({
      where, take, skip,
      orderBy: [{ chapter: { book: { displayPosition: "asc" } } }, { order: "asc" }],
      include: { chapter: { include: { book: { select: { id: true, name: true } } } } },
    }),
    prisma.verse.count({ where }),
    prisma.book.findMany({ orderBy: { displayPosition: "asc" }, select: { id: true, name: true } }),
  ]);

  const pages = Math.ceil(total / take);

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div><h1>Search Verses</h1><p>{total.toLocaleString()} verse{total !== 1 ? "s" : ""} found</p></div>
      </div>

      <div className="adm-card" style={{ marginBottom: "1rem" }}>
        <div className="adm-card__body">
          <form method="GET" style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
            <div className="adm-search" style={{ flex: 2, minWidth: "200px" }}>
              <svg className="adm-search__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input name="q" defaultValue={q} placeholder="Search verse text…" className="adm-input" style={{ paddingLeft: "2rem" }} />
            </div>
            <select name="book" className="adm-select" style={{ flex: 1, minWidth: "140px" }}>
              <option value="">All books</option>
              {books.map((b: any) => <option key={b.id} value={b.id} selected={book === String(b.id)}>{b.name}</option>)}
            </select>
            <button type="submit" className="adm-btn adm-btn--primary">Search</button>
            {(q || book) && <Link href="/admin/content/verse/search" className="adm-btn adm-btn--gray">Clear</Link>}
          </form>
        </div>
      </div>

      <div className="adm-card">
        <table className="adm-table">
          <thead><tr><th>Reference</th><th>Text</th><th>Commentary</th><th></th></tr></thead>
          <tbody>
            {verses.length === 0 ? (
              <tr><td colSpan={4} className="adm-table__empty">No verses found. Try a different search.</td></tr>
            ) : verses.map((v: any) => (
              <tr key={v.id}>
                <td style={{ whiteSpace: "nowrap", color: "var(--adm-soft)", fontSize: ".8rem" }}>
                  {v.chapter.book.name} {v.chapter.name}:{v.verseNo}
                </td>
                <td style={{ maxWidth: "340px" }}>
                  <span style={{ fontSize: ".85rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    dangerouslySetInnerHTML={{ __html: v.verse }} />
                </td>
                <td>
                  {v.commentaryContent
                    ? <span className="adm-badge adm-badge--green">Has commentary</span>
                    : <span className="adm-badge adm-badge--gray">None</span>}
                </td>
                <td><Link href={`/admin/content/verse/${v.id}`} className="adm-btn adm-btn--ghost adm-btn--sm">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div style={{ padding: ".75rem 1rem", borderTop: "1px solid var(--adm-rule)" }}>
            <div className="adm-pager">
              {pg > 1 && <Link href={`?q=${q || ""}&book=${book || ""}&page=${pg - 1}`} className="adm-pager__btn">‹</Link>}
              <span className="adm-pager__info">Page {pg} of {pages}</span>
              {pg < pages && <Link href={`?q=${q || ""}&book=${book || ""}&page=${pg + 1}`} className="adm-pager__btn">›</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
