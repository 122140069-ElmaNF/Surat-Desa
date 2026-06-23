import Link from "next/link";
import db from "@/lib/db";
import React from "react";

type PageProps = {
  params: Promise<{ id: string }>;
};

type DetailField = {
  label_field: string;
  nama_field: string;
  value: string;
};

export default async function AdminDetailSuratPage({
  params,
}: PageProps) {
  const { id } = await params;

  const [rows] = await db.query(
    `SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      ps.created_at,
      js.nama_surat
    FROM pengajuan_surat ps
    LEFT JOIN jenis_surat js
      ON js.id = ps.jenis_surat_id
    WHERE ps.id = ?
    LIMIT 1`,
    [id]
  );

  const surat = (rows as any[])[0];

  const [detailRows] = await db.query(
    `SELECT
      fs.label_field,
      fs.nama_field,
      dp.value
    FROM detail_pengajuan dp
    JOIN field_surat fs
      ON fs.id = dp.field_id
    WHERE dp.pengajuan_id = ?
    ORDER BY fs.id ASC`,
    [id]
  );

  const details = detailRows as DetailField[];

  if (!surat) {
    return (
      <div style={{ color: "#dc2626" }}>
        Data surat tidak ditemukan.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Detail Surat
          </h1>

          <p className="page-subtitle">
            {surat.kode_tracking}
          </p>
        </div>

        <div className="action-row">
          <Link href="/admin/surat">
            <button style={buttonStyle}>
              Kembali
            </button>
          </Link>

          <Link
            href={`/admin/preview/${surat.id}`}
          >
            <button
              style={primaryButtonStyle}
            >
              Preview Surat
            </button>
          </Link>
        </div>
      </div>

      {/* Informasi Surat */}
      <section className="card">
        <h2
          style={{
            margin: "0 0 20px",
            fontSize: "20px",
            color: "#111827",
          }}
        >
          Informasi Surat
        </h2>

        <InfoRow
          label="Kode Tracking"
          value={surat.kode_tracking}
        />

        <InfoRow
          label="Jenis Surat"
          value={surat.nama_surat || "-"}
        />

        <InfoRow
          label="Status"
          value={
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                background:
                  surat.status === "selesai"
                    ? "#dcfce7"
                    : "#fef3c7",
                color:
                  surat.status === "selesai"
                    ? "#166534"
                    : "#b45309",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {surat.status}
            </span>
          }
        />

        <InfoRow
          label="Tanggal"
          value={formatTanggal(
            surat.created_at
          )}
        />
      </section>

      {/* Data Pemohon */}
      <section
        className="card"
        style={{
          marginTop: "24px",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px",
            fontSize: "20px",
            color: "#111827",
          }}
        >
          Data Pemohon
        </h2>

        {details.map((detail) => (
          <InfoRow
            key={detail.nama_field}
            label={detail.label_field}
            value={detail.value || "-"}
          />
        ))}
      </section>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "30px",
        padding: "16px 0",
        borderBottom:
          "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          width: "220px",
          color: "#64748b",
          fontWeight: 600,
          fontSize: "15px",
          flexShrink: 0,
        }}
      >
        {label}
      </div>

      <div
        style={{
          flex: 1,
          color: "#0f172a",
          fontWeight: 500,
          fontSize: "15px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatTanggal(
  value: Date | string
) {
  return new Date(
    value
  ).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const buttonStyle: React.CSSProperties = {
  padding: "12px 18px",
  border: "1px solid #dbeafe",
  borderRadius: "12px",
  backgroundColor: "white",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 600,
};

const primaryButtonStyle: React.CSSProperties =
  {
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #60a5fa, #2563eb)",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  };