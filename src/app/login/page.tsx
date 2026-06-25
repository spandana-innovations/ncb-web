"use client";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../../app/admin/admin.css";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setBusy(false);
    if (res?.error) { setError("Email or password is incorrect."); return; }
    router.push(callbackUrl);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--adm-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        {/* Logo / brand */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "var(--adm-red)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: ".75rem" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13"/>
            </svg>
          </div>
          <h1 style={{ font: "700 1.2rem var(--adm-sans)", margin: 0 }}>NCB Admin</h1>
          <p style={{ font: "normal .82rem var(--adm-sans)", color: "var(--adm-soft)", margin: ".25rem 0 0" }}>The New Community Bible</p>
        </div>

        <div className="adm-card">
          <div className="adm-card__head"><h2>Sign in to continue</h2></div>
          <div className="adm-card__body">
            <form onSubmit={submit} className="adm-form">
              <div className="adm-field">
                <label className="adm-label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="username" required className="adm-input" placeholder="you@example.com" />
              </div>
              <div className="adm-field">
                <label className="adm-label">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" required className="adm-input" placeholder="••••••••" />
              </div>
              {error && <p style={{ color: "#c00", font: "normal .82rem var(--adm-sans)", margin: 0 }}>{error}</p>}
              <button type="submit" className="adm-btn adm-btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
