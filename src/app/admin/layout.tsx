import "./admin.css";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-body">
      {/* Mobile block */}
      <div className="adm-mobile-block">
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🖥️</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: ".5rem" }}>Desktop only</h2>
        <p style={{ fontSize: ".9rem", opacity: .8, maxWidth: "260px", lineHeight: 1.6 }}>
          The NCB admin panel is designed for desktop use only. Please open it on a laptop or desktop computer.
        </p>
      </div>
      {/* Desktop shell */}
      <div className="adm-shell">
        <aside className="adm-sidebar"><AdminNav /></aside>
        <div className="adm-topbar">
          <div className="adm-topbar__crumb" id="adm-crumb" />
          <div className="adm-topbar__right">
            <span className="adm-topbar__user">NCB Admin</span>
          </div>
        </div>
        <div className="adm-content">{children}</div>
      </div>
    </div>
  );
}
