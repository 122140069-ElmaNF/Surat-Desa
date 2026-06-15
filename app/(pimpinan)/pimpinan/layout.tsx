import PimpinanSidebar from "@/app/components/PimpinanSidebar";

export default function PimpinanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <PimpinanSidebar />

      <div className="admin-content">
        <div className="topbar">
          <h1>Dashboard Pimpinan</h1>
        </div>

        {children}
      </div>
    </div>
  );
}
