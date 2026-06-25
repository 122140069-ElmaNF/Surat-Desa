import AdminSidebar from "@/app/components/AdminSidebar";
import "@/app/styles/admin.css";
import { cookies } from "next/headers";

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