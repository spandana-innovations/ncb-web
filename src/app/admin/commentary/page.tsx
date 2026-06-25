import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CommentaryAdmin({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q, page } = await searchParams;
  const pg = Math.max(1, Number(page) || 1);
  const take = 30; const skip = (pg - 1) * take;

  const where: any = { commentaryContent: { not: null } };
  if (q?.trim()) {
    where.OR = [
      { commentaryTitle: { contains: q.trim() } },
      { commentaryContent: { contains: q.trim() } },
    ];
  }

  const [verses, total] = await Promise.all([
    prisma.verse.findMany({
      where, take, skip,
      orderBy: [{ chapter: { book: { displayPosition: "asc" } } }, { order: "asc" }],
      include: { chapter: { include: { book: { select: { name: true } } } } },
    }),
    prisma.verse.count({ where }),
  ]);

  const pages = Math.ceil(total / take);

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div><h1>Commentary</h1><p>{total.toLocaleString()} verses with commentary notes</p></div>
        <Link href="/admin/content/verse/search" className="adm-btn adm-btn--primary">Find verse to annotate</Link>
      </div>

      <div className="adm-card" style={{ marginBottom: "1rem" }}>
        <div className="adm-card__body">
          <form method="GET" style={{ display: "flex", gap: ".75rem" }}>
            <div className="adm-search" style={{ flex: 1 }}>
              <svg className="adm-search__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input name="q" defaultValue={q} placeholder="Search commentary…" style={{ paddingLeft: "2rem", width: "100%", padding: ".5rem .75rem .5rem 2.1rem", border: "1px solid var(--adm-rule)", borderRadius: "8px", fontSize: ".85rem", fontFamily: "var(--adm-sans)", outline: "none" }} />
            </div>
            <button type="submit" className="adm-btn adm-btn--primary">Search</button>
            {q && <Link href="/admin/commentary" className="adm-btn adm-btn--gray">Clear</Link>}
          </form>
        </div>
      </div>

      <div className="adm-card">
        <table className="adm-table">
          <thead><tr><th>Verse</th><th>Commentary title</th><th>Preview</th><th></th></tr></thead>
          <tbody>
            {verses.length === 0 ? (
              <tr><td colSpan={4} className="adm-table__empty">No commentary found.</td></tr>
            ) : verses.map((v: any) => (
              <tr key={v.id}>
                <td style={{ whiteSpace: "nowrap", fontSize: ".8rem", color: "var(--adm-soft)" }}>
                  {v.chapter.book.name} {v.chapter.name}:{v.verseNo}
                </td>
                <td style={{ fontSize: ".85rem", fontWeight: 600 }}>
                  {v.commentaryTitle ? <span dangerouslySetInnerHTML={{ __html: v.commentaryTitle }} /> : <span style={{ color: "var(--adm-soft)", fontWeight: 400 }}>—</span>}
                </td>
                <td style={{ maxWidth: "300px", fontSize: ".82rem", color: "var(--adm-soft)" }}>
                  <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    dangerouslySetInnerHTML={{ __html: (v.commentaryContent || "").replace(/<[^>]+>/g, " ").slice(0, 140) + "…" }} />
                </td>
                <td><Link href={`/admin/content/verse/${v.id}`} className="adm-btn adm-btn--ghost adm-btn--sm">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div style={{ padding: ".75rem 1rem", borderTop: "1px solid var(--adm-rule)" }}>
            <div className="adm-pager">
              {pg > 1 && <Link href={`?q=${q || ""}&page=${pg - 1}`} className="adm-pager__btn">‹</Link>}
              <span className="adm-pager__info">Page {pg} of {pages}</span>
              {pg < pages && <Link href={`?q=${q || ""}&page=${pg + 1}`} className="adm-pager__btn">›</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
