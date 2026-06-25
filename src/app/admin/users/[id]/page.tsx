import { saveUser } from "../actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditUser({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!u) notFound();
  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div>
          <div style={{ fontSize: ".78rem", color: "var(--adm-soft)", marginBottom: ".25rem" }}>
            <Link href="/admin/users">Users</Link> › Edit
          </div>
          <h1>{u.name}</h1>
          <p>{u.email}</p>
        </div>
      </div>
      <form action={saveUser}>
        <input type="hidden" name="id" value={u.id} />
        <div className="adm-card" style={{ marginBottom: "1rem" }}>
          <div className="adm-card__head"><h2>User details</h2></div>
          <div className="adm-card__body">
            <div className="adm-form">
              <div className="adm-form-row">
                <div className="adm-field">
                  <label className="adm-label">Full name</label>
                  <input name="name" defaultValue={u.name} className="adm-input" required />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Email</label>
                  <input name="email" type="email" defaultValue={u.email} className="adm-input" required />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: ".75rem" }}>
          <button type="submit" className="adm-btn adm-btn--primary">Save changes</button>
          <Link href={`/admin/users/${u.id}/password`} className="adm-btn adm-btn--gray">Change password</Link>
          <Link href="/admin/users" className="adm-btn adm-btn--gray">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
