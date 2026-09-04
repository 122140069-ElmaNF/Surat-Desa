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

export async function getPengajuanDetail(
  id: number | string
) {
  // ===========================
  // DATA PENGAJUAN
  // ===========================

  const [rows] = await db.query(
    `
    SELECT
      ps.*,
      js.nama_surat,
      js.kode_surat,
      js.template_surat,
      js.use_kop
    FROM pengajuan_surat ps
    JOIN jenis_surat js
      ON js.id = ps.jenis_surat_id
    WHERE ps.id = ?
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
  // TABEL DETAIL
  // ===========================

  const table =
    TABLE_MAP[pengajuan.kode_surat];

  let detail: {
    key: string;
    label: string;
    value: any;
  }[] = [];

  let dokumen: {
    key: string;
    label: string;
    file: string;
    url: string;
  }[] = [];

  // ===========================
  // DATA KEPENDUDUKAN
  // ===========================

  let dataKependudukan: any = null;

  if (pengajuan.nik) {
    const [pendudukRows] =
      await db.query(
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
        [pengajuan.nik]
      );

    dataKependudukan =
      (pendudukRows as any[])[0] ??
      null;
  }

  // ===========================
  // DATA DETAIL SURAT
  // ===========================

  let detailRow: any = null;

  if (table) {
    const [detailRows] =
      await db.query(
        `
        SELECT *
        FROM ${table}
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [pengajuan.id]
      );

    detailRow =
      (detailRows as any[])[0] ??
      null;
  }

  // ===========================
  // GABUNGKAN DATA PEMOHON
  // DENGAN DATA KHUSUS SURAT
  // ===========================

  if (dataKependudukan) {
    const identityFields = [
      "nik",
      "nama",
      "ttl",
      "agama",
      "jenis_kelamin",
      "status_perkawinan",
      "pekerjaan",
      "alamat",
      "dusun",
      "rt",
      "rw",
      "kewarganegaraan",
    ];

    identityFields.forEach(
      (key) => {
        if (
          dataKependudukan[key] !==
            null &&
          dataKependudukan[key] !==
            undefined
        ) {
          detail.push({
            key,
            label: formatLabel(key),
            value:
              normalizeValue(
                dataKependudukan[key]
              ),
          });
        }
      }
    );
  }

  // ===========================
  // DATA KHUSUS SURAT
  // ===========================

  if (detailRow) {
    Object.keys(detailRow)
      .filter(
        (key) =>
          ![
            "id",
            "pengajuan_id",
            "created_at",
            "updated_at",
            ...FILE_COLUMNS,

            // Data identitas sudah
            // diambil dari kependudukan
            "nama",
            "nik",
            "ttl",
            "agama",
            "jenis_kelamin",
            "status_perkawinan",
            "pekerjaan",
            "alamat",
            "dusun",
            "rt",
            "rw",
            "kewarganegaraan",
          ].includes(key)
      )
      .forEach((key) => {
        detail.push({
          key,
          label: formatLabel(key),
          value:
            normalizeValue(
              detailRow[key]
            ),
        });
      });

    // ===========================
    // DOKUMEN
    // ===========================

    dokumen =
      FILE_COLUMNS
        .filter(
          (column) =>
            detailRow[column] &&
            String(
              detailRow[column]
            ).trim() !== ""
        )
        .map((column) => ({
          key: column,
          label: formatLabel(
            column
          ),
          file: detailRow[column],
          url: `/uploads/${getFolder(
            column
          )}/${detailRow[column]}`,
        }));
  }

  return {
    pengajuan,
    detail,
    dokumen,
    table,
  };
}

// =========================================
// NORMALIZE VALUE
// =========================================

function normalizeValue(value: any) {
  // Nilai kosong
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  // =========================================
  // DATE DARI DATABASE
  // =========================================

  if (value instanceof Date) {
    const year =
      value.getFullYear();

    const month =
      String(
        value.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        value.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // =========================================
  // BIGINT
  // =========================================

  if (
    typeof value === "bigint"
  ) {
    return value.toString();
  }

  // =========================================
  // NILAI LAIN
  // =========================================

  return String(value);
}

// =========================================
// FORMAT LABEL
// =========================================

function formatLabel(
  column: string
) {
  return column
    .replace("file_", "")
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (c) => c.toUpperCase()
    );
}

// =========================================
// FOLDER FILE
// =========================================

function getFolder(
  column: string
) {
  switch (column) {
    case "file_ktp":
      return "ktp";

    case "file_kk":
      return "kk";

    default:
      return "dokumen";
  }
}