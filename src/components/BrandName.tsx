"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function BrandName() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [marquee, setMarquee] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // If the text wraps to more than 1 line, switch to marquee
    const check = () => setMarquee(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Link
      href="/"
      ref={ref}
      className={`brand${marquee ? " brand--marquee" : ""}`}
      aria-label="The New Community Bible — Home"
    >
      <span className={marquee ? "brand__text brand__text--scroll" : "brand__text"}>
        The New Community Bible
      </span>
    </Link>
  );
}
