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
      <div className="page-header">
        <div>
          <h1 className="page-title">Detail Surat</h1>
          <p className="page-subtitle">
            {surat.kode_tracking}
          </p>
        </div>

        <div className="action-row">
          <Link href="/admin/surat">
            <button style={buttonStyle}>Kembali</button>
          </Link>
          <Link href={`/admin/preview/${surat.id}`}>
            <button style={primaryButtonStyle}>Preview</button>
          </Link>
        </div>
      </div>

      <section className="card">
        <InfoRow label="Kode Tracking" value={surat.kode_tracking} />
        <InfoRow label="Jenis Surat" value={surat.nama_surat || "-"} />
        <InfoRow label="Status" value={surat.status} />
        <InfoRow label="Tanggal" value={formatTanggal(surat.created_at)} />
      </section>

      <section className="card" style={{ marginTop: "18px" }}>
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
    <div className="info-row">
      <span className="info-row-label">{label}</span>
      <span className="info-row-value">
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
