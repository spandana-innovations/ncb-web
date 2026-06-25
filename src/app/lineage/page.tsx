"use client";
import { useState } from "react";
import Link from "next/link";
import { IconSearch, IconBack } from "@/components/Icons";

const MATTHEW: string[] = [
  "Abraham","Isaac","Jacob","Judah","Perez","Hezron","Ram","Amminadab",
  "Nahshon","Salmon","Boaz","Obed","Jesse","David","Solomon","Rehoboam",
  "Abijah","Asa","Jehoshaphat","Joram","Uzziah","Jotham","Ahaz","Hezekiah",
  "Manasseh","Amon","Josiah","Jeconiah","Shealtiel","Zerubbabel","Abiud",
  "Eliakim","Azor","Zadok","Achim","Eliud","Eleazar","Matthan","Jacob",
  "Joseph","Jesus"
];

const LUKE: string[] = [
  "Adam","Seth","Enos","Cainan","Mahalaleel","Jared","Enoch","Methuselah",
  "Lamech","Noah","Shem","Arphaxad","Cainan","Shelah","Eber","Peleg","Reu",
  "Serug","Nahor","Terah","Abraham","Isaac","Jacob","Judah","Perez","Hezron",
  "Arni","Admin","Amminadab","Nahshon","Sala","Boaz","Obed","Jesse","David",
  "Nathan","Mattatha","Menna","Melea","Eliakim","Jonam","Joseph","Judah",
  "Simeon","Levi","Matthat","Jorim","Eliezer","Joshua","Er","Elmadam",
  "Cosam","Addi","Melchi","Neri","Shealtiel","Zerubbabel","Rhesa","Joanan",
  "Joda","Josech","Semein","Mattathias","Maath","Naggai","Esli","Nahum",
  "Amos","Mattathias","Joseph","Jannai","Melchi","Levi","Matthat","Heli",
  "Joseph","Jesus"
];

function FlatList({ names, filter }: { names: string[]; filter: string }) {
  const filtered = filter
    ? names.map((n, i) => ({ n, i })).filter(({ n }) => n.toLowerCase().includes(filter.toLowerCase()))
    : names.map((n, i) => ({ n, i }));
  return (
    <div className="lineage-list">
      {filtered.length === 0 && <p className="empty">No names match "{filter}"</p>}
      {filtered.map(({ n, i }) => (
        <Link key={i} href={`/search?q=${encodeURIComponent(n)}`} className="lineage-list__item">
          <span className="lineage-list__num">{i + 1}</span>
          <span className="lineage-list__name">{n}</span>
          <span className="lineage-list__search"><IconSearch size={13} /></span>
        </Link>
      ))}
    </div>
  );
}

function TreeView({ names, filter }: { names: string[]; filter: string }) {
  const show = filter
    ? names.map((n, i) => ({ n, i })).filter(({ n }) => n.toLowerCase().includes(filter.toLowerCase()))
    : names.map((n, i) => ({ n, i }));
  return (
    <div className="lineage-tree">
      {show.map(({ n, i }, idx) => (
        <div key={i} className="lineage-tree__row">
          {idx < show.length - 1 && <div className="lineage-tree__vline" />}
          <div className="lineage-tree__node" style={{ marginLeft: filter ? 0 : Math.min(i, 8) * 0.5 + "rem" }}>
            <div className="lineage-tree__dot" />
            <Link href={`/search?q=${encodeURIComponent(n)}`} className="lineage-tree__name">{n}</Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LineagePage() {
  const [view, setView] = useState<"list" | "tree">("list");
  const [line, setLine] = useState<"matthew" | "luke">("matthew");
  const [filter, setFilter] = useState("");
  const names = line === "matthew" ? MATTHEW : LUKE;

  return (
    <main className="container reading">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <Link href="/settings" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.2rem", height: "2.2rem", borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", textDecoration: "none" }}>
          <IconBack size={18} />
        </Link>
        <div><p className="eyebrow" style={{ margin: 0 }}>Jesus Christ</p><h1 className="title" style={{ margin: 0 }}>Lineage</h1></div>
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)", marginBottom: "1.2rem", lineHeight: 1.5 }}>
        Tap any name to search all Bible references to that person.
        Matthew traces the royal line through Solomon; Luke traces through Nathan.
      </p>

      <div className="sbox" style={{ marginBottom: "1rem" }}>
        <span className="sbox__icon"><IconSearch size={18} /></span>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter names…" />
        {filter ? <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", fontSize: "1.1rem" }} onClick={() => setFilter("")}>✕</button> : null}
      </div>

      <div className="seg" style={{ marginBottom: "0.7rem" }}>
        <button className={`seg__btn${line === "matthew" ? " active" : ""}`} onClick={() => setLine("matthew")}>Matthew · 42</button>
        <button className={`seg__btn${line === "luke" ? " active" : ""}`} onClick={() => setLine("luke")}>Luke · 77</button>
      </div>

      <div className="seg" style={{ marginBottom: "1rem" }}>
        <button className={`seg__btn${view === "list" ? " active" : ""}`} onClick={() => setView("list")}>List</button>
        <button className={`seg__btn${view === "tree" ? " active" : ""}`} onClick={() => setView("tree")}>Tree</button>
      </div>

      <p style={{ fontSize: "0.73rem", color: "var(--ink-soft)", marginBottom: "0.9rem" }}>
        {line === "matthew" ? "Abraham → Jesus (Matthew 1:1–17)" : "Adam → Jesus (Luke 3:23–38)"}
        {filter ? ` · ${names.filter(n => n.toLowerCase().includes(filter.toLowerCase())).length} matches` : ""}
      </p>

      {view === "list" ? <FlatList names={names} filter={filter} /> : <TreeView names={names} filter={filter} />}
    </main>
  );
}
