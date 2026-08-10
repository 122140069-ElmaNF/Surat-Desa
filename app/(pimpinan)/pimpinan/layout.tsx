import PimpinanSidebar from "@/app/components/PimpinanSidebar";
import SessionGuard from "@/app/components/SessionGuard";
import "@/app/styles/admin.css";
import { redirect } from "next/navigation";
import { getValidSession } from "@/lib/auth";

export default async function PimpinanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getValidSession();

  if (!user) {
    redirect("/api/logout?redirect=/login");
  }

  if (user.role !== "kepala_desa") {
    redirect("/login");
  }

  const nama = user.nama;

  return (
    <div className="admin-layout">

      <SessionGuard />

      <PimpinanSidebar />

      <div className="admin-content">

        <header className="topbar">
          <div>
            <h1 className="topbar-title">
              Dashboard Kepala Desa
            </h1>

            <p className="topbar-subtitle">
              Sistem Informasi Surat Desa
            </p>
          </div>

          <div className="topbar-user">
            <div>
              <h3>{nama}</h3>
              <span>Kepala Desa</span>
            </div>

            <div className="user-avatar">
              {nama.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main>
          {children}
        </main>

      </div>
    </div>
  );
}