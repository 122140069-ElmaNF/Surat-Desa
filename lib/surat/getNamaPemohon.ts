import db from "@/lib/db";

const TABLE_MAP: Record<string, string> = {
  SD: "domisili",
  SKIK: "izin_keramaian",
  STHT: "tafsiran_harga_tanah",
  SKL: "listrik",
  SKTM: "tidak_mampu",
  SKU: "usaha",
  SKJ: "jalan",
  SKH: "kehilangan",
  SKKD: "kebenaran_data",
  SKBNI: "beda_nama_identitas",
  SKTBAPT: "tidak_berlangganan_air",
  SKPHS: "penghasilan",
  SKM: "kematian",
};

const NAMA_FIELD_MAP: Record<string, string> = {
  domisili: "nama",
  izin_keramaian: "nama",
  tafsiran_harga_tanah: "nama",
  listrik: "nama",
  tidak_mampu: "nama",
  usaha: "nama",
  jalan: "nama",
  kehilangan: "nama",
  kebenaran_data: "nama",
  kematian: "nama",

  beda_nama_identitas: "nama_lama",
  tidak_berlangganan_air: "nama_pertama",
  penghasilan: "nama_kepala_keluarga",
};

export async function getNamaPemohon(
  kodeSurat: string,
  pengajuanId: number
) {
  const table = TABLE_MAP[kodeSurat];

  if (!table) return "-";

  const field = NAMA_FIELD_MAP[table];

  const [rows]: any = await db.query(
    `
    SELECT ${field} AS nama
    FROM ${table}
    WHERE pengajuan_id = ?
    LIMIT 1
    `,
    [pengajuanId]
  );

  return rows.length ? rows[0].nama : "-";
}