import { saveUser } from "../actions";
import Link from "next/link";

export default function NewUser() {
  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div>
          <div style={{ fontSize: ".78rem", color: "var(--adm-soft)", marginBottom: ".25rem" }}>
            <Link href="/admin/users">Users</Link> › New user
          </div>
          <h1>Add admin user</h1>
          <p>New users get immediate full access to all content.</p>
        </div>
      </div>
      <form action={saveUser}>
        <div className="adm-card" style={{ marginBottom: "1rem" }}>
          <div className="adm-card__head"><h2>User details</h2></div>
          <div className="adm-card__body">
            <div className="adm-form">
              <div className="adm-form-row">
                <div className="adm-field">
                  <label className="adm-label">Full name</label>
                  <input name="name" className="adm-input" required placeholder="Daniel Prabhu" />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Email</label>
                  <input name="email" type="email" className="adm-input" required placeholder="user@example.com" />
                </div>
              </div>
              <div className="adm-form-row">
                <div className="adm-field">
                  <label className="adm-label">Password</label>
                  <input name="password" type="password" className="adm-input" required placeholder="Min. 8 characters" minLength={8} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Confirm password</label>
                  <input name="confirmPassword" type="password" className="adm-input" required placeholder="Repeat password" minLength={8} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: ".75rem" }}>
          <button type="submit" className="adm-btn adm-btn--primary">Create user</button>
          <Link href="/admin/users" className="adm-btn adm-btn--gray">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
