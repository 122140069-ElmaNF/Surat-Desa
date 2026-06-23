import AdminSidebar from "@/app/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}