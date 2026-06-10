import Link from "next/link";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ tracking: string }>;
}) {
  const { tracking } = await params;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          width: "500px",
        }}
      >
        <h1>✅ Pengajuan Berhasil</h1>

        <p>
          Simpan kode tracking berikut untuk mengecek status surat Anda.
        </p>

        <div
          style={{
            marginTop: "20px",
            marginBottom: "20px",
            padding: "20px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #22c55e",
            borderRadius: "8px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#166534",
          }}
        >
          {tracking}
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link href="/">
            <button
              style={{
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Kembali
            </button>
          </Link>

          <Link href="/tracking">
            <button
              style={{
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Cek Status Surat
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}