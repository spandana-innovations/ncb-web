"use client";
import { signOut, useSession } from "next-auth/react";

export default function SignOutButton() {
  const { data } = useSession();
  return (
    <div className="nav" style={{ marginBottom: "1rem", alignItems: "center" }}>
      {data?.user?.email ? <span style={{ color: "var(--ink-soft)" }}>{data.user.email}</span> : null}
      <button className="btn btn--ghost" onClick={() => signOut({ callbackUrl: "/login" })}>
        Sign out
      </button>
    </div>
  );
}
