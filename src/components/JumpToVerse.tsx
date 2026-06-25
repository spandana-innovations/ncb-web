"use client";
import { useEffect, useRef, useState } from "react";

export default function JumpToVerse({ verseNumbers, activeVerse }: { verseNumbers: string[]; activeVerse?: string | null }) {
  const [current, setCurrent] = useState<string | null>(verseNumbers[0] ?? null);
  const stripRef = useRef<HTMLDivElement | null>(null);

  // Scroll-spy: find the verse closest to the middle of the viewport
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = window.innerHeight / 2;
        let best: string | null = null, bestDist = Infinity;
        for (const n of verseNumbers) {
          const el = document.getElementById(`v${n}`);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const dist = Math.abs(rect.top + rect.height / 2 - mid);
          if (dist < bestDist) { bestDist = dist; best = n; }
        }
        if (best) setCurrent(best);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [verseNumbers]);

  // Follow read-aloud
  useEffect(() => { if (activeVerse) setCurrent(activeVerse); }, [activeVerse]);

  // Keep active chip centred in strip
  useEffect(() => {
    if (!current || !stripRef.current) return;
    const chip = stripRef.current.querySelector<HTMLElement>(`[data-v="${current}"]`);
    if (chip) {
      const strip = stripRef.current;
      strip.scrollTo({ left: chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
    }
  }, [current]);

  function jump(n: string) {
    const el = document.getElementById(`v${n}`);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + el.clientHeight / 2, behavior: "smooth" });
      setCurrent(n);
    }
  }

  function scroll(dir: "left" | "right") {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({ left: dir === "right" ? 120 : -120, behavior: "smooth" });
  }

  return (
    <div className="jtv-strip">
      <button className="jtv-arr" onClick={() => scroll("left")} aria-label="Scroll verses left">‹</button>
      <div className="jtv-strip__track" ref={stripRef}>
        {verseNumbers.map((n) => (
          <button key={n} data-v={n} className={`jtv-chip${current === n ? " on" : ""}`} onClick={() => jump(n)}>{n}</button>
        ))}
      </div>
      <button className="jtv-arr" onClick={() => scroll("right")} aria-label="Scroll verses right">›</button>
    </div>
  );
}
