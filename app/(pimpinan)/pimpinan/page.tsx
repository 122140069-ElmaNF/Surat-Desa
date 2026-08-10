import db from "@/lib/db";
import { getNamaPemohon } from "@/lib/surat/getNamaPemohon";

import PimpinanDashboardStats from "./PimpinanDashboardStats";
import PimpinanSuratTable, {
  SuratPersetujuanRow,
} from "./PimpinanSuratTable";

export default async function PimpinanDashboardPage() {
  const [rows] = await db.query(`
    SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      js.nama_surat,
      js.kode_surat,

      (
        SELECT sal.created_at
        FROM surat_activity_logs sal
        WHERE sal.pengajuan_id = ps.id
          AND sal.status = 'menunggu_persetujuan'
        ORDER BY sal.created_at DESC
        LIMIT 1
      ) AS approval_requested_at

    FROM pengajuan_surat ps

    JOIN jenis_surat js
      ON js.id = ps.jenis_surat_id

    WHERE ps.status = 'menunggu_persetujuan'

    ORDER BY approval_requested_at DESC
  `);

  const surat = await Promise.all(
    (rows as any[]).map(async (item) => ({
      ...item,

      nama: await getNamaPemohon(
        item.kode_surat,
        item.id
      ),

      // Waktu Admin mengajukan approval
      created_at: item.approval_requested_at,
    }))
  );

  const [statRows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM pengajuan_surat
    WHERE status = 'menunggu_persetujuan'
  `);

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
        surat={surat as SuratPersetujuanRow[]}
      />
    </div>
  );
}