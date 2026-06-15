import db from "@/lib/db";
import { ArsipSuratRow } from "./PimpinanArsipTable";
import SearchableArsip from "./SearchableArsip";

type ArsipSuratDbRow = Omit<ArsipSuratRow, "created_at"> & {
  created_at: string | Date | null;
};

export default async function PimpinanArsipPage() {
  let rows: ArsipSuratDbRow[] = [];
  try {
    const result = await db.query(
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

    rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : [];
  } catch (err) {
    console.error("ERROR fetching arsip rows:", err);
    rows = [];
  }

  const sanitized: ArsipSuratRow[] = rows.map((r) => ({
    ...r,
    created_at: r.created_at ? new Date(r.created_at).toISOString() : "",
  }));

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 className="page-title">Arsip Surat</h1>
        <p className="page-subtitle">
          Surat yang sudah disetujui dan mendapatkan tanda tangan.
        </p>
      </div>

      <SearchableArsip initialRows={sanitized} />
    </div>
  );
}
