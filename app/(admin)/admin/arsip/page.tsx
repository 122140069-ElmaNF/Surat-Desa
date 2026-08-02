import db from "@/lib/db";
import { getNamaPemohon } from "@/lib/surat/getNamaPemohon";
import { ArsipSuratRow } from "./AdminArsipTable";
import SearchableArsip from "./SearchableArsip";

type ArsipSuratDbRow = Omit<ArsipSuratRow, "created_at" | "nama"> & {
  created_at: string | Date | null;
  kode_surat: string;
};

export default async function AdminArsipPage() {
  let rows: ArsipSuratDbRow[] = [];

  try {
    const result = await db.query(`
      SELECT
        ps.id,
        ps.kode_tracking,
        ps.status,
        ps.created_at,
        ps.nomor_surat,
        ps.nama_penandatangan,
        js.nama_surat,
        js.kode_surat

      FROM pengajuan_surat ps

      JOIN jenis_surat js
        ON js.id = ps.jenis_surat_id

      WHERE ps.status = 'selesai'

      ORDER BY ps.created_at DESC
    `);

    rows =
      Array.isArray(result) && Array.isArray(result[0])
        ? (result[0] as ArsipSuratDbRow[])
        : [];
  } catch (err) {
    console.error("ERROR fetching arsip rows:", err);
    rows = [];
  }

  const sanitized: ArsipSuratRow[] = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      nama: await getNamaPemohon(
        r.kode_surat,
        r.id
      ),
      created_at: r.created_at
        ? new Date(r.created_at).toISOString()
        : "",
    }))
  );

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 className="page-title">
          Arsip Surat
        </h1>

        <p className="page-subtitle">
          Daftar surat yang telah selesai dan
          mendapatkan tanda tangan Kepala Desa.
        </p>
      </div>

      <SearchableArsip initialRows={sanitized} />
    </div>
  );
}