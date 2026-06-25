"use client";
import { useState } from "react";

type Picked = { id: number; label: string };

export default function CrossRefEditor({
  initial,
  onSave,
}: {
  initial: Picked[];
  onSave: (verseIds: number[]) => Promise<void>;
}) {
  const [picked, setPicked] = useState<Picked[]>(initial);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Picked[]>([]);
  const [saving, setSaving] = useState(false);

  async function search() {
    if (query.trim().length < 2) return;
    const r = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
    const j = await r.json();
    if (j.data) {
      setResults(
        j.data.verses.slice(0, 25).map((v: any) => ({
          id: v.id,
          label: `${v.chapter.book.name} ${v.chapter.name}:${v.verseNo}`,
        }))
      );
    }
  }

  function add(p: Picked) {
    if (!picked.some((x) => x.id === p.id)) setPicked([...picked, p]);
  }
  function remove(id: number) {
    setPicked(picked.filter((x) => x.id !== id));
  }

  return (
    <div>
      <p className="eyebrow">Linked verses</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: "1rem" }}>
        {picked.length === 0 ? <span className="empty">No verses linked yet.</span> : null}
        {picked.map((p) => (
          <span key={p.id} style={{ background: "var(--accent-soft)", padding: ".25rem .6rem", borderRadius: 2, fontSize: ".85rem" }}>
            {p.label}
            <button onClick={() => remove(p.id)} style={{ marginLeft: ".4rem", border: "none", background: "none", cursor: "pointer", color: "var(--accent)" }} aria-label={`Remove ${p.label}`}>×</button>
          </span>
        ))}
      </div>

      <div className="searchbar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); search(); } }}
          placeholder="Find a verse to link…"
        />
        <button className="btn" type="button" onClick={search}>Find</button>
      </div>

      {results.map((r) => (
        <div key={r.id} className="result" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{r.label}</span>
          <button className="btn btn--ghost" type="button" onClick={() => add(r)}>Add</button>
        </div>
      ))}

      <div style={{ marginTop: "2rem" }}>
        <button
          className="btn"
          disabled={saving || picked.length === 0}
          onClick={async () => { setSaving(true); await onSave(picked.map((p) => p.id)); }}
        >
          {saving ? "Saving…" : "Save cross reference"}
        </button>
      </div>
    </div>
  );
}
