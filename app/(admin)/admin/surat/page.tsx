import db from "@/lib/db";
import AdminSuratTable, { SuratRow } from "./AdminSuratTable";

export default async function AdminSuratPage() {
  const [rows] = await db.query(
    `
    SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      ps.created_at,
      js.nama_surat,
      d.nama
    FROM pengajuan_surat ps

    LEFT JOIN jenis_surat js
      ON js.id = ps.jenis_surat_id

    LEFT JOIN domisili d
      ON d.pengajuan_id = ps.id

    ORDER BY ps.created_at DESC
    `
  );

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 className="page-title">Surat Masuk</h1>

        <p className="page-subtitle">
          Daftar semua pengajuan surat dari pemohon.
        </p>
      </div>

      <AdminSuratTable surat={rows as SuratRow[]} />
    </div>
  );
}
