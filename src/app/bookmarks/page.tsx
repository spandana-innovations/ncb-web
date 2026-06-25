"use client";
import { useState } from "react";
import Link from "next/link";
import { useBookmarks } from "@/components/Bookmarks";
import { IconPlus, IconStar, IconShare, IconTrash, IconEdit, IconSort, IconClose } from "@/components/Icons";

const COLORS = ["#e41f2c", "#9a7b35", "#3a8a5f", "#2f6db0", "#7a4fb0", "#b0532f"];

export default function BookmarksPage() {
  const { bookmarks, groups, remove, setGroup, addGroup, renameGroup, deleteGroup } = useBookmarks();
  const [manage, setManage] = useState(false);
  const [sortByCat, setSortByCat] = useState(true);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const groupNames = ["Unsorted", ...groups.map((g) => g.name)];
  const colorOf = (n: string) => groups.find((g) => g.name === n)?.color ?? "#b8b5ad";
  const inGroup = (n: string) => bookmarks.filter((b) => (b.group ?? "Unsorted") === n);

  async function share(b: { ref: string; text: string }) {
    const text = `${b.ref}\n${b.text}`;
    try {
      if (navigator.share) await navigator.share({ title: b.ref, text });
      else { await navigator.clipboard.writeText(text); alert("Verse copied to clipboard"); }
    } catch {}
  }

  return (
    <main className="container reading">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div><p className="eyebrow">Saved</p><h1 className="title">Bookmarks</h1></div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button className="hdr-icon dark" onClick={() => setSortByCat((v) => !v)} aria-label="Toggle sort" title={sortByCat ? "Sorting by category" : "Sorting by recent"}><IconSort size={18} /></button>
          <button className="hdr-icon dark" onClick={() => setManage((v) => !v)} aria-label="Manage categories" title="Manage categories"><IconEdit size={18} /></button>
        </div>
      </div>

      <p className="empty" style={{ marginTop: "-0.5rem", marginBottom: "1rem", fontSize: "0.8rem" }}>
        {sortByCat ? "Grouped by category" : "Most recent first"}
      </p>

      {/* ---- Manage categories (inline, minimal) ---- */}
      {manage ? (
        <div className="result" style={{ marginBottom: "1.2rem" }}>
          <p className="eyebrow">Categories</p>
          {groups.map((g) => (
            <div key={g.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0" }}>
              <span className="bm-group__dot" style={{ background: g.color }} />
              {editing === g.name ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus
                    style={{ flex: 1, padding: "0.3rem 0.5rem", border: "1px solid var(--rule)", borderRadius: 6, background: "var(--paper)", color: "var(--ink)" }} />
                  <button className="btn" style={{ padding: "0.35rem 0.7rem" }} onClick={() => { renameGroup(g.name, editName); setEditing(null); }}>Save</button>
                  <button className="verse__action" onClick={() => setEditing(null)} aria-label="Cancel"><IconClose size={16} /></button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>{g.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>{inGroup(g.name).length}</span>
                  <button className="verse__action" onClick={() => { setEditing(g.name); setEditName(g.name); }} aria-label="Rename"><IconEdit size={15} /></button>
                  <button className="verse__action" onClick={() => { if (confirm(`Delete category "${g.name}"? Its bookmarks move to Unsorted.`)) deleteGroup(g.name); }} aria-label="Delete category"><IconTrash size={15} /></button>
                </>
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.8rem", flexWrap: "wrap" }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category"
              style={{ flex: 1, minWidth: "8rem", padding: "0.4rem 0.5rem", border: "1px solid var(--rule)", borderRadius: 6, background: "var(--paper)", color: "var(--ink)" }} />
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} aria-label={`color ${c}`}
                  style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: color === c ? "2px solid var(--ink)" : "2px solid transparent", cursor: "pointer" }} />
              ))}
            </div>
            <button className="btn" style={{ padding: "0.4rem 0.8rem" }} onClick={() => { addGroup(name, color); setName(""); }}><IconPlus size={16} /></button>
          </div>
        </div>
      ) : null}

      {bookmarks.length === 0 ? <p className="empty">No bookmarks yet. Tap the star beside any verse to save it here.</p> : null}

      {/* ---- Bookmark list ---- */}
      {sortByCat ? (
        groupNames.map((gn) => {
          const items = inGroup(gn);
          if (items.length === 0) return null;
          return (
            <section key={gn} className="bm-group">
              <div className="bm-group__head">
                <span className="bm-group__dot" style={{ background: colorOf(gn) }} />
                <span className="bm-group__name">{gn}</span>
                <span className="bm-group__count">{items.length}</span>
              </div>
              {items.map((b) => <BookmarkCard key={b.verseId} b={b} groupNames={groupNames} setGroup={setGroup} remove={remove} share={share} />)}
            </section>
          );
        })
      ) : (
        bookmarks.map((b) => <BookmarkCard key={b.verseId} b={b} groupNames={groupNames} setGroup={setGroup} remove={remove} share={share} />)
      )}
    </main>
  );
}

function BookmarkCard({ b, groupNames, setGroup, remove, share }: any) {
  return (
    <div className="xref-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
        <Link href={`/read/${b.chapterId}`} style={{ color: "inherit", flex: 1 }}>
          <div className="xref-card__ref">{b.ref}</div>
          <div className="xref-card__text">{b.text.length > 180 ? b.text.slice(0, 180) + "…" : b.text}</div>
        </Link>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
          <button className="verse__action" onClick={() => share(b)} aria-label="Share"><IconShare size={16} /></button>
          <button className="verse__action active" onClick={() => remove(b.verseId)} aria-label="Delete bookmark"><IconTrash size={16} /></button>
        </div>
      </div>
      <div style={{ marginTop: "0.6rem" }}>
        <select value={b.group ?? "Unsorted"} onChange={(e) => setGroup(b.verseId, e.target.value === "Unsorted" ? undefined : e.target.value)}
          style={{ fontSize: "0.78rem", padding: "0.25rem 0.4rem", border: "1px solid var(--rule)", borderRadius: 6, background: "var(--paper)", color: "var(--ink-soft)" }}>
          {groupNames.map((n: string) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}
