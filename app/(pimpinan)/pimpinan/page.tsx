import db from "@/lib/db";
import PimpinanDashboardStats from "./PimpinanDashboardStats";
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

  const [statRows] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM pengajuan_surat
    WHERE status = 'menunggu tanda tangan'
    `
  );

  const totalMenunggu =
    (statRows as any[])[0]?.total || 0;

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 className="page-title">
          Persetujuan Surat
        </h1>

        <p className="page-subtitle">
          Daftar surat yang membutuhkan persetujuan dan tanda tangan kepala desa.
        </p>
      </div>

      <PimpinanDashboardStats
        data={{
          totalMenunggu,
        }}
      />

      <PimpinanSuratTable
        surat={rows as SuratPersetujuanRow[]}
      />
    </div>
  );
}