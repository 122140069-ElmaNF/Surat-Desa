import Link from "next/link";

export default function PimpinanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <header
        style={{
          backgroundColor: "#0f172a",
          color: "white",
          padding: "18px 28px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700 }}>
            Dashboard Pimpinan
          </div>

          <nav style={{ display: "flex", gap: "16px" }}>
            <Link
              href="/pimpinan"
              style={{ color: "white", textDecoration: "none" }}
            >
              Persetujuan Surat
            </Link>
            <Link
              href="/pimpinan/arsip"
              style={{ color: "white", textDecoration: "none" }}
            >
              Arsip Surat
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "28px" }}>
        {children}
      </main>
    </div>
  );
}
