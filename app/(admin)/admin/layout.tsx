import AdminSidebar from "@/app/components/AdminSidebar";
import "@/app/styles/admin.css";
import { cookies } from "next/headers";
import "@/app/styles/sidebar.css";
import "@/app/styles/table.css";
import "@/app/styles/dashboard.css";
import "@/app/styles/detail.css";
import "@/app/styles/form.css";
import "@/app/styles/responsive.css";
import "@/app/styles/button.css";

export default  async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

const cookieStore = await cookies();

const session =
cookieStore.get("session");

let nama = "Admin";
let role = "Administrator";

if (session) {
  const user = JSON.parse(session.value);
  nama = user.nama;
  role =
    user.role === "admin"
      ? "Administrator"
      : "Pimpinan";
}

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        <header className="topbar">
          <div>
              <h1 className="topbar-title">
                  Dashboard Admin
              </h1>
              <p className="topbar-subtitle">
                  Sistem Informasi Surat Desa
              </p>
          </div>
          <div className="topbar-user">
              <div>
                  <h3>
                      {nama}
                  </h3>
                  <span>
                      {role}
                  </span>
              </div>
              <div className="user-avatar">
                  {nama.charAt(0).toUpperCase()}
              </div>
          </div>
      </header>

        <main>{children}</main>
      </div>
    </div>
  );
}