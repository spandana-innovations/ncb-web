"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IconSearch, IconBookmark, IconCalendar, IconLineage } from "./Icons";

const LEFT = [
  { href: "/search", label: "Search", Icon: IconSearch, match: (p: string) => p.startsWith("/search") },
  { href: "/bookmarks", label: "Bookmarks", Icon: IconBookmark, match: (p: string) => p.startsWith("/bookmarks") },
];
const RIGHT = [
  { href: "/lineage", label: "Lineage", Icon: IconLineage, match: (p: string) => p.startsWith("/lineage") },
  { href: "/plans", label: "Plans", Icon: IconCalendar, match: (p: string) => p.startsWith("/plans") },
];

export default function TabBar() {
  const path = usePathname() || "/";
  if (path.startsWith("/admin") || path.startsWith("/login")) return null;
  const isHome = path === "/" || path.startsWith("/read");
  return (
    <nav className="tabbar">
      {LEFT.map(({ href, label, Icon, match }) => (
        <Link key={href} href={href} className={`tabbar__item${match(path) ? " active" : ""}`}>
          <Icon size={21} /><span>{label}</span>
        </Link>
      ))}
      {/* Center: splash-style logo button */}
      <Link href="/" className="tabbar__center" aria-label="Home — Read">
        <span className={`tabbar__logo-btn${isHome ? " active" : ""}`}>
          <Image src="/logo-full.png" alt="NCB" width={38} height={38} style={{ objectFit: "contain", display: "block" }} />
        </span>
      </Link>
      {RIGHT.map(({ href, label, Icon, match }) => (
        <Link key={href} href={href} className={`tabbar__item${match(path) ? " active" : ""}`}>
          <Icon size={21} /><span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
