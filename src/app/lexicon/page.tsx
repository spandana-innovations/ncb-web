"use client";
import { useState, useMemo } from "react";
import { IconSearch, IconMic, IconPerson, IconPlace, IconTerm, IconBack, IconAZ } from "@/components/Icons";
import { useVoice } from "@/components/useVoice";
import lexiconData from "./lexiconData.json";

// Apple SF-style icons for lexicon sub-categories
function SubIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    cross: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2v20M2 12h20"/></svg>,
    book: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13"/><path d="M9 7h6M9 11h4"/></svg>,
    crown: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 19h20M3 9l4.5 5 4.5-7 4.5 7L21 9"/></svg>,
    temple: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 21h18M3 18h18M6 18V9M10 18V9M14 18V9M18 18V9M2 9l10-6 10 6"/></svg>,
    leaf: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
    star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 6.9L12 17.5l-6.2 3.6 1.2-6.8L2 9.3l6.9-.7L12 2z"/></svg>,
    pencil: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
    person: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>,
    building: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>,
    map: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    mountain: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3l4 8 5-5 5 15H2L8 3z"/></svg>,
    sprout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>,
    waves: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>,
    star6: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    diamond: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.58a2.41 2.41 0 0 0 3.41 0l7.59-7.58a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/></svg>,
    dove: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 17l-4-4H8a2 2 0 0 1 0-4l1-1 1.5-1.5 1.5 1 2-3 2 2 2.5-.5c1.1 0 2 .9 2 2v1l-2 2-1 3z"/><path d="M12 13v8"/></svg>,
    scroll: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3h4"/><path d="M10 7l2 0M10 11l4 0M10 15l4 0"/></svg>,
    scale: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v18M3 6l9-3 9 3M3 6l4 8c0 2-1.8 3-4 3s-4-1-4-3l4-8zM21 6l-4 8c0 2 1.8 3 4 3s4-1 4-3l-4-8z"/></svg>,
    bolt: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    jar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2h8l1 4H7L8 2z"/><path d="M7 6c0 0-2 2-2 6s2 10 7 10 7-6 7-10-2-6-2-6"/></svg>,
  };
  return <>{icons[name] ?? icons.book}</>;
}



type Entry = { id: number; title: string; description: string; category: string; subCategory: string };
type View = "home" | "subcat" | "entries" | "detail";

const MAIN_CATS = [
  {
    key: "persons", label: "Persons", Icon: IconPerson, color: "#e41f2c",
    desc: "97 people from both Testaments",
    catString: "PERSONS IN THE BIBLE",
    subcats: [
      { key: "Apostles & Disciples",      icon: "cross", color: "#e41f2c", desc: "Followers sent by Jesus" },
      { key: "Prophets",                  icon: "book", color: "#b01020", desc: "Messengers of God's word" },
      { key: "Kings & Rulers",            icon: "crown", color: "#9a7b35", desc: "Monarchs, emperors & governors" },
      { key: "Priests & Religious Leaders",icon: "temple", color: "#7a5c99", desc: "Priests, scribes & councils" },
      { key: "Patriarchs & Ancestors",    icon: "leaf", color: "#3a7a3a", desc: "Founders of the twelve tribes" },
      { key: "Women of the Bible",        icon: "star", color: "#b05090", desc: "Women of faith & courage" },
      { key: "Evangelists & Writers",     icon: "pencil", color: "#2f6db0", desc: "Gospel writers & dedicatees" },
      { key: "Others",                    icon: "person", color: "#6e6e73", desc: "Other notable figures" },
    ],
  },
  {
    key: "places", label: "Places", Icon: IconPlace, color: "#3a8a5f",
    desc: "88 locations across the biblical world",
    catString: "PLACES IN THE BIBLE",
    subcats: [
      { key: "Cities & Towns",              icon: "building", color: "#3a8a5f", desc: "Settlements & city-states" },
      { key: "Regions & Nations",           icon: "map", color: "#2f6db0", desc: "Kingdoms, provinces & lands" },
      { key: "Mountains & Hills",           icon: "mountain", color: "#7a5c3a", desc: "Sacred heights & summits" },
      { key: "Valleys, Gardens & Fields",   icon: "sprout", color: "#3a7a3a", desc: "Valleys, olive groves & plains" },
      { key: "Seas, Rivers & Waters",       icon: "waves", color: "#2060a0", desc: "Seas, rivers, pools & springs" },
      { key: "Spiritual & Symbolic Places", icon: "star6", color: "#8a5a99", desc: "Heaven, Hades, Paradise & symbols" },
    ],
  },
  {
    key: "terms", label: "Terms & Expressions", Icon: IconTerm, color: "#9a7b35",
    desc: "77 key words, concepts & expressions",
    catString: "TERMS AND EXPRESSIONS IN THE BIBLE",
    subcats: [
      { key: "Names & Titles of God",     icon: "diamond", color: "#9a7b35", desc: "Divine names, titles & epithets" },
      { key: "Worship, Feasts & Rituals", icon: "dove", color: "#c2161f", desc: "Liturgy, festivals & sacred acts" },
      { key: "Scripture & Doctrine",      icon: "scroll", color: "#6b5b1a", desc: "Books, teachings & core beliefs" },
      { key: "Law & Social Order",        icon: "scale", color: "#2f6db0", desc: "Law, governance & social roles" },
      { key: "Spiritual Powers & Beings", icon: "bolt", color: "#7a3a7a", desc: "Angels, demons & divine forces" },
      { key: "Culture & Everyday Life",   icon: "jar", color: "#8a6020", desc: "Customs, objects & daily life" },
    ],
  },
];

