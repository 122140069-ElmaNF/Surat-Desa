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

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatTanggalIndonesia(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")} ${
    BULAN[date.getMonth()]
  } ${date.getFullYear()}`;
}

function formatJam(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  // ==========================================
  // Kalau bukan Date, kembalikan sebagai string
  // ==========================================

  if (!(value instanceof Date)) {
    const stringValue = String(value);

    // Format YYYY-MM-DD
    if (
      /^(tanggal|tgl|tanggal_)/i.test(key) &&
      /^\d{4}-\d{2}-\d{2}$/.test(stringValue)
    ) {
      const [year, month, day] = stringValue.split("-");

      return `${day} ${BULAN[Number(month) - 1]} ${year}`;
    }

    // Format TTL:
    // contoh: lampung, 2026-08-04
    if (
      key === "ttl" ||
      key.includes("tempat_tgl_lahir") ||
      key.includes("tempat_tanggal_lahir")
    ) {
      const parts = stringValue
        .split(",")
        .map((item) => item.trim());

      if (parts.length === 2) {
        const tanggal = parts[1];

        if (/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
          const [year, month, day] = tanggal.split("-");

          return `${parts[0]}, ${day} ${
            BULAN[Number(month) - 1]
          } ${year}`;
        }
      }
    }

    return stringValue;
  }

  // ==========================================
  // DATE / DATETIME
  // ==========================================

  // Kolom jam / waktu
  // Jangan tampilkan 30 November 1899
  if (
    key.includes("jam") ||
    key.includes("waktu") ||
    key.includes("pukul")
  ) {
    return formatJam(value);
  }

  // Kolom tanggal
  if (
    key.includes("tanggal") ||
    key.includes("tgl") ||
    key.endsWith("_date")
  ) {
    return formatTanggalIndonesia(value);
  }

  // Untuk field TTL yang ternyata disimpan sebagai Date
  if (
    key === "ttl" ||
    key.includes("tempat_tgl_lahir") ||
    key.includes("tempat_tanggal_lahir")
  ) {
    return formatTanggalIndonesia(value);
  }

  return String(value);
}

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
    WHERE ps.id = ?
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
    WHERE pengajuan_id = ?
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

    fields[key] = formatValue(
      key,
      row[key]
    );
  });

  return fields;
}