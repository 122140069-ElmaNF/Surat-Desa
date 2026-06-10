import Link from "next/link";
import db from "@/lib/db";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminDetailSuratPage({ params }: PageProps) {
  const { id } = await params;

  const [[surat]] = await db.query(
    `SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      ps.created_at,
      js.nama_surat
    FROM pengajuan_surat ps
    LEFT JOIN jenis_surat js ON js.id = ps.jenis_surat_id
    WHERE ps.id = ?
    LIMIT 1`,
    [id]
  );

  const [details] = await db.query(
    `SELECT fs.label_field, fs.nama_field, dp.value
    FROM detail_pengajuan dp
    JOIN field_surat fs ON fs.id = dp.field_id
    WHERE dp.pengajuan_id = ?
    ORDER BY fs.id ASC`,
    [id]
  );

  if (!surat) {
    return <div style={{ color: "#991b1b" }}>Data surat tidak ditemukan.</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#111827" }}>
            Detail Surat
          </h1>
          <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
            {surat.kode_tracking}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin/surat">
            <button style={buttonStyle}>Kembali</button>
          </Link>
          <Link href={`/admin/preview/${surat.id}`}>
            <button style={primaryButtonStyle}>Preview</button>
          </Link>
        </div>
      </div>

      <section style={cardStyle}>
        <InfoRow label="Kode Tracking" value={surat.kode_tracking} />
        <InfoRow label="Jenis Surat" value={surat.nama_surat || "-"} />
        <InfoRow label="Status" value={surat.status} />
        <InfoRow label="Tanggal" value={formatTanggal(surat.created_at)} />
      </section>

      <section style={{ ...cardStyle, marginTop: "18px" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: "20px", color: "#111827" }}>
          Data Pemohon
        </h2>
        {(details as { label_field: string; nama_field: string; value: string }[]).map(
          (detail) => (
            <InfoRow
              key={detail.nama_field}
              label={detail.label_field}
              value={detail.value || "-"}
            />
          )
        )}
      </section>
    </div>
  );
}

const cardStyle = {
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "22px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
};

const buttonStyle = {
  padding: "10px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 600,
};

const primaryButtonStyle = {
  ...buttonStyle,
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        padding: "11px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span style={{ color: "#6b7280", fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#111827", fontWeight: 600, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function formatTanggal(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
