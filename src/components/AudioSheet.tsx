"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSettings } from "./Settings";
import { recordPlayed } from "./playedHistory";
import { IconPlay, IconPause, IconClose, IconSettings, IconVolume, IconVolumeMute } from "./Icons";

type V = { id: number; verseNo: string; text: string };
type State = "idle" | "playing" | "paused";

export default function AudioSheet({
  verses, bookName, chapterName, chapterId,
  prevChapterId, nextChapterId,
  onActiveVerse, open, setOpen, startIdx,
}: {
  verses: V[]; bookName: string; chapterName: string; chapterId: number;
  prevChapterId: number | null; nextChapterId: number | null;
  onActiveVerse: (n: string | null) => void;
  open: boolean; setOpen: (v: boolean) => void;
  startIdx?: number | null;
}) {
  const { voiceURI, rate, muted, toggleMuted } = useSettings();
  const [state, setState] = useState<State>("idle");
  const [idx, setIdx] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const startedRef = useRef(false);

  // load voices once
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    synthRef.current = window.speechSynthesis;
    const load = () => setVoices(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith("en")));
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // speak a single verse, then advance
  const speakVerse = useCallback((i: number) => {
    const synth = synthRef.current;
    if (!synth || i >= verses.length) { setState("idle"); setIdx(0); onActiveVerse(null); return; }
    synth.cancel();
    setIdx(i);
    onActiveVerse(verses[i].verseNo);
    const u = new SpeechSynthesisUtterance(verses[i].text);
    const chosen = synth.getVoices().find(v => v.voiceURI === voiceURI)
      || synth.getVoices().find(v => v.lang.startsWith("en"));
    if (chosen) u.voice = chosen;
    u.rate = rate;
    u.volume = muted ? 0 : 1;
    u.onend = () => speakVerse(i + 1);
    u.onerror = () => { setState("idle"); onActiveVerse(null); };
    synth.speak(u);
    setState("playing");
  }, [verses, voiceURI, rate, muted, onActiveVerse]);

  // when sheet opens with a startIdx, begin from that verse
  useEffect(() => {
    if (open && startIdx != null && !startedRef.current) {
      startedRef.current = true;
      recordPlayed(chapterId, `${bookName} · ${chapterName}`);
      speakVerse(startIdx);
    }
    if (!open) startedRef.current = false;
  }, [open, startIdx]); // eslint-disable-line

  function play() {
    if (state === "paused") { synthRef.current?.resume(); setState("playing"); }
    else speakVerse(idx);
  }
  function pause() { synthRef.current?.pause(); setState("paused"); }
  function stop() { synthRef.current?.cancel(); setState("idle"); setIdx(0); onActiveVerse(null); }
  function prev() { speakVerse(Math.max(0, idx - 1)); }
  function next() { speakVerse(Math.min(idx + 1, verses.length - 1)); }
  function goTo(i: number) { speakVerse(i); }

  const progress = verses.length ? (idx / verses.length) * 100 : 0;
  const voiceName = voices.find(v => v.voiceURI === voiceURI)?.name || voices[0]?.name || "Default";
  const isPlaying = state === "playing";

  // mini-bar: fixed above tab bar, shown when playing/paused but sheet is closed
  const showMini = !open && state !== "idle";

  return (
    <>
      {/* ── Mini bar ── */}
      {showMini ? (
        <div className="player-mini" onClick={() => setOpen(true)}>
          <button
            className="player-mini__pp"
            onClick={e => { e.stopPropagation(); isPlaying ? pause() : play(); }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <IconPause size={16} /> : <IconPlay size={16} />}
          </button>
          <div className="player-mini__info">
            <span className="player-mini__title">{bookName} · {chapterName}</span>
            <span className="player-mini__verse">Verse {idx + 1} of {verses.length}</span>
          </div>
          <button
            className="player-mini__stop"
            onClick={e => { e.stopPropagation(); stop(); setOpen(false); }}
            aria-label="Stop"
          >
            <IconClose size={14} />
          </button>
        </div>
      ) : null}

      {/* ── Full player sheet ── */}
      {open ? (<div className="audio-sheet show" role="dialog" aria-label="Audio player">

        {/* top row */}
        <div className="audio-sheet__top">
          <button className="audio-sheet__ic" onClick={toggleMuted} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? <IconVolumeMute size={20} /> : <IconVolume size={20} />}
          </button>
          <div className="audio-sheet__title-row">
            <span className="audio-sheet__book">{bookName}</span>
            <span className="audio-sheet__chapter">{chapterName}</span>
          </div>
          <button className="audio-sheet__ic" onClick={() => setOpen(false)} aria-label="Close">
            <IconClose size={20} />
          </button>
        </div>

        {/* verse status */}
        <div className="audio-sheet__status">
          {state === "idle" ? "Ready — press play" : `Verse ${idx + 1} of ${verses.length}`}
        </div>

        {/* progress bar */}
        <div className="audio-sheet__bar" role="progressbar" aria-valuenow={progress}>
          <div className="audio-sheet__bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* controls row */}
        <div className="audio-sheet__controls">
          {/* prev chapter */}
          <button
            className="audio-sheet__nav"
            onClick={() => prevChapterId && (window.location.href = `/read/${prevChapterId}`)}
            disabled={!prevChapterId}
            aria-label="Previous chapter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20"/>
              <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* prev verse */}
          <button className="audio-sheet__skip" onClick={prev} disabled={state === "idle"} aria-label="Previous verse">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>
            </svg>
          </button>

          {/* play / pause */}
          <button
            className="audio-sheet__pp"
            onClick={() => isPlaying ? pause() : play()}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <IconPause size={28} /> : <IconPlay size={28} />}
          </button>

          {/* next verse */}
          <button className="audio-sheet__skip" onClick={next} disabled={state === "idle"} aria-label="Next verse">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
            </svg>
          </button>

          {/* next chapter */}
          <button
            className="audio-sheet__nav"
            onClick={() => nextChapterId && (window.location.href = `/read/${nextChapterId}`)}
            disabled={!nextChapterId}
            aria-label="Next chapter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4"/>
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* footer: voice info + stop + settings link */}
        <div className="audio-sheet__footer">
          <span className="audio-sheet__voice-label">🔊 {voiceName} · {rate}×</span>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <Link href="/settings#audio" className="audio-sheet__settings-link">
              <IconSettings size={16} />
            </Link>
            <button className="audio-sheet__stop-btn" onClick={() => { stop(); setOpen(false); }} aria-label="Stop">
              Stop
            </button>
          </div>
        </div>

      </div>) : null}
    </>
  );
}
