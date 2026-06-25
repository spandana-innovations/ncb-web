"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { IconBook, IconSearch, IconSettings, IconPerson, IconPlace, IconBookmark } from "./Icons";

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    dashboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    editor: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    lexicon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13"/><path d="M9 7h6M9 11h4"/></svg>,
    pages: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h4"/></svg>,
    books: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13"/></svg>,
    users: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>,
    page: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  };
  return <span style={{ opacity: .65, display: "flex" }}>{icons[name] ?? icons.page}</span>;
}

const PAGES = [
  { slug: "presentation", label: "Presentation" },
  { slug: "preface", label: "Preface" },
  { slug: "introduction", label: "Introduction" },
  { slug: "collaborator", label: "Collaborators" },
  { slug: "copyright", label: "Copyright" },
  { slug: "contact-us", label: "Contact Us" },
];

export default function AdminNav() {
  const path = usePathname();
  const isPage = (href: string, exact = false) =>
    exact ? path === href : path.startsWith(href);

  return (
    <>
      <div className="adm-sidebar__logo">
        <div className="adm-logo-icon">
          <Image src="/logo-red.png" alt="NCB" width={22} height={22} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        </div>
        <div>
          <div className="adm-sidebar__name">NCB Admin</div>
          <div className="adm-sidebar__sub">Content CMS</div>
        </div>
      </div>

      <nav className="adm-nav">
        <div className="adm-nav__sec">Main</div>
        <Link href="/admin" className={`adm-nav__a${path === "/admin" ? " on" : ""}`}><NavIcon name="dashboard" /> Dashboard</Link>
        <Link href="/admin/verse-editor" className={`adm-nav__a${isPage("/admin/verse-editor") ? " on" : ""}`}><NavIcon name="editor" /> Verse Editor</Link>

        <div className="adm-nav__sec">Reference</div>
        <Link href="/admin/lexicons" className={`adm-nav__a${isPage("/admin/lexicons") ? " on" : ""}`}><NavIcon name="lexicon" /> Lexicon</Link>

        <div className="adm-nav__sec">Static Pages</div>
        {PAGES.map(p => (
          <Link key={p.slug} href={`/admin/pages/${p.slug}`}
            className={`adm-nav__a${path === `/admin/pages/${p.slug}` ? " on" : ""}`}
            style={{ paddingLeft: "1.8rem", fontSize: ".8rem" }}>
            <NavIcon name="page" /> {p.label}
          </Link>
        ))}

        <div className="adm-nav__sec">Settings</div>
        <Link href="/admin/content" className={`adm-nav__a${isPage("/admin/content") ? " on" : ""}`}><NavIcon name="books" /> Books &amp; Chapters</Link>
        <Link href="/admin/users" className={`adm-nav__a${isPage("/admin/users") ? " on" : ""}`}><NavIcon name="users" /> Admin Users</Link>
      </nav>

      <div className="adm-sidebar__foot">
        <button className="adm-signout" onClick={() => signOut({ callbackUrl: "/login" })}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
    </>
  );
}
