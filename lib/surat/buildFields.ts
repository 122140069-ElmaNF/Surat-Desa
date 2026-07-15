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

export default async function buildFields(
  pengajuanId: number
) {
  const [rows] = await db.query(
    `
    SELECT
      ps.id,
      js.kode_surat
    FROM pengajuan_surat ps
    JOIN jenis_surat js
      ON js.id = ps.jenis_surat_id
    WHERE ps.id=?
    LIMIT 1
    `,
    [pengajuanId]
  );

  const pengajuan = (rows as any[])[0];

  if (!pengajuan) {
    throw new Error("Pengajuan tidak ditemukan.");
  }

  const table =
    TABLE_MAP[pengajuan.kode_surat];

  const fields: Record<string, string> = {};

  if (!table) {
    return fields;
  }

  const [detailRows] = await db.query(
    `
    SELECT *
    FROM ${table}
    WHERE pengajuan_id=?
    LIMIT 1
    `,
    [pengajuanId]
  );

  const row =
    (detailRows as any[])[0] ?? {};

  Object.keys(row).forEach((key) => {
    if (
      [
        "id",
        "pengajuan_id",
        "created_at",
        "updated_at",
      ].includes(key)
    ) {
      return;
    }

    if (key.startsWith("file_")) {
      return;
    }

    fields[key] = String(
      row[key] ?? ""
    );
  });

  return fields;
}