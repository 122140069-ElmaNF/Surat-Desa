import db from "@/lib/db";
import buildFields from "./buildFields";
import { generateSurat } from "./generateSurat";

type Props = {
  pengajuanId: number;
  nomorSurat: string;
  tanggalSurat: Date;

  isiSurat?: string;
  templateSurat?: string;
};

export default async function buildSuratHtml({
  pengajuanId,
  nomorSurat,
  tanggalSurat,
  isiSurat,
  templateSurat,
}: Props) {
  // =========================================
  // AMBIL FIELD DATA SURAT
  // =========================================

  const fields = await buildFields(
    pengajuanId
  );

  // =========================================
  // AMBIL KEPALA DESA AKTIF
  // =========================================

const [rows] = await db.query(`
  SELECT
    u.id,
    u.nama,
    u.tanda_tangan,
    u.jabatan
  FROM users u
  WHERE u.role = 'kepala_desa'
  LIMIT 1
`);

  const kepalaDesa =
    (rows as any[])[0];

  // =========================================
  // SYSTEM FIELDS
  // =========================================

  fields.nomor_surat =
    nomorSurat ?? "";

  fields.tanggal =
    tanggalSurat
      ? formatTanggalIndonesia(
          tanggalSurat
        )
      : "";

  fields.jabatan =
    kepalaDesa?.jabatan ?? "";

  fields.nama_penandatangan =
    kepalaDesa?.nama ?? "";

  // =========================================
  // GENERATE SURAT
  // =========================================

  return generateSurat(
    isiSurat &&
      isiSurat.trim() !== ""
      ? isiSurat
      : templateSurat ?? "",
    fields
  );
}

// =========================================
// FORMAT TANGGAL INDONESIA
// =========================================

function formatTanggalIndonesia(
  value: Date
) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}