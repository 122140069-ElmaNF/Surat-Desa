import db from "@/lib/db";

export type JenisSurat = {
  id: number;
  nama_surat: string;
  kode_surat: string;
  template_surat: string;
  use_kop: number;
};

export default async function getJenisSurat(
  kodeSurat: string
): Promise<JenisSurat> {

  const [rows] = await db.query(
    `
    SELECT
      id,
      nama_surat,
      kode_surat,
      template_surat,
      use_kop
    FROM jenis_surat
    WHERE kode_surat = ?
    LIMIT 1
    `,
    [kodeSurat]
  );

  const jenis = (rows as JenisSurat[])[0];

  if (!jenis) {
    throw new Error(
      `Jenis surat "${kodeSurat}" tidak ditemukan.`
    );
  }

  return jenis;
}