const ALL: Entry[] = lexiconData as Entry[];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function LexiconPage() {
  const [view, setView] = useState<View>("home");
  const [catKey, setCatKey] = useState<string | null>(null);
  const [subcat, setSubcat] = useState<string | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const voice = useVoice(t => setQ(t));

  const catMeta = catKey ? MAIN_CATS.find(m => m.key === catKey) : null;
  const subcatMeta = catMeta?.subcats.find(s => s.key === subcat);

  const filtered = useMemo(() => {
    if (q.trim().length >= 2) {
      const ql = q.toLowerCase();
      return ALL.filter(e => e.title.toLowerCase().includes(ql) || e.description.toLowerCase().includes(ql))
                .sort((a, b) => a.title.localeCompare(b.title));
    }
    let list = ALL;
    if (catMeta) list = list.filter(e => e.category === catMeta.catString);
    if (subcat) list = list.filter(e => e.subCategory === subcat);
    if (letter) list = list.filter(e => e.title.toUpperCase().startsWith(letter));
    return list.sort((a, b) => a.title.localeCompare(b.title));
  }, [catKey, subcat, letter, q, catMeta]);

  function goHome() { setView("home"); setCatKey(null); setSubcat(null); setLetter(null); setQ(""); }
  function openCat(k: string) { setCatKey(k); setSubcat(null); setLetter(null); setView("subcat"); }
  function openSub(s: string) { setSubcat(s); setLetter(null); setView("entries"); }
  function openEntry(e: Entry) { setEntry(e); setView("detail"); }
  function goBack() {
    if (view === "detail") setView("entries");
    else if (view === "entries") { setView("subcat"); setSubcat(null); setLetter(null); }
    else if (view === "subcat") goHome();
    else goHome();
  }

  const isSearch = q.trim().length >= 2;

  return (
    <main className="container reading">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".85rem" }}>
        {view !== "home" && <button className="lex-back" onClick={goBack}><IconBack size={18} /></button>}
        <div style={{ flex: 1 }}>
          {view === "home" && <><p className="eyebrow" style={{ margin: 0 }}>Scripture</p><h1 className="title" style={{ margin: 0 }}>Lexicon</h1></>}
          {view === "subcat" && <h2 className="lex-view-title">{catMeta?.label}</h2>}
          {view === "entries" && <h2 className="lex-view-title">{subcat ?? catMeta?.label} <span className="lex-view-count">· {filtered.length}</span></h2>}
          {view === "detail" && <h2 className="lex-view-title">{entry?.title}</h2>}
        </div>
      </div>

      {/* Search */}
      <div className="sbox" style={{ marginBottom: "1rem" }}>
        <span className="sbox__icon"><IconSearch size={17} /></span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search all 262 entries…" />
        {q ? <button className="sbox__clear" onClick={() => setQ("")}>✕</button>
           : <button className={`sbox__mic${voice.listening ? " listening" : ""}`} onClick={voice.toggle} aria-label="Voice"><IconMic size={17} /></button>}
      </div>

      {/* Search results */}
      {isSearch ? (
        <div>
          {filtered.length === 0 && <p className="empty">No entries match "{q}"</p>}
          <p style={{ fontSize: ".75rem", color: "var(--ink-soft)", marginBottom: ".6rem" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} across all categories</p>
          {filtered.map(e => (
            <button key={e.id} className="lex-row" onClick={() => { setQ(""); openEntry(e); }}>
              <span className="lex-row__title">{e.title}</span>
              <span className="lex-row__sub">{e.subCategory}</span>
              <span className="lex-row__chev">›</span>
            </button>
          ))}
        </div>

      ) : view === "home" ? (
        /* HOME — 3 main category cards */
        <div>
          {MAIN_CATS.map(cat => (
            <button key={cat.key} className="lex-main-card" onClick={() => openCat(cat.key)} style={{ "--cat-color": cat.color } as any}>
              <span className="lex-main-card__icon"><cat.Icon size={24} /></span>
              <div className="lex-main-card__body">
                <span className="lex-main-card__label">{cat.label}</span>
                <span className="lex-main-card__desc">{cat.desc}</span>
              </div>
              <span className="lex-main-card__chev">›</span>
            </button>
          ))}
        </div>

      ) : view === "subcat" && catMeta ? (
        /* SUBCAT — grid of sub-categories */
        <div>
          <div className="lex-sub-grid">
            {catMeta.subcats.map(sc => {
              const cnt = ALL.filter(e => e.category === catMeta.catString && e.subCategory === sc.key).length;
              if (cnt === 0) return null;
              return (
                <button key={sc.key} className="lex-sub-card" onClick={() => openSub(sc.key)} style={{ "--sc-color": sc.color } as any}>
                  <span className="lex-sub-card__icon"><SubIcon name={sc.icon} /></span>
                  <span className="lex-sub-card__label">{sc.key}</span>
                  <span className="lex-sub-card__desc">{sc.desc}</span>
                  <span className="lex-sub-card__count">{cnt} entries</span>
                </button>
              );
            })}
          </div>
          <button className="lex-browse-all" onClick={() => { setSubcat(null); setView("entries"); }}>
            <IconAZ size={15} /> Browse all {catMeta.label} A–Z
          </button>
        </div>

      ) : view === "entries" ? (
        /* ENTRIES — alpha strip + list */
        <div>
          <div className="alpha">
            {ALPHA.map(l => {
              const has = filtered.some(e => e.title.toUpperCase().startsWith(l));
              return (
                <button key={l}
                  onClick={() => has && setLetter(letter === l ? null : l)}
                  className={`alpha__b${letter === l ? " active" : ""}`}
                  style={!has ? { opacity: .22, cursor: "default" } : {}}>
                  {l}
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && <p className="empty">No entries for this filter.</p>}
          {filtered.map(e => (
            <button key={e.id} className="lex-row" onClick={() => openEntry(e)}>
              <span className="lex-row__title">{e.title}</span>
              {!subcat && <span className="lex-row__sub">{e.subCategory}</span>}
              <span className="lex-row__chev">›</span>
            </button>
          ))}
        </div>

      ) : view === "detail" && entry ? (
        /* DETAIL */
        <div>
          <div className="lex-detail-meta">
            <span className="lex-badge">{entry.subCategory}</span>
            <span className="lex-badge lex-badge--main">
              {entry.category === "PERSONS IN THE BIBLE" ? "Person" : entry.category === "PLACES IN THE BIBLE" ? "Place" : "Term"}
            </span>
          </div>
          <p className="lex-detail-body" dangerouslySetInnerHTML={{ __html: entry.description }} />
        </div>
      ) : null}
    </main>
  );
}
