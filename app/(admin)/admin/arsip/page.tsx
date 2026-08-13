import db from "@/lib/db";
import { getNamaPemohon } from "@/lib/surat/getNamaPemohon";
import { ArsipSuratRow } from "./AdminArsipTable";
import SearchableArsip from "./SearchableArsip";

type ArsipSuratDbRow = Omit<
  ArsipSuratRow,
  "created_at" | "nama"
> & {
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

        COALESCE(
          (
            SELECT sal.created_at
            FROM surat_activity_logs sal
            WHERE sal.pengajuan_id = ps.id
              AND sal.status = 'selesai'
            ORDER BY sal.created_at DESC
            LIMIT 1
          ),
          ps.created_at
        ) AS created_at,

        ps.nomor_surat,
      
        u.nama AS nama_penandatangan,

        js.nama_surat,
        js.kode_surat

      FROM pengajuan_surat ps

      JOIN jenis_surat js
        ON js.id = ps.jenis_surat_id

      LEFT JOIN users u
        ON u.id = ps.kepala_desa_id

      WHERE ps.status = 'selesai'

      ORDER BY created_at DESC
    `);

    rows =
      Array.isArray(result) &&
      Array.isArray(result[0])
        ? (result[0] as ArsipSuratDbRow[])
        : [];
  } catch (err) {
    console.error(
      "ERROR fetching arsip rows:",
      err
    );

    rows = [];
  }

  const sanitized: ArsipSuratRow[] =
    await Promise.all(
      rows.map(async (r) => ({
        ...r,

        nama: await getNamaPemohon(
          r.kode_surat,
          r.id
        ),

        created_at: r.created_at
          ? new Date(
              r.created_at
            ).toISOString()
          : "",
      }))
    );

  return (
    <div>
      <div
        style={{
          marginBottom: "22px",
        }}
      >
        <h1>Arsip Surat</h1>

        <p className="page-subtitle">
          Daftar surat yang telah selesai dan
          mendapatkan tanda tangan Kepala Desa.
        </p>
      </div>

      <SearchableArsip
        initialRows={sanitized}
      />
    </div>
  );
}