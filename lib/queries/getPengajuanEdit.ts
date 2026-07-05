import db from "@/lib/db";

const TABLE_MAP: Record<string, string> = {
  SD: "domisili",
  SKIK: "izin_keramaian",
  SKPA: "pindah_agama",
  SKL: "listrik",
  SKTM: "tidak_mampu",
  SKU: "usaha",
  SKJ: "jalan",
  SKH: "kehilangan",
  SKCK: "skck",
  SKKD: "kebenaran_data",
  SKBNI: "beda_nama_identitas",
  SKP: "kuasa_penuh",
  SKTBAPT: "tidak_berlangganan_air",
  SKPHS: "penghasilan",
  SKM: "kematian",
};

const FILE_COLUMNS = [
  "file_ktp",
  "file_kk",
  "file_pengantar_rt",
  "file_pengantar_rw",
  "file_akta_kelahiran",
  "file_buku_nikah",
  "file_surat_kematian",
  "file_surat_kehilangan",
  "file_foto_rumah",
  "file_pendukung",
];

export default async function getPengajuanEdit(
  id: number | string
) {

  // ===========================
  // Ambil data pengajuan
  // ===========================

  const [rows] = await db.query(
    `
    SELECT
      ps.*,

      js.nama_surat,
      js.kode_surat

    FROM pengajuan_surat ps

    JOIN jenis_surat js
      ON js.id = ps.jenis_surat_id

    WHERE ps.id=?

    LIMIT 1
    `,
    [id]
  );

  const pengajuan =
    (rows as any[])[0];

  if (!pengajuan) {
    return null;
  }

  // ===========================
  // Tentukan tabel detail
  // ===========================

  const table =
    TABLE_MAP[pengajuan.kode_surat];

type DetailRow = Record<string, any>;

let detail: DetailRow | null = null;

  let dokumen: Record<
    string,
    string
  > = {};

  if (table) {

    const [detailRows] =
      await db.query(
        `
        SELECT *
        FROM ${table}
        WHERE pengajuan_id=?
        LIMIT 1
        `,
        [pengajuan.id]
      );

    detail =
    ((detailRows as any[])[0] as DetailRow) ??
    null;

    if (detail) {

        FILE_COLUMNS.forEach((column) => {

        const value = detail?.[column];

        if (
            value &&
            String(value).trim() !== ""
        ) {

            dokumen[column] = value;

        }

        });

    }

  }

  // ===========================
  // Return
  // ===========================

  return {

    pengajuan,

    detail,

    dokumen,

    table,

    kodeSurat:
      pengajuan.kode_surat,

  };

}