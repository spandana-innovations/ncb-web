"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconMenu, IconClose, IconBook, IconSearch, IconBookmark, IconSettings,
         IconHeadphones, IconLineage, IconCalendar } from "./Icons";

const mainLinks = [
  { href: "/", label: "Read", Icon: IconBook },
  { href: "/search", label: "Search", Icon: IconSearch },
  { href: "/lexicon", label: "Lexicon", Icon: IconBook },
  { href: "/bookmarks", label: "Bookmarks", Icon: IconBookmark },
  { href: "/lineage", label: "Lineage", Icon: IconLineage },
  { href: "/plans", label: "Reading Plans", Icon: IconCalendar },
  { href: "/activity", label: "Recent Activity", Icon: IconBook },
  { href: "/settings", label: "Settings", Icon: IconSettings },
];

const aboutLinks = [
  { href: "/about/presentation", label: "Presentation" },
  { href: "/about/preface", label: "Preface" },
  { href: "/about/introduction", label: "General Introduction" },
  { href: "/about/collaborators", label: "Collaborators" },
  { href: "/about/copyright", label: "Copyright" },
  { href: "/about/contact", label: "Contact Us" },
];

function Accordion({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="drawer__accordion">
      <button className="drawer__accordion-head" onClick={() => setOpen(v => !v)}>
        {title}
        <span className={`drawer__accordion-chev${open ? " open" : ""}`}>⌃</span>
      </button>
      {open ? <div className="drawer__accordion-body">{children}</div> : null}
    </div>
  );
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button className="hdr-icon" onClick={() => setOpen(true)} aria-label="Menu"><IconMenu size={20} /></button>
      <div className={`drawer-overlay${open ? " show" : ""}`} onClick={close}>
        <aside className="drawer" onClick={e => e.stopPropagation()}>

          {/* Subtle logo background */}
          <div className="drawer__logo-bg" aria-hidden="true">
            <Image src="/logo-full.png" alt="" width={180} height={180} style={{ objectFit: "contain", opacity: 0.06 }} />
          </div>

          <div className="drawer__head">
            <span className="drawer__brand">The New Community Bible</span>
            <button className="hdr-icon dark" onClick={close} aria-label="Close"><IconClose size={18} /></button>
          </div>

          {mainLinks.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="drawer__link" onClick={close}>
              <Icon size={19} /> <span>{label}</span>
            </Link>
          ))}

          {/* About accordion */}
          <div className="drawer__section">
            <Accordion title={<span className="drawer__title" style={{ margin: 0 }}>About</span>}>
              {aboutLinks.map(l => (
                <Link key={l.href} href={l.href} className="drawer__hist" onClick={close}>{l.label}</Link>
              ))}
            </Accordion>
          </div>
        </aside>
      </div>
    </>
  );
}
