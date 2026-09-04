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

export async function getNamaPemohon(
  kodeSurat: string,
  pengajuanId: number
) {
  const table = TABLE_MAP[kodeSurat];

  if (!table) return "-";

  try {
    const [rows]: any = await db.query(
      `
      SELECT k.nama
      FROM pengajuan_surat p
      JOIN kependudukan k
        ON p.nik = k.nik
      WHERE p.id = ?
      LIMIT 1
      `,
      [pengajuanId]
    );

    return rows.length ? rows[0].nama : "-";
  } catch (error) {
    console.error(
      "ERROR GET NAMA PEMOHON:",
      error
    );

    return "-";
  }
}