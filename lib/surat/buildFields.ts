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

function formatValue(
  key: string,
  value: unknown
): string {
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
          const [year, month, day] = tanggal.split("-");

          const monthIndex = Number(month) - 1;

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

      const monthIndex = Number(month) - 1;

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
  // TTL JIKA DATABASE DATE
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

// =====================================================
// AMBIL DATA PENDUDUK BERDASARKAN NIK
// =====================================================

async function getPendudukByNik(
  nik: string | null | undefined
) {
  if (!nik) {
    return null;
  }

  const [rows] = await db.query(
    `
    SELECT
      nik,
      nama,
      ttl,
      agama,
      jenis_kelamin,
      status_perkawinan,
      pekerjaan,
      alamat,
      dusun,
      rt,
      rw,
      kewarganegaraan
    FROM kependudukan
    WHERE nik = ?
    LIMIT 1
    `,
    [nik]
  );

  return (rows as any[])[0] ?? null;
}

// =====================================================
// MASUKKAN DATA PENDUDUK KE FIELDS
// =====================================================

function addPendudukFields(
  fields: Record<string, string>,
  penduduk: any,
  prefix = ""
) {
  if (!penduduk) {
    return;
  }

  const fieldMap: Record<string, string> = {
    nik: "nik",
    nama: "nama",
    ttl: "ttl",
    agama: "agama",
    jenis_kelamin: "jenis_kelamin",
    status_perkawinan: "status_perkawinan",
    pekerjaan: "pekerjaan",
    alamat: "alamat",
    dusun: "dusun",
    rt: "rt",
    rw: "rw",
    kewarganegaraan: "kewarganegaraan",
  };

  Object.entries(fieldMap).forEach(
    ([sourceKey, targetKey]) => {
      const fieldName = prefix
        ? `${targetKey}_${prefix}`
        : targetKey;

      fields[fieldName] = formatValue(
        fieldName,
        penduduk[sourceKey]
      );
    }
  );
}

export default async function buildFields(
  pengajuanId: number
) {
  // ==========================================
  // AMBIL DATA PENGAJUAN + JENIS SURAT
  // ==========================================

  const [rows] = await db.query(
    `
    SELECT
      ps.id,
      ps.nik,
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

  // ==========================================
  // JIKA TIDAK ADA TABLE DETAIL
  // ==========================================

  if (!table) {
    // Untuk surat biasa, tetap ambil
    // data penduduk berdasarkan ps.nik.

    if (pengajuan.nik) {
      const penduduk =
        await getPendudukByNik(
          pengajuan.nik
        );

      addPendudukFields(
        fields,
        penduduk
      );
    }

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
  // SURAT DENGAN SATU PENDUDUK
  // ==========================================
  //
  // Surat biasa menggunakan:
  //
  // pengajuan_surat.nik
  //       ↓
  // kependudukan
  //
  // ==========================================

  if (
    pengajuan.kode_surat !== "SKPHS" &&
    pengajuan.kode_surat !== "SKTBAPT"
  ) {
    if (pengajuan.nik) {
      const penduduk =
        await getPendudukByNik(
          pengajuan.nik
        );

      addPendudukFields(
        fields,
        penduduk
      );
    }
  }

  // ==========================================
  // KHUSUS SKPHS / PENGHASILAN
  // ==========================================
  //
  // Ada dua penduduk:
  //
  // nik_kepala_keluarga
  // nik_anak
  //
  // Template menggunakan:
  //
  // nama_kepala_keluarga
  // ttl_kepala_keluarga
  // nik_kepala_keluarga
  // ...
  //
  // nama_anak
  // ttl_anak
  // nik_anak
  // ...
  //
  // ==========================================

  if (
    pengajuan.kode_surat === "SKPHS"
  ) {
    const kepalaKeluarga =
      await getPendudukByNik(
        row.nik_kepala_keluarga
      );

    const anak =
      await getPendudukByNik(
        row.nik_anak
      );

    addPendudukFields(
      fields,
      kepalaKeluarga,
      "kepala_keluarga"
    );

    addPendudukFields(
      fields,
      anak,
      "anak"
    );
  }

  // ==========================================
  // KHUSUS SKTBAPT
  // ==========================================
  //
  // Ada dua penduduk:
  //
  // nik_pertama
  // nik_kedua
  //
  // Orang kedua hanya membutuhkan:
  // nama
  // ttl
  // nik
  // alamat
  //
  // ==========================================

  if (
    pengajuan.kode_surat ===
    "SKTBAPT"
  ) {
    const pendudukPertama =
      await getPendudukByNik(
        row.nik_pertama
      );

    const pendudukKedua =
      await getPendudukByNik(
        row.nik_kedua
      );

    // ------------------------------------------
    // ORANG PERTAMA
    // ------------------------------------------

    addPendudukFields(
      fields,
      pendudukPertama,
      "pertama"
    );

    // ------------------------------------------
    // ORANG KEDUA
    // ------------------------------------------

    if (pendudukKedua) {
      fields.nama_kedua =
        formatValue(
          "nama_kedua",
          pendudukKedua.nama
        );

      fields.ttl_kedua =
        formatValue(
          "ttl_kedua",
          pendudukKedua.ttl
        );

      fields.nik_kedua =
        formatValue(
          "nik_kedua",
          pendudukKedua.nik
        );

      fields.alamat_kedua =
        formatValue(
          "alamat_kedua",
          pendudukKedua.alamat
        );
    }
  }

  // ==========================================
  // MASUKKAN FIELD DETAIL SURAT
  // ==========================================
  //
  // Field identitas tidak lagi berasal
  // dari tabel detail.
  //
  // Tetapi field khusus surat tetap dimasukkan.
  //
  // ==========================================

  Object.keys(row).forEach(
    (key) => {
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

      if (
        key.startsWith("file_")
      ) {
        return;
      }

      // ----------------------------------------
      // NIK dua penduduk sudah digunakan
      // untuk mengambil data kependudukan.
      //
      // Tetap masukkan NIK-nya karena template
      // membutuhkan field tersebut.
      // ----------------------------------------

      fields[key] =
        formatValue(
          key,
          row[key]
        );
    }
  );

  // ==========================================
  // KHUSUS SURAT KEMATIAN
  // ==========================================
  //
  // Field "tanggal" pada tabel kematian
  // merupakan tanggal meninggal.
  //
  // Sedangkan "tanggal" sistem digunakan
  // sebagai tanggal surat.
  //
  // Oleh karena itu:
  //
  // row.tanggal
  //      ↓
  // tanggal_kematian
  //
  // ==========================================

  if (
    pengajuan.kode_surat ===
    "SKM"
  ) {
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