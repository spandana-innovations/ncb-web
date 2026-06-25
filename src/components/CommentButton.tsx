"use client";
import { useEffect, useRef, useState } from "react";
import { IconComment, IconClose } from "./Icons";
import Portal from "./Portal";

export default function CommentButton({ title, content, disabled }: {
  title: string; content: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [open]);

  return (
    <>
      <button
        className={`verse__action${disabled ? " verse__action--off" : ""}`}
        onClick={disabled ? undefined : () => setOpen(true)}
        disabled={disabled}
        aria-label="Read commentary"
      >
        <IconComment size={15} />
      </button>

      {open && !disabled ? (
        <Portal>
          <div className="xref-modal" role="dialog" aria-modal="true">
            <div className="xref-modal__head">
              <h2 className="xref-modal__title">{title || "Commentary"}</h2>
              <button className="xref-modal__close" onClick={() => setOpen(false)} aria-label="Close">
                <IconClose size={22} />
              </button>
            </div>
            <div className="xref-modal__body" ref={bodyRef}>
              <article className="commentary-full" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
}
