"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/components/Settings";
import { IconSun, IconMoon } from "@/components/Icons";

export default function SettingsPage() {
  const { theme, toggleTheme, scale, setScale, voiceURI, setVoiceURI, rate, setRate } = useSettings();
  const [voices, setVoices] = useState<{ name: string; voiceURI: string }[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en")).map((v) => ({ name: v.name, voiceURI: v.voiceURI })));
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  return (
    <main className="container reading">
      <p className="eyebrow">Preferences</p>
      <h1 className="title">Settings</h1>

      <div className="xref-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><b>Dark mode</b><div className="xref-card__text">Comfortable reading at night</div></div>
          <button className="btn btn--ghost" onClick={toggleTheme} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            {theme === "light" ? <><IconMoon size={16} /> Off</> : <><IconSun size={16} /> On</>}
          </button>
        </div>
      </div>

      <div className="xref-card">
        <b>Text size</b>
        <div className="xref-card__text" style={{ marginBottom: "0.6rem" }}>Adjust reading comfort</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button className="btn btn--ghost" onClick={() => setScale(scale - 0.1)}>A−</button>
          <div style={{ flex: 1, textAlign: "center", fontSize: `${scale}rem` }}>Sample text</div>
          <button className="btn btn--ghost" onClick={() => setScale(scale + 0.1)}>A+</button>
        </div>
      </div>

      {/* #5: read-aloud voice + speed live here */}
      <div className="xref-card" id="audio">
        <b>Read aloud</b>
        <div className="xref-card__text" style={{ marginBottom: "0.7rem" }}>Voice and speed for chapter narration</div>
        <label className="set-row">
          <span>Voice</span>
          <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)}>
            <option value="">Device default</option>
            {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
          </select>
        </label>
        <label className="set-row">
          <span>Speed</span>
          <select value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}>
            {[0.75, 1, 1.25, 1.5, 1.75].map((s) => <option key={s} value={s}>{s}×</option>)}
          </select>
        </label>
        {voices.length === 0 ? <div className="xref-card__text" style={{ marginTop: "0.5rem" }}>No voices detected on this device/browser.</div> : null}
      </div>

      <div className="xref-card">
        <b>About</b>
        <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
<Link href="/about/presentation">Presentation</Link>
          <Link href="/about/preface">Preface</Link>
          <Link href="/about/introduction">General Introduction</Link>
          <Link href="/about/collaborators">Collaborators</Link>
          <Link href="/about/copyright">Copyright</Link>
          <Link href="/about/contact">Contact Us</Link>
        </div>
      </div>
    </main>
  );
}
