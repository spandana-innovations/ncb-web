import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCrossReference } from "./actions";

export const dynamic = "force-dynamic";

export default async function CrossRefList() {
  // cross references = footnotes that link 2+ verses
  const refs = await prisma.footnote.findMany({
    orderBy: { id: "desc" },
    take: 100,
    include: {
      verses: {
        include: { verse: { include: { chapter: { include: { book: true } } } } },
      },
    },
  });

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="title">Cross References</h1>
        </div>
        <Link className="btn" href="/admin/cross-references/new">Create</Link>
      </div>

      {refs.map((r: any) => (
        <div key={r.id} className="result">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div className="result__ref">Reference #{r.id}</div>
              <div>
                {r.verses.map((fv: any) =>
                  `${fv.verse.chapter.book.name} ${fv.verse.chapter.name}:${fv.verse.verseNo}`
                ).join("  ·  ") || <span className="empty">no verses linked</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
              <Link href={`/admin/cross-references/${r.id}`}>Edit</Link>
              <form action={deleteCrossReference.bind(null, r.id)}>
                <button className="btn btn--ghost" type="submit">Delete</button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
