import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <header
        style={{
          backgroundColor: "#111827",
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
            Admin Surat Desa
          </div>

          <nav style={{ display: "flex", gap: "16px" }}>
            <Link href="/admin" style={{ color: "white", textDecoration: "none" }}>
              Dashboard
            </Link>
            <Link
              href="/admin/surat"
              style={{ color: "white", textDecoration: "none" }}
            >
              Surat Masuk
            </Link>
            <Link
              href="/admin/buat-surat"
              style={{ color: "white", textDecoration: "none" }}
            >
              Buat Surat
            </Link>
            <Link
              href="/admin/arsip"
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
