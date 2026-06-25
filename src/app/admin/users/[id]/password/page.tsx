import { resetPassword } from "../../actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!u) notFound();
  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div>
          <div style={{ fontSize: ".78rem", color: "var(--adm-soft)", marginBottom: ".25rem" }}>
            <Link href="/admin/users">Users</Link> › <Link href={`/admin/users/${u.id}`}>{u.name}</Link> › Reset password
          </div>
          <h1>Reset password</h1>
          <p>Set a new password for {u.name} ({u.email})</p>
        </div>
      </div>
      <form action={resetPassword}>
        <input type="hidden" name="id" value={u.id} />
        <div className="adm-card" style={{ marginBottom: "1rem" }}>
          <div className="adm-card__head"><h2>New password</h2></div>
          <div className="adm-card__body">
            <div className="adm-form">
              <div className="adm-form-row">
                <div className="adm-field">
                  <label className="adm-label">New password</label>
                  <input name="password" type="password" className="adm-input" required placeholder="Min. 8 characters" minLength={8} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Confirm new password</label>
                  <input name="confirmPassword" type="password" className="adm-input" required placeholder="Repeat password" minLength={8} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: ".75rem" }}>
          <button type="submit" className="adm-btn adm-btn--primary">Update password</button>
          <Link href={`/admin/users/${u.id}`} className="adm-btn adm-btn--gray">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
