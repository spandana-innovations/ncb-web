"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "./Settings";
import { IconSun, IconMoon, IconSearch } from "./Icons";

const STEPS = [0.85, 0.9, 1, 1.1, 1.2, 1.35, 1.5];
const LABELS = ["XS","S","M","L","XL","2X","3X"];

export default function HeaderControls() {
  const { theme, toggleTheme, scale, setScale } = useSettings();
  const [showFont, setShowFont] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const idx = STEPS.findIndex(s => Math.abs(s - scale) < 0.05);
  const cur = idx >= 0 ? idx : 2;

  return (
    <div className="hdr-controls" ref={ref}>

      {/* Font size — pill-style, visually distinct from circular icons */}
      <button
        className="hdr-aa"
        onClick={() => setShowFont(v => !v)}
        aria-label="Text size"
      >
        <span style={{ fontSize: "0.62rem", fontWeight: 700, lineHeight: 1 }}>A</span>
        <span style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1 }}>A</span>
      </button>

      {showFont ? (
        <div className="font-pop" onMouseLeave={() => setShowFont(false)}>
          <button className="font-pop__btn" onClick={() => setScale(STEPS[Math.max(cur-1,0)])} disabled={cur===0}>−</button>
          <span className="font-pop__val">{LABELS[cur]}</span>
          <button className="font-pop__btn" onClick={() => setScale(STEPS[Math.min(cur+1,STEPS.length-1)])} disabled={cur===STEPS.length-1}>+</button>
        </div>
      ) : null}

      {/* Dark mode — pill-style, matches AA */}
      <button className="hdr-aa" onClick={toggleTheme} aria-label={theme === "light" ? "Dark mode" : "Light mode"}>
        {theme === "light" ? <IconMoon size={15} /> : <IconSun size={15} />}
      </button>

      {/* Search — circular, visually different from the two pills above */}
      <button
        className="hdr-icon"
        onClick={() => router.push("/search")}
        aria-label="Search"
      >
        <IconSearch size={18} />
      </button>
    </div>
  );
}
