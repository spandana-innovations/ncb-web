import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function QIcon({ d, color = "var(--red)" }: { d: string; color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default async function AdminDashboard() {
  const [verseCount, lexiconCount, userCount, xrefCount, chapterCount, bookCount, commentaryCount] = await Promise.all([
    prisma.verse.count(),
    prisma.lexicon.count(),
    prisma.user.count(),
    prisma.footnote.count(),
    prisma.chapter.count(),
    prisma.book.count(),
    prisma.verse.count({ where: { commentaryContent: { not: null } } }),
  ]);

  const stats = [
    { label: "Books", value: bookCount, sub: "OT + NT", red: false },
    { label: "Chapters", value: chapterCount.toLocaleString(), sub: "total", red: false },
    { label: "Verses", value: verseCount.toLocaleString(), sub: "total", red: true },
    { label: "Cross Refs", value: xrefCount.toLocaleString(), sub: "groups", red: false },
    { label: "Lexicon", value: lexiconCount, sub: "entries", red: false },
    { label: "Commentary", value: commentaryCount.toLocaleString(), sub: "annotated", red: false },
    { label: "Users", value: userCount, sub: "editors", red: false },
  ];

  const quick = [
    { href: "/admin/verse-editor", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z", label: "Verse Editor", sub: "Edit text & commentary" },
    { href: "/admin/verse-editor", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 0 2 2z", label: "Commentary", sub: "Annotate verses" },
    { href: "/admin/lexicons", icon: "M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13M9 7h6M9 11h4", label: "Lexicon", sub: "Persons, places, terms" },
    { href: "/admin/pages/presentation", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h4", label: "Static Pages", sub: "About, preface, etc." },
    { href: "/admin/content", icon: "M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13", label: "Books & Chapters", sub: "Structure & order" },
    { href: "/admin/users/new", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6", label: "Add Editor", sub: "New admin user" },
  ];

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>The New Community Bible — Content Management System</p>
        </div>
      </div>

      <div className="adm-stats">
        {stats.map(s => (
          <div key={s.label} className={`adm-stat${s.red ? " adm-stat--red" : ""}`}>
            <div className="adm-stat__label">{s.label}</div>
            <div className="adm-stat__val">{s.value}</div>
            <div className="adm-stat__sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-card__head"><h2>Quick access</h2></div>
        <div className="adm-card__body" style={{ padding: ".85rem" }}>
          <div className="adm-quick">
            {quick.map(q => (
              <Link key={q.href + q.label} href={q.href} className="adm-quick__item">
                <span className="adm-quick__icon">
                  <QIcon d={q.icon} />
                </span>
                <span className="adm-quick__label">{q.label}</span>
                <span className="adm-quick__sub">{q.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
