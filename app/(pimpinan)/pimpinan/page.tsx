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
      ps.created_at,
      js.nama_surat,
      js.kode_surat

    FROM pengajuan_surat ps

    JOIN jenis_surat js
      ON js.id = ps.jenis_surat_id

    WHERE ps.status = 'menunggu_persetujuan'

    ORDER BY ps.created_at ASC
  `);

  const surat = await Promise.all(
    (rows as any[]).map(async (item) => ({
      ...item,
      nama: await getNamaPemohon(
        item.kode_surat,
        item.id
      ),
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