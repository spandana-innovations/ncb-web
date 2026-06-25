"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type Voice = { name: string; lang: string; voiceURI: string };

export function useReadAloud(
  verses: { id: number; verseNo: string; text: string }[],
  opts: { voiceURI: string; rate: number; muted: boolean }
) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [voices, setVoices] = useState<Voice[]>([]);
  const idxRef = useRef(0);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const load = () => {
      const vs = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"))
        .map((v) => ({ name: v.name, lang: v.lang, voiceURI: v.voiceURI }));
      setVoices(vs);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const speakFrom = useCallback((start: number) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    if (start >= verses.length) { setSpeaking(false); setPaused(false); return; }
    const all = synth.getVoices();
    const chosen = all.find((v) => v.voiceURI === optsRef.current.voiceURI) || all.find((v) => v.lang.startsWith("en"));

    const speakOne = (i: number) => {
      if (i >= verses.length) { setSpeaking(false); setPaused(false); setIndex(0); idxRef.current = 0; return; }
      idxRef.current = i; setIndex(i);
      const u = new SpeechSynthesisUtterance(verses[i].text);
      if (chosen) u.voice = chosen;
      u.rate = optsRef.current.rate;
      u.volume = optsRef.current.muted ? 0 : 1;
      u.onend = () => { if (idxRef.current === i && !synth.paused) speakOne(i + 1); };
      synth.speak(u);
    };
    setSpeaking(true); setPaused(false);
    speakOne(start);
  }, [verses]);

  const play = useCallback(() => {
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else speakFrom(idxRef.current || 0);
  }, [paused, speakFrom]);
  const pause = useCallback(() => { window.speechSynthesis.pause(); setPaused(true); }, []);
  const stop = useCallback(() => { window.speechSynthesis.cancel(); setSpeaking(false); setPaused(false); idxRef.current = 0; setIndex(0); }, []);
  const next = useCallback(() => speakFrom(Math.min(idxRef.current + 1, verses.length - 1)), [speakFrom, verses.length]);
  const prev = useCallback(() => speakFrom(Math.max(idxRef.current - 1, 0)), [speakFrom]);

  const playFrom = (i: number) => speakFrom(i);
  return { supported, speaking, paused, index, voices, play, pause, stop, next, prev, playFrom };
}
