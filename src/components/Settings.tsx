"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Ctx = {
  theme: Theme; toggleTheme: () => void;
  scale: number; setScale: (n: number) => void;
  muted: boolean; toggleMuted: () => void;
  voiceURI: string; setVoiceURI: (s: string) => void;
  rate: number; setRate: (n: number) => void;
};
const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [scale, setScaleState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [voiceURI, setVoiceURIState] = useState("");
  const [rate, setRateState] = useState(1);

  useEffect(() => {
    try {
      const t = localStorage.getItem("ncb-theme") as Theme | null;
      const s = parseFloat(localStorage.getItem("ncb-scale") ?? "1");
      const m = localStorage.getItem("ncb-muted") === "1";
      const v = localStorage.getItem("ncb-voice") ?? "";
      const r = parseFloat(localStorage.getItem("ncb-rate") ?? "1");
      if (t) setTheme(t);
      if (!Number.isNaN(s)) setScaleState(s);
      setMuted(m);
      setVoiceURIState(v);
      if (!Number.isNaN(r)) setRateState(r);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.setProperty("--font-scale", String(scale));
    try {
      localStorage.setItem("ncb-theme", theme);
      localStorage.setItem("ncb-scale", String(scale));
      localStorage.setItem("ncb-muted", muted ? "1" : "0");
      localStorage.setItem("ncb-voice", voiceURI);
      localStorage.setItem("ncb-rate", String(rate));
    } catch {}
  }, [theme, scale, muted, voiceURI, rate]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const setScale = (n: number) => setScaleState(Math.min(1.6, Math.max(0.8, n)));
  const toggleMuted = () => setMuted((m) => !m);
  const setVoiceURI = (s: string) => setVoiceURIState(s);
  const setRate = (n: number) => setRateState(n);

  return (
    <SettingsCtx.Provider value={{ theme, toggleTheme, scale, setScale, muted, toggleMuted, voiceURI, setVoiceURI, rate, setRate }}>
      {children}
    </SettingsCtx.Provider>
  );
}

export function useSettings() {
  const c = useContext(SettingsCtx);
  if (!c) throw new Error("useSettings must be used within SettingsProvider");
  return c;
}
