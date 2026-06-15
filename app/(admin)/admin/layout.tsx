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
          <h1>Dashboard Admin</h1>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
