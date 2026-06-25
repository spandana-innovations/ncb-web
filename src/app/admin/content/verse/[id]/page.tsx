import { saveVerse } from "../../actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditVerse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = await prisma.verse.findUnique({
    where: { id: Number(id) },
    include: { chapter: { include: { book: true } } },
  });
  if (!v) notFound();

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div>
          <div style={{ fontSize: ".78rem", color: "var(--adm-soft)", marginBottom: ".25rem" }}>
            <Link href="/admin/content">Content</Link> › <Link href={`/admin/content/book/${v.chapter.book.id}`}>{v.chapter.book.name}</Link> › {v.chapter.name}
          </div>
          <h1>Edit Verse {v.verseNo}</h1>
          <p>{v.chapter.book.name} {v.chapter.name}:{v.verseNo}</p>
        </div>
      </div>

      <form action={saveVerse}>
        <input type="hidden" name="id" value={v.id} />
        <input type="hidden" name="chapterId" value={v.chapterId} />

        <div className="adm-card" style={{ marginBottom: "1rem" }}>
          <div className="adm-card__head"><h2>Verse metadata</h2></div>
          <div className="adm-card__body">
            <div className="adm-form-row">
              <div className="adm-field">
                <label className="adm-label">Verse number</label>
                <input name="verseNo" defaultValue={v.verseNo} className="adm-input" required />
              </div>
              <div className="adm-field">
                <label className="adm-label">Display order</label>
                <input name="order" type="number" defaultValue={v.order} className="adm-input" />
              </div>
            </div>
          </div>
        </div>

        <div className="adm-card" style={{ marginBottom: "1rem" }}>
          <div className="adm-card__head"><h2>Verse text</h2><span className="adm-badge adm-badge--blue">HTML allowed</span></div>
          <div className="adm-card__body">
            <div className="adm-split">
              <div className="adm-split__panel">
                <div className="adm-split__label">Source (HTML)</div>
                <textarea name="verse" defaultValue={v.verse} className="adm-textarea adm-textarea--tall"
                  style={{ fontFamily: "monospace", fontSize: ".82rem" }} />
              </div>
              <div className="adm-split__panel">
                <div className="adm-split__label">Preview</div>
                <div className="adm-split__preview" dangerouslySetInnerHTML={{ __html: v.verse }} />
              </div>
            </div>
          </div>
        </div>

        <div className="adm-card" style={{ marginBottom: "1.5rem" }}>
          <div className="adm-card__head">
            <h2>Commentary</h2>
            {v.commentaryContent ? <span className="adm-badge adm-badge--green">Has commentary</span> : <span className="adm-badge adm-badge--gray">Empty</span>}
          </div>
          <div className="adm-card__body">
            <div className="adm-field" style={{ marginBottom: ".85rem" }}>
              <label className="adm-label">Commentary title</label>
              <input name="commentaryTitle" defaultValue={v.commentaryTitle ?? ""} className="adm-input"
                placeholder="e.g. The Significance of…" />
            </div>
            <div className="adm-split">
              <div className="adm-split__panel">
                <div className="adm-split__label">Commentary content (HTML)</div>
                <textarea name="commentaryContent" defaultValue={v.commentaryContent ?? ""} className="adm-textarea adm-textarea--tall"
                  style={{ fontFamily: "monospace", fontSize: ".82rem" }}
                  placeholder="<p>Your commentary here…</p>" />
              </div>
              <div className="adm-split__panel">
                <div className="adm-split__label">Preview</div>
                <div className="adm-split__preview" dangerouslySetInnerHTML={{ __html: v.commentaryContent ?? "<p style='color:#999;font-style:italic'>No commentary yet</p>" }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: ".75rem" }}>
          <button type="submit" className="adm-btn adm-btn--primary">Save changes</button>
          <Link href={`/admin/content/chapter/${v.chapterId}`} className="adm-btn adm-btn--gray">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
