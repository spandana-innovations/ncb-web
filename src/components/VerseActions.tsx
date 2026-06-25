"use client";
import { useBookmarks, type Bookmark } from "./Bookmarks";
import { IconStar, IconShare } from "./Icons";

export default function VerseActions({ bookmark }: { bookmark: Bookmark }) {
  const { isBookmarked, toggle } = useBookmarks();
  const marked = isBookmarked(bookmark.verseId);
  async function share() {
    const text = `${bookmark.ref}\n${bookmark.text}`;
    try {
      if (navigator.share) await navigator.share({ title: bookmark.ref, text });
      else { await navigator.clipboard.writeText(text); alert("Verse copied to clipboard"); }
    } catch {}
  }
  return (
    <span className="verse__actions">
      <button className={`verse__action${marked ? " active" : ""}`} onClick={() => toggle(bookmark)} aria-label={marked ? "Remove bookmark" : "Bookmark verse"}>
        <IconStar size={15} filled={marked} />
      </button>
      <button className="verse__action" onClick={share} aria-label="Share verse"><IconShare size={15} /></button>
    </span>
  );
}
