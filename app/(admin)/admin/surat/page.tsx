import db from "@/lib/db";
import AdminSuratTable, { SuratRow } from "./AdminSuratTable";
import { getNamaPemohon } from "@/lib/surat/getNamaPemohon";

export default async function AdminSuratPage() {
  const [rows] = await db.query(
    `
    SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      ps.created_at,
      ps.nama_admin,
      js.nama_surat,
      js.kode_surat

    FROM pengajuan_surat ps

    JOIN jenis_surat js
      ON js.id = ps.jenis_surat_id

    ORDER BY ps.created_at DESC
    `
  );

  const surat = await Promise.all(
    (rows as any[]).map(async (item) => ({
      ...item,
      nama: await getNamaPemohon(
        item.kode_surat,
        item.id
      ),
    }))
  );

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 className="page-title">
          Surat Masuk
        </h1>

        <p className="page-subtitle">
          Daftar semua pengajuan surat dari pemohon.
        </p>
      </div>

      <AdminSuratTable
        surat={surat as SuratRow[]}
      />
    </div>
  );
}