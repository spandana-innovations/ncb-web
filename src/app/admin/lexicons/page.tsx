import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteLexicon } from "./actions";

export const dynamic = "force-dynamic";

export default async function LexiconAdmin({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams;
  const where: any = {};
  if (q?.trim()) where.OR = [{ title: { contains: q.trim() } }, { description: { contains: q.trim() } }];
  if (cat) where.category = cat;

  const [entries, cats] = await Promise.all([
    prisma.lexicon.findMany({ where, orderBy: { title: "asc" } }),
    prisma.lexicon.findMany({ select: { category: true }, distinct: ["category"], orderBy: { category: "asc" } }),
  ]);

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div><h1>Lexicon</h1><p>{entries.length} entries</p></div>
        <Link href="/admin/lexicons/new" className="adm-btn adm-btn--primary">+ New entry</Link>
      </div>

      <div className="adm-card" style={{ marginBottom: "1rem" }}>
        <div className="adm-card__body">
          <form method="GET" style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
            <div className="adm-search" style={{ flex: 2, minWidth: "180px" }}>
              <svg className="adm-search__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input name="q" defaultValue={q} placeholder="Search entries…" style={{ width: "100%", padding: ".5rem .75rem .5rem 2.1rem", border: "1px solid var(--adm-rule)", borderRadius: "8px", fontSize: ".85rem", fontFamily: "var(--adm-sans)", outline: "none" }} />
            </div>
            <select name="cat" className="adm-select">
              <option value="">All categories</option>
              {cats.map((c: any) => <option key={c.category} value={c.category} selected={cat === c.category}>{c.category}</option>)}
            </select>
            <button type="submit" className="adm-btn adm-btn--primary">Filter</button>
            {(q || cat) && <Link href="/admin/lexicons" className="adm-btn adm-btn--gray">Clear</Link>}
          </form>
        </div>
      </div>

      <div className="adm-card">
        <table className="adm-table">
          <thead><tr><th>Title</th><th>Category</th><th>Description</th><th></th></tr></thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={4} className="adm-table__empty">No entries found.</td></tr>
            ) : entries.map((e: any) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{e.title}</td>
                <td><span className="adm-badge adm-badge--gray" style={{ fontSize: ".68rem" }}>{e.category?.split(" ")[0]}</span></td>
                <td style={{ maxWidth: "280px", fontSize: ".82rem", color: "var(--adm-soft)" }}>
                  <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    dangerouslySetInnerHTML={{ __html: (e.description || "").replace(/<[^>]+>/g, " ").slice(0, 100) }} />
                </td>
                <td>
                  <div style={{ display: "flex", gap: ".4rem" }}>
                    <Link href={`/admin/lexicons/${e.id}`} className="adm-btn adm-btn--ghost adm-btn--sm">Edit</Link>
                    <form action={deleteLexicon.bind(null, e.id)}>
                      <button type="submit" className="adm-btn adm-btn--danger adm-btn--sm" onClick={(e) => { if (!confirm("Delete this entry?")) e.preventDefault(); }}>Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
