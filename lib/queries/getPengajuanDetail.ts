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

  // Pengajuan

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
    WHERE ps.id=?
    LIMIT 1
    `,
    [id]
  );

  const pengajuan = (rows as any[])[0];

  if (!pengajuan) {
    return null;
  }

  // Tentukan tabel detail

  const table =
    TABLE_MAP[pengajuan.kode_surat];

let detail: {
  key: string;
  label: string;
  value: any;
}[] = [];

  let dokumen: {
    label: string;
    file: string;
    url: string;
  }[] = [];

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

const row = (detailRows as any[])[0] ?? null;
const detailData = row as Record<string, any>;

detail = [];

if (row) {
  detail = Object.keys(row)
    .filter(
      (key) =>
        ![
          "id",
          "pengajuan_id",
          "created_at",
          "updated_at",
          ...FILE_COLUMNS,
        ].includes(key)
    )
    .map((key) => ({
      key,
      label: formatLabel(key),
      value: row[key],
    }));

  dokumen = FILE_COLUMNS
    .filter(
      (column) =>
        row[column] &&
        String(row[column]).trim() !== ""
    )
    .map((column) => ({
      key: column,
      label: formatLabel(column),
      file: row[column],
      url: `/uploads/${getFolder(column)}/${row[column]}`,
    }));
}
  }

  return {
    pengajuan,
    detail,
    dokumen,
    table,
  };
}

function formatLabel(
  column: string
) {
  return column
    .replace("file_", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) =>
      c.toUpperCase()
    );
}

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