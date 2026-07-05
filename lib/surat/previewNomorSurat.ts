import db from "@/lib/db";
import generateNomorSurat from "@/lib/surat/generateNomorSurat";

export default async function previewNomorSurat(
  pengajuanId: number
) {
  const [rows] = await db.query(
    `
    SELECT
      nomor_surat,
      nomor_urut,
      tanggal_surat
    FROM pengajuan_surat
    WHERE id=?
    LIMIT 1
    `,
    [pengajuanId]
  );

  const pengajuan = (rows as any[])[0];

  if (!pengajuan) {
    throw new Error(
      "Pengajuan tidak ditemukan."
    );
  }

  // ====================================
  // Kalau admin sudah pernah edit
  // ====================================

  if (
    pengajuan.nomor_surat &&
    pengajuan.nomor_urut &&
    pengajuan.tanggal_surat
  ) {
    return {
      nomorSurat:
        pengajuan.nomor_surat,
      nomorUrut:
        pengajuan.nomor_urut,
      tanggalSurat:
        pengajuan.tanggal_surat,
    };
  }

  // ====================================
  // Kalau belum pernah dibuat
  // ====================================

  return generateNomorSurat();
}