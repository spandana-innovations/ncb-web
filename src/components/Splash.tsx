"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Splash() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    if (sessionStorage.getItem("ncb-splash")) { setPhase("gone"); return; }
    const t1 = setTimeout(() => setPhase("fade"), 1800);
    const t2 = setTimeout(() => {
      setPhase("gone");
      sessionStorage.setItem("ncb-splash", "1");
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "gone") return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(145deg, #8f0e15 0%, #e41f2c 55%, #ff3b47 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem",
      opacity: phase === "fade" ? 0 : 1,
      transition: "opacity 0.55s ease",
      pointerEvents: phase === "fade" ? "none" : "auto",
    }}>
      <Image
        src="/logo-full.png"
        alt="The New Community Bible"
        width={180} height={180}
        priority
        style={{ objectFit: "contain", filter: "drop-shadow(0 8px 28px rgba(0,0,0,.3))" }}
      />
      <p style={{
        color: "rgba(255,255,255,.85)", fontSize: ".82rem", fontWeight: 600,
        letterSpacing: ".14em", textTransform: "uppercase", margin: 0,
        fontFamily: "-apple-system, Helvetica Neue, sans-serif",
      }}>
        The New Community Bible
      </p>
    </div>
  );
}
