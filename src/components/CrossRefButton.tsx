"use client";
import { useEffect, useRef, useState } from "react";
import { IconCrossRef, IconClose } from "./Icons";
import Portal from "./Portal";

type Ref = { verseId: number; ref: string; text: string };

export default function CrossRefButton({ verseId, label, count }: {
  verseId: number; label: string; count?: number;
}) {
  const [open, setOpen] = useState(false);
  const [refs, setRefs] = useState<Ref[] | null>(null);
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const disabled = !count;

  function openPanel() {
    setOpen(true);
    if (refs === null && !loading) {
      setLoading(true);
      fetch(`/api/verses/${verseId}/cross-references`)
        .then(r => r.json())
        .then(j => setRefs(j.data?.references ?? []))
        .catch(() => setRefs([]))
        .finally(() => setLoading(false));
    }
  }

  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [open]);

  return (
    <>
      <button
        className={`verse__action verse__action--xref${disabled ? " verse__action--off" : ""}`}
        onClick={disabled ? undefined : openPanel}
        disabled={disabled}
        aria-label={`Cross references${count ? ` (${count})` : ""}`}
      >
        <IconCrossRef size={15} />
        {count ? <span className="xref-badge">{count}</span> : null}
      </button>

      {open && !disabled ? (
        <Portal>
          <div className="xref-modal" role="dialog" aria-modal="true">
            <div className="xref-modal__head">
              <h2 className="xref-modal__title">Cross References</h2>
              <button className="xref-modal__close" onClick={() => setOpen(false)} aria-label="Close">
                <IconClose size={22} />
              </button>
            </div>
            <p className="xref-modal__ref">{label}</p>
            <div className="xref-modal__body" ref={bodyRef}>
              {loading ? <p className="empty">Loading…</p> : null}
              {refs?.length === 0 && !loading ? <p className="empty">No cross references for this verse.</p> : null}
              {refs?.map(r => (
                <div key={r.verseId} className="xref-card">
                  <div className="xref-card__ref">{r.ref}</div>
                  <div className="xref-card__text">{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
}
