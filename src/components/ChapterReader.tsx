"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import VerseActions from "./VerseActions";
import CrossRefButton from "./CrossRefButton";
import CommentButton from "./CommentButton";
import JumpToVerse from "./JumpToVerse";
import ShareVerseImage from "./ShareVerseImage";
import AudioSheet from "./AudioSheet";
import Portal from "./Portal";
import { IconSearch, IconClose, IconImage, IconPlay } from "./Icons";

export type VerseData = {
  id: number; verseNo: string; html: string; text: string;
  hasXref: boolean; xrefCount: number; commentaryTitle: string | null; commentaryContent: string | null;
};

function highlightText(text: string, q: string, curWordKey: string, makeKey: () => string) {
  if (!q) return text;
  const parts: React.ReactNode[] = [];
  const lower = text.toLowerCase(), ql = q.toLowerCase();
  let i = 0;
  while (i < text.length) {
    const found = lower.indexOf(ql, i);
    if (found === -1) { parts.push(text.slice(i)); break; }
    parts.push(text.slice(i, found));
    const key = makeKey();
    parts.push(<mark key={key} className={key === curWordKey ? "cur" : ""}>{text.slice(found, found + q.length)}</mark>);
    i = found + q.length;
  }
  return parts;
}

export default function ChapterReader({ verses, chapterId, bookName, chapterName, prevId, nextId }: {
  verses: VerseData[]; chapterId: number; bookName: string; chapterName: string;
  prevId: number | null; nextId: number | null;
}) {
  const [activeVerse, setActiveVerse] = useState<string | null>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [find, setFind] = useState("");
  const [curMatch, setCurMatch] = useState(0);
  const [shareVerse, setShareVerse] = useState<VerseData | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playFromIdx, setPlayFromIdx] = useState<number | null>(null);

  useEffect(() => {
    if (activeVerse) document.getElementById(`v${activeVerse}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeVerse]);

  const readAloudVerses = useMemo(() => verses.map((v) => ({ id: v.id, verseNo: v.verseNo, text: v.text })), [verses]);

  function playFromVerse(i: number) { setPlayFromIdx(i); setPlayerOpen(true); }

  const matches = useMemo(() => {
    if (find.trim().length < 1) return [] as { verseNo: string }[];
    const ql = find.toLowerCase(); const list: { verseNo: string }[] = [];
    for (const v of verses) { const t = v.text.toLowerCase(); let idx = 0; while ((idx = t.indexOf(ql, idx)) !== -1) { list.push({ verseNo: v.verseNo }); idx += ql.length; } }
    return list;
  }, [find, verses]);

  useEffect(() => { setCurMatch(0); }, [find]);
  useEffect(() => {
    if (matches[curMatch]) document.getElementById(`v${matches[curMatch].verseNo}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [curMatch, matches]);

  const curWordKey = matches[curMatch] ? `${matches[curMatch].verseNo}-${matches.slice(0, curMatch).filter((m) => m.verseNo === matches[curMatch].verseNo).length}` : "";

  return (
    <>
      <div className="title-row">
        <h1 className="title" style={{ margin: 0 }}>{chapterName}</h1>
        <button className="title-play" onClick={() => setPlayerOpen(true)} aria-label="Open read-aloud player"><IconPlay size={18} /></button>
        <button className="title-find" onClick={() => setFindOpen((v) => !v)} aria-label="Find in chapter"><IconSearch size={18} /></button>
      </div>

      {findOpen ? (
        <div className="findbar">
          <span className="sbox__icon"><IconSearch size={16} /></span>
          <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find in this chapter…" autoFocus />
          {find ? <span className="findbar__cnt">{matches.length ? `${curMatch + 1} of ${matches.length}` : "0"}</span> : null}
          <button className="findbar__nav" onClick={() => setCurMatch((c) => (c - 1 + matches.length) % (matches.length || 1))} disabled={!matches.length}>↑</button>
          <button className="findbar__nav" onClick={() => setCurMatch((c) => (c + 1) % (matches.length || 1))} disabled={!matches.length}>↓</button>
          <button className="findbar__nav" onClick={() => { setFind(""); setFindOpen(false); }}><IconClose size={16} /></button>
        </div>
      ) : null}

      <JumpToVerse verseNumbers={verses.map((v) => v.verseNo)} activeVerse={activeVerse} />

      <div className="verse-list">
        {verses.map((v, i) => {
          const ref = `${bookName} ${chapterName}:${v.verseNo}`;
          const isActive = activeVerse === v.verseNo;
          let localKey = 0; const makeKey = () => `${v.verseNo}-${localKey++}`;
          const hasCommentary = !!(v.commentaryContent && v.commentaryContent.trim());
          return (
            <div key={v.id} id={`v${v.verseNo}`} className={`verse-row${i % 2 === 1 ? " verse-row--alt" : ""}${isActive ? " verse-row--reading" : ""}`}>
                <p className="verse">
                  <span className="verse__no">{v.verseNo}</span>
                  <span className="verse__body">
                    {find.trim() ? highlightText(v.text, find.trim(), curWordKey, makeKey) : <span dangerouslySetInnerHTML={{ __html: v.html }} />}
                  </span>
                </p>
                <span className="verse__actions">
                  <button className="verse__action" onClick={() => playFromVerse(i)} aria-label="Read from this verse"><IconPlay size={15} /></button>
                  <VerseActions bookmark={{ verseId: v.id, ref, chapterId, text: v.text }} />
                  <button className="verse__action" onClick={() => setShareVerse(v)} aria-label="Share as image"><IconImage size={15} /></button>
                  <CrossRefButton verseId={v.id} label={ref} count={v.hasXref ? v.xrefCount : 0} />
                  <CommentButton title={(v.commentaryTitle || "").replace(/<[^>]+>/g, "")} content={v.commentaryContent || ""} disabled={!hasCommentary} />
                </span>
            </div>
          );
        })}
      </div>

      <Portal>
        <AudioSheet
          verses={readAloudVerses}
          bookName={bookName}
          chapterName={chapterName}
          chapterId={chapterId}
          prevChapterId={prevId}
          nextChapterId={nextId}
          onActiveVerse={setActiveVerse}
          open={playerOpen}
          setOpen={setPlayerOpen}
          startIdx={playFromIdx}
        />
      </Portal>

      {shareVerse ? (
        <Portal>
          <ShareVerseImage ref={`${bookName} ${chapterName}:${shareVerse.verseNo}`} text={shareVerse.text} onClose={() => setShareVerse(null)} />
        </Portal>
      ) : null}
    </>
  );
}
