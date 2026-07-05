import db from "@/lib/db";
import generateNomorSurat from "./generateNomorSurat";

export default async function approvalSurat(
  pengajuanId: number
) {

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    const [rows] = await conn.query(
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

    const pengajuan =
      (rows as any[])[0];

    if (!pengajuan) {
      throw new Error(
        "Pengajuan tidak ditemukan."
      );
    }

    let nomorSurat =
      pengajuan.nomor_surat;

    let nomorUrut =
      pengajuan.nomor_urut;

    let tanggalSurat =
      pengajuan.tanggal_surat;

    // Generate jika belum ada
    if (!nomorSurat) {
      const hasil =
        await generateNomorSurat();
      nomorSurat =
        hasil.nomorSurat;
      nomorUrut =
        hasil.nomorUrut;
      tanggalSurat =
        hasil.tanggalSurat;
    }

    // Update Pengajuan
    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        nomor_surat=?,
        nomor_urut=?,
        tanggal_surat=?,
        status='menunggu_persetujuan'
      WHERE id=?
      `,
      [
        nomorSurat,
        nomorUrut,
        tanggalSurat,
        pengajuanId,
      ]
    );
    await conn.commit();
    return {
      success: true,
      nomorSurat,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}