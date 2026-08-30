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

  const keyLower = key.toLowerCase();

  // ==========================================
  // BUKAN DATE
  // ==========================================

  if (!(value instanceof Date)) {
    const stringValue = String(value);

    // ==========================================
    // FORMAT TTL
    // ==========================================

    if (
      keyLower === "ttl" ||
      keyLower.startsWith("ttl_") ||
      keyLower.includes("tempat_tgl_lahir") ||
      keyLower.includes("tempat_tanggal_lahir")
    ) {
      const parts = stringValue
        .split(",")
        .map((item) => item.trim());

      if (parts.length === 2) {
        const tempat = parts[0];
        const tanggal = parts[1];

        if (/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
          const [year, month, day] =
            tanggal.split("-");

          const monthIndex =
            Number(month) - 1;

          if (
            monthIndex >= 0 &&
            monthIndex < BULAN.length
          ) {
            return `${tempat}, ${day} ${
              BULAN[monthIndex]
            } ${year}`;
          }
        }
      }
    }

    // ==========================================
    // FORMAT TANGGAL YYYY-MM-DD
    // ==========================================

    if (
      (
        keyLower.includes("tanggal") ||
        keyLower.includes("tgl")
      ) &&
      /^\d{4}-\d{2}-\d{2}$/.test(stringValue)
    ) {
      const [year, month, day] =
        stringValue.split("-");

      const monthIndex =
        Number(month) - 1;

      if (
        monthIndex >= 0 &&
        monthIndex < BULAN.length
      ) {
        return `${day} ${
          BULAN[monthIndex]
        } ${year}`;
      }
    }

    return stringValue;
  }

  // ==========================================
  // JAM / WAKTU
  // ==========================================

  if (
    keyLower.includes("jam") ||
    keyLower.includes("waktu") ||
    keyLower.includes("pukul")
  ) {
    return formatJam(value);
  }

  // ==========================================
  // TANGGAL
  // ==========================================

  if (
    keyLower.includes("tanggal") ||
    keyLower.includes("tgl") ||
    keyLower.endsWith("_date")
  ) {
    return formatTanggalIndonesia(value);
  }

  // ==========================================
  // TTL JIKA DATABASE MENGEMBALIKAN DATE
  // ==========================================

  if (
    keyLower === "ttl" ||
    keyLower.startsWith("ttl_") ||
    keyLower.includes("tempat_tgl_lahir") ||
    keyLower.includes("tempat_tanggal_lahir")
  ) {
    return formatTanggalIndonesia(value);
  }

  return String(value);
}

export default async function buildFields(
  pengajuanId: number
) {
  // ==========================================
  // AMBIL JENIS SURAT
  // ==========================================

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

  const pengajuan =
    (rows as any[])[0];

  if (!pengajuan) {
    throw new Error(
      "Pengajuan tidak ditemukan."
    );
  }

  // ==========================================
  // TENTUKAN TABLE DETAIL
  // ==========================================

  const table =
    TABLE_MAP[pengajuan.kode_surat];

  const fields: Record<string, string> = {};

  if (!table) {
    return fields;
  }

  // ==========================================
  // AMBIL DATA DETAIL SURAT
  // ==========================================

  const [detailRows] =
    await db.query(
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

  // ==========================================
  // MASUKKAN SEMUA FIELD
  // ==========================================

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

  // KHUSUS SURAT KEMATIAN

  if (pengajuan.kode_surat === "SKM") {
    if (row.tanggal) {
      fields.tanggal_kematian =
        formatValue(
          "tanggal_kematian",
          row.tanggal
        );
    }
  }

  return fields;
}