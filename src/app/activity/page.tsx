"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBook, IconHeadphones, IconTrash } from "@/components/Icons";

type Entry = { chapterId: number; label: string; ts?: number };

export default function ActivityPage() {
  const [read, setRead] = useState<Entry[]>([]);
  const [played, setPlayed] = useState<Entry[]>([]);

  useEffect(() => {
    try { setRead(JSON.parse(localStorage.getItem("ncb-history") ?? "[]")); } catch {}
    try { setPlayed(JSON.parse(localStorage.getItem("ncb-played") ?? "[]")); } catch {}
  }, []);

  function clearRead() {
    localStorage.removeItem("ncb-history"); setRead([]);
  }
  function clearPlayed() {
    localStorage.removeItem("ncb-played"); setPlayed([]);
  }

  return (
    <main className="container reading">
      <p className="eyebrow">History</p>
      <h1 className="title">Recent Activity</h1>

      {/* Recently read */}
      <div className="activity-section">
        <div className="activity-section__head">
          <span className="activity-section__title"><IconBook size={16} /> Recently Read</span>
          {read.length > 0 && <button className="activity-clear" onClick={clearRead}><IconTrash size={14} /> Clear</button>}
        </div>
        {read.length === 0 ? (
          <p className="empty">No reading history yet.</p>
        ) : read.map((e, i) => (
          <Link key={i} href={`/read/${e.chapterId}`} className="activity-item">
            <span className="activity-item__label">{e.label}</span>
            <span className="activity-item__arrow">›</span>
          </Link>
        ))}
      </div>

      {/* Recently played */}
      <div className="activity-section">
        <div className="activity-section__head">
          <span className="activity-section__title"><IconHeadphones size={16} /> Recently Played</span>
          {played.length > 0 && <button className="activity-clear" onClick={clearPlayed}><IconTrash size={14} /> Clear</button>}
        </div>
        {played.length === 0 ? (
          <p className="empty">No audio history yet.</p>
        ) : played.map((e, i) => (
          <Link key={i} href={`/read/${e.chapterId}`} className="activity-item">
            <span className="activity-item__label">{e.label}</span>
            <span className="activity-item__arrow">›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
