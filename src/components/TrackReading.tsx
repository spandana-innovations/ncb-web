"use client";
import { useEffect } from "react";

export default function TrackReading({ chapterId, label }: { chapterId: number; label: string }) {
  useEffect(() => {
    try {
      const entry = { chapterId, label, at: Date.now() };
      const raw = localStorage.getItem("ncb-history");
      let hist: any[] = raw ? JSON.parse(raw) : [];
      hist = hist.filter((h) => h.chapterId !== chapterId);
      hist.unshift(entry);
      localStorage.setItem("ncb-history", JSON.stringify(hist.slice(0, 20)));
    } catch {}
  }, [chapterId, label]);
  return null;
}
