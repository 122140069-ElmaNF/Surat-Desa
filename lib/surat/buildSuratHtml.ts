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

  const fields = await buildFields(
    pengajuanId
  );

  // Ambil profil kepala desa
  const [rows] = await db.query(`
    SELECT
      nama_kepala_desa,
      jabatan
    FROM profil_pimpinan
    LIMIT 1
  `);

  const profil = (rows as any[])[0];

  fields.nomor_surat =
    nomorSurat;

  fields.jabatan =
    profil?.jabatan ?? "";

  fields.nama_penandatangan =
    profil?.nama_kepala_desa ?? "";

  return generateSurat(
    isiSurat && isiSurat.trim() !== ""
      ? isiSurat
      : templateSurat ?? "",
    fields
  );
}