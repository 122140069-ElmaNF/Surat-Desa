import db from "@/lib/db";
import { ArsipSuratRow } from "./AdminArsipTable";
import SearchableArsip from "./SearchableArsip";

export default async function AdminArsipPage() {
  const [rows] = await db.query(
    `SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      ps.created_at,
      js.nama_surat,
      (
        SELECT dp.value
        FROM detail_pengajuan dp
        JOIN field_surat fs ON fs.id = dp.field_id
        WHERE dp.pengajuan_id = ps.id
          AND fs.nama_field = 'nama'
        LIMIT 1
      ) AS nama
    FROM pengajuan_surat ps
    LEFT JOIN jenis_surat js ON js.id = ps.jenis_surat_id
    WHERE ps.status = 'selesai'
    ORDER BY ps.created_at DESC`
  );

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 className="page-title">Arsip Surat</h1>
        <p className="page-subtitle">
          Daftar surat yang sudah selesai dan mendapatkan tanda tangan.
        </p>
      </div>

      <SearchableArsip initialRows={rows as ArsipSuratRow[]} />
    </div>
  );
}
