import db from "@/lib/db";
import PimpinanSuratTable, {
  SuratPersetujuanRow,
} from "./PimpinanSuratTable";

export default async function PimpinanDashboardPage() {
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
    WHERE ps.status = 'menunggu tanda tangan'
    ORDER BY ps.created_at ASC`
  );

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: "#111827" }}>
          Persetujuan Surat
        </h1>
        <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
          Daftar surat yang membutuhkan persetujuan dan tanda tangan kepala desa.
        </p>
      </div>

      <PimpinanSuratTable surat={rows as SuratPersetujuanRow[]} />
    </div>
  );
}
