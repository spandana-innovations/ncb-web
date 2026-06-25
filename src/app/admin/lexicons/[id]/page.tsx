import { saveLexicon } from "../actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditLexicon({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await prisma.lexicon.findUnique({ where: { id: Number(id) } });
  if (!e) notFound();

  const categories = [
    "PERSONS IN THE BIBLE",
    "PLACES IN THE BIBLE",
    "TERMS AND EXPRESSIONS IN THE BIBLE",
  ];

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div>
          <div style={{ fontSize: ".78rem", color: "var(--adm-soft)", marginBottom: ".25rem" }}>
            <Link href="/admin/lexicons">Lexicon</Link> › Edit
          </div>
          <h1>{e.title}</h1>
        </div>
      </div>

      <form action={saveLexicon}>
        <input type="hidden" name="id" value={e.id} />
        <div className="adm-card" style={{ marginBottom: "1rem" }}>
          <div className="adm-card__head"><h2>Entry details</h2></div>
          <div className="adm-card__body">
            <div className="adm-form">
              <div className="adm-form-row">
                <div className="adm-field">
                  <label className="adm-label">Title</label>
                  <input name="title" defaultValue={e.title} className="adm-input" required />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Category</label>
                  <select name="category" className="adm-select">
                    {categories.map(c => <option key={c} value={c} selected={e.category === c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label">Description</label>
                <div className="adm-split">
                  <div className="adm-split__panel">
                    <textarea name="description" defaultValue={e.description} className="adm-textarea adm-textarea--tall"
                      style={{ fontFamily: "monospace", fontSize: ".82rem" }} />
                  </div>
                  <div className="adm-split__panel">
                    <div className="adm-split__label">Preview</div>
                    <div className="adm-split__preview" dangerouslySetInnerHTML={{ __html: e.description }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: ".75rem" }}>
          <button type="submit" className="adm-btn adm-btn--primary">Save changes</button>
          <Link href="/admin/lexicons" className="adm-btn adm-btn--gray">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
