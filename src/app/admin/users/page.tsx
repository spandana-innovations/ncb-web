import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersAdmin() {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div><h1>Admin Users</h1><p>All users have full access to content management.</p></div>
        <Link href="/admin/users/new" className="adm-btn adm-btn--primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add user
        </Link>
      </div>
      <div className="adm-user-grid">
        {users.map((u: any) => (
          <div key={u.id} className="adm-user-card">
            <div className="adm-user-card__avatar">
              {(u.name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div className="adm-user-card__info">
              <div className="adm-user-card__name">{u.name}</div>
              <div className="adm-user-card__email">{u.email}</div>
              {u.createdAt && (
                <div style={{ fontSize: ".7rem", color: "var(--adm-softer)", marginTop: ".2rem" }}>
                  Since {new Date(u.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                </div>
              )}
            </div>
            <div className="adm-user-card__actions">
              <Link href={`/admin/users/${u.id}`} className="adm-btn adm-btn--ghost adm-btn--sm">Edit</Link>
              <Link href={`/admin/users/${u.id}/password`} className="adm-btn adm-btn--gray adm-btn--sm">Password</Link>
              <form action={deleteUser.bind(null, u.id)} style={{ display: "inline" }}>
                <button type="submit" className="adm-btn adm-btn--danger adm-btn--sm"
                  onClick={(e: any) => { if (!confirm(`Delete ${u.name}?`)) e.preventDefault(); }}>
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
