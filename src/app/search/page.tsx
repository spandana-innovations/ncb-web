"use client";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconSearch, IconMic } from "@/components/Icons";
import { useVoice } from "@/components/useVoice";

type Hit = {
  id: number; verse: string; verseNo: string;
  chapterId: number; chapterName: string; book: string; testamentPos: number;
};
type Testament = "all" | "old" | "new";

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (<>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>);
}

export default function SearchPage() {
  return <Suspense><SearchInner /></Suspense>;
}

function SearchInner() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [testament, setTestament] = useState<Testament>("all");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { const r = localStorage.getItem("ncb-recent"); if (r) setRecent(JSON.parse(r)); } catch {}
  }, []);

  const runSearch = useCallback(async (term: string, t: Testament) => {
    if (term.trim().length < 2) { setHits(null); return; }
    setLoading(true);
    try {
      const tParam = t === "all" ? "" : `&testament=${t}`;
      const r = await fetch(`/api/search?q=${encodeURIComponent(term.trim())}${tParam}`);
      const j = await r.json();
      setHits(j.data?.verses ?? []);
    } catch { setHits([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(q, testament), 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q, testament, runSearch]);

  function remember(term: string) {
    const t = term.trim(); if (t.length < 2) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x !== t)].slice(0, 6);
      try { localStorage.setItem("ncb-recent", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const voice = useVoice((text) => setQ(text));

  // group hits by "Book Chapter" preserving order
  const groups: { key: string; book: string; chapter: string; chapterId: number; items: Hit[] }[] = [];
  if (hits) {
    for (const h of hits) {
      const key = `${h.book}|${h.chapterName}`;
      let g = groups.find((x) => x.key === key);
      if (!g) { g = { key, book: h.book, chapter: h.chapterName, chapterId: h.chapterId, items: [] }; groups.push(g); }
      g.items.push(h);
    }
  }

  return (
    <main className="container reading">
      <h1 className="title">Search</h1>

      <div className="sbox">
        <span className="sbox__icon"><IconSearch size={18} /></span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => remember(q)}
          placeholder={voice.listening ? "Listening…" : "Search words or phrases…"}
          aria-label="Search the Bible text"
          autoFocus
        />
        {voice.supported ? (
          <button className={`sbox__mic${voice.listening ? " listening" : ""}`} onClick={voice.toggle} aria-label="Voice search">
            <IconMic size={18} />
          </button>
        ) : null}
      </div>

      {/* Testament toggle */}
      <div className="seg">
        {(["all", "old", "new"] as Testament[]).map((t) => (
          <button key={t} className={`seg__btn${testament === t ? " active" : ""}`} onClick={() => setTestament(t)}>
            {t === "all" ? "All" : t === "old" ? "Old Testament" : "New Testament"}
          </button>
        ))}
      </div>

      {recent.length > 0 && !q ? (
        <div className="chips">
          {recent.map((t) => <span key={t} className="chip" onClick={() => setQ(t)}>{t}</span>)}
        </div>
      ) : null}

      {loading ? <p className="empty">Searching…</p> : null}
      {hits && hits.length === 0 && !loading && q.trim().length >= 2 ? <p className="empty">No verses found for &ldquo;{q.trim()}&rdquo;.</p> : null}
      {hits && hits.length > 0 ? <p className="empty" style={{ fontSize: "0.8rem" }}>{hits.length} result{hits.length > 1 ? "s" : ""} in {groups.length} chapter{groups.length > 1 ? "s" : ""}</p> : null}

      {/* Grouped by chapter */}
      {groups.map((g) => (
        <section key={g.key} className="search-group">
          <Link href={`/read/${g.chapterId}`} className="search-group__head">
            {g.book} · {g.chapter}
            <span className="search-group__count">{g.items.length}</span>
          </Link>
          {g.items.map((h) => {
            const text = h.verse.replace(/<[^>]+>/g, "");
            const snippet = text.length > 200 ? text.slice(0, 200) + "…" : text;
            return (
              <Link key={h.id} href={`/read/${h.chapterId}`} className="result" onClick={() => remember(q)}>
                <div className="result__ref">Verse {h.verseNo}</div>
                <p>{highlight(snippet, q.trim())}</p>
              </Link>
            );
          })}
        </section>
      ))}
    </main>
  );
}
