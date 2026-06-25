"use client";
import { useEffect, useRef, useState } from "react";
import { IconClose, IconShare } from "./Icons";

type Style = { name: string; draw: (ctx: CanvasRenderingContext2D, W: number, H: number, text: string, ref: string, logo: HTMLImageElement | null) => void };

const STYLES: Style[] = [
  {
    name: "Classic Red",
    draw(ctx, W, H, text, ref, logo) {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#8f0e15"); g.addColorStop(1, "#e41f2c");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (logo) { ctx.globalAlpha = 0.09; ctx.drawImage(logo, W - 640, H - 640, 620, 620); ctx.globalAlpha = 1; }
      drawText(ctx, W, H, text, ref, "#fff", "rgba(255,255,255,.8)", "rgba(255,255,255,.6)");
      if (logo) { ctx.drawImage(logo, W - 150, H - 120, 90, 90); }
      ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.font = "500 28px Helvetica"; ctx.textAlign = "left";
      ctx.fillText("NEW COMMUNITY BIBLE", 100, H - 65);
    },
  },
  {
    name: "Night Ink",
    draw(ctx, W, H, text, ref, logo) {
      ctx.fillStyle = "#0d0d0d"; ctx.fillRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, 400);
      g.addColorStop(0, "rgba(228,31,44,.35)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, 400);
      if (logo) { ctx.globalAlpha = 0.07; ctx.drawImage(logo, W - 620, H - 620, 600, 600); ctx.globalAlpha = 1; }
      drawText(ctx, W, H, text, ref, "#f5f5f5", "rgba(245,245,245,.75)", "rgba(228,31,44,.9)");
      ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.font = "500 28px Helvetica"; ctx.textAlign = "left";
      ctx.fillText("NEW COMMUNITY BIBLE", 100, H - 65);
    },
  },
  {
    name: "Pure Light",
    draw(ctx, W, H, text, ref, logo) {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f5f5f7"; ctx.fillRect(0, H - 160, W, 160);
      const accent = "#e41f2c";
      ctx.fillStyle = accent; ctx.fillRect(80, 120, 6, H - 280);
      if (logo) { ctx.globalAlpha = 0.06; ctx.drawImage(logo, W - 580, 200, 500, 500); ctx.globalAlpha = 1; }
      drawText(ctx, W, H, text, ref, "#1c1c1e", "rgba(28,28,30,.7)", accent, 110);
      ctx.fillStyle = "#1c1c1e"; ctx.font = "500 28px Helvetica"; ctx.textAlign = "left";
      ctx.fillText("NEW COMMUNITY BIBLE", 110, H - 65);
    },
  },
  {
    name: "Gold & Crimson",
    draw(ctx, W, H, text, ref, logo) {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#1a0e05"); g.addColorStop(0.5, "#3d1a08"); g.addColorStop(1, "#1a0e05");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // gold border frame
      ctx.strokeStyle = "#c9973a"; ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, W - 80, H - 80);
      ctx.strokeStyle = "rgba(201,151,58,.4)"; ctx.lineWidth = 2;
      ctx.strokeRect(54, 54, W - 108, H - 108);
      if (logo) { ctx.globalAlpha = 0.1; ctx.drawImage(logo, W / 2 - 280, H / 2 - 280, 560, 560); ctx.globalAlpha = 1; }
      drawText(ctx, W, H, text, ref, "#f9e8c0", "rgba(249,232,192,.8)", "#c9973a");
      ctx.fillStyle = "rgba(201,151,58,.75)"; ctx.font = "500 28px Helvetica"; ctx.textAlign = "left";
      ctx.fillText("NEW COMMUNITY BIBLE", 100, H - 65);
    },
  },
];

function drawText(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  text: string, ref: string, textColor: string, refColor: string, accentColor: string, xOffset = 100
) {
  ctx.fillStyle = textColor;
  ctx.font = "500 52px Georgia, serif";
  ctx.textAlign = "left";
  const words = text.split(" "); const lines: string[] = []; let line = "";
  const maxW = W - xOffset * 2 - 40;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  const lh = 74; const blockH = lines.length * lh;
  let y = (H - blockH) / 2 - 30;
  for (const l of lines) { ctx.fillText(l, xOffset, y); y += lh; }
  ctx.fillStyle = accentColor;
  ctx.font = "bold 36px Georgia, serif";
  ctx.fillText(ref.toUpperCase(), xOffset, y + 55);
}

export default function ShareVerseImage({ ref: vref, text, onClose }: { ref: string; text: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [styleIdx, setStyleIdx] = useState(0);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const touchStartX = useRef(0);

  // load logo once
  useEffect(() => {
    const img = new Image(); img.src = "/logo-grey.png";
    img.onload = () => setLogoImg(img);
    img.onerror = () => setLogoImg(null);
  }, []);

  // redraw on style or logo change
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const W = 1080, H = 1080; canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    STYLES[styleIdx].draw(ctx, W, H, text, vref, logoImg);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [styleIdx, logoImg, text, vref]);

  // swipe gesture on canvas
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setStyleIdx(i => (i + 1) % STYLES.length);
    else setStyleIdx(i => (i - 1 + STYLES.length) % STYLES.length);
  }

  async function save() {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `${vref.replace(/[^a-z0-9]+/gi, "-")}.png`; a.click();
  }
  async function share() {
    const c = canvasRef.current; if (!c) return;
    c.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], "verse.png", { type: "image/png" });
      try {
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: vref });
        else save();
      } catch { save(); }
    }, "image/png");
  }

  return (
    <div className="xref-modal" role="dialog" aria-modal="true">
      <div className="xref-modal__head">
        <h2 className="xref-modal__title">Share verse</h2>
        <button className="xref-modal__close" onClick={onClose} aria-label="Close"><IconClose size={22} /></button>
      </div>
      <div className="xref-modal__body" ref={bodyRef} style={{ padding: "1rem" }}>
        {/* swipe hint */}
        <p style={{ textAlign: "center", fontSize: ".75rem", color: "var(--ink-soft)", marginBottom: ".6rem" }}>
          ← Swipe to change style · {STYLES[styleIdx].name}
        </p>

        {/* style dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: ".45rem", marginBottom: ".85rem" }}>
          {STYLES.map((s, i) => (
            <button key={i} onClick={() => setStyleIdx(i)} aria-label={s.name}
              style={{ width: i === styleIdx ? "1.6rem" : ".55rem", height: ".55rem", borderRadius: "6px",
                       background: i === styleIdx ? "var(--ncb-red)" : "var(--ink-softer)",
                       border: "none", cursor: "pointer", transition: "all .2s", padding: 0 }} />
          ))}
        </div>

        <canvas
          ref={canvasRef}
          className="share-canvas"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "pan-y" }}
        />

        <div className="share-actions" style={{ marginTop: "1rem" }}>
          <button className="btn btn--ghost" onClick={save}>Save image</button>
          <button className="btn" onClick={share} style={{ display: "inline-flex", gap: ".4rem", alignItems: "center" }}>
            <IconShare size={16} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
