import AdminSidebar from "@/app/components/AdminSidebar";
import SessionGuard from "@/app/components/SessionGuard";

import "@/app/styles/admin.css";
import "@/app/styles/sidebar.css";
import "@/app/styles/table.css";
import "@/app/styles/dashboard.css";
import "@/app/styles/detail.css";
import "@/app/styles/form.css";
import "@/app/styles/responsive.css";
import "@/app/styles/button.css";

import { redirect } from "next/navigation";
import { getValidSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // =========================
  // VALIDASI SESSION
  // =========================

  const user = await getValidSession();

  // Kalau session sudah tidak valid
  // atau role akun sudah berubah
  if (!user) {
    redirect("/api/logout?redirect=/login");
  }

  // =========================
  // DATA USER
  // =========================

  const nama = user.nama;

  const role =
    user.role === "staff_admin"
      ? "Administrator"
      : user.role === "kepala_desa"
      ? "Kepala Desa"
      : user.role === "ex_kepala_desa"
      ? "Ex Kepala Desa"
      : "Administrator";

  const isSuperAdmin =
    Boolean(user.is_super_admin);

  // =========================
  // LAYOUT
  // =========================

  return (
    <div className="admin-layout">

      {/* =========================
          SESSION GUARD
      ========================= */}

      <SessionGuard />

      {/* =========================
          SIDEBAR
      ========================= */}

      <AdminSidebar
        isSuperAdmin={isSuperAdmin}
      />

      {/* =========================
          CONTENT
      ========================= */}

      <div className="admin-content">

        {/* =========================
            TOPBAR
        ========================= */}

        <header className="topbar">

          <div>
            <h1 className="topbar-title">
              Dashboard Admin
            </h1>

            <p className="topbar-subtitle">
              Sistem Informasi Surat Desa
            </p>
          </div>

          {/* USER */}
          <div className="topbar-user">

            <div>
              <h3>{nama}</h3>

              <span>
                {isSuperAdmin
                  ? "Super Administrator"
                  : role}
              </span>
            </div>

            <div className="user-avatar">
              {nama
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>

        {/* =========================
            PAGE
        ========================= */}

        <main>
          {children}
        </main>

      </div>
    </div>
  );
}