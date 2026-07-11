import db from "@/lib/db";
import generateNomorSurat from "./generateNomorSurat";
import buildSuratHtml from "./buildSuratHtml";

export default async function approvalSurat(
  pengajuanId: number,
  nomorUrutManual?: string
) {

  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `
      SELECT
        ps.nomor_surat,
        ps.nomor_urut,
        ps.tanggal_surat,
        ps.isi_surat,
        js.template_surat
      FROM pengajuan_surat ps
      JOIN jenis_surat js
        ON js.id = ps.jenis_surat_id
      WHERE ps.id=?
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

    let nomorSurat = pengajuan.nomor_surat;
    let nomorUrut = pengajuan.nomor_urut;
    let tanggalSurat = pengajuan.tanggal_surat;

const hasil =
  await generateNomorSurat();
  tanggalSurat = hasil.tanggalSurat;

if (nomorUrutManual) {

  nomorUrut = Number(nomorUrutManual);
  const sekarang = new Date();
  const BULAN_ROMAWI = [
    "",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];

  const bulan =
    BULAN_ROMAWI[
      sekarang.getMonth() + 1
    ];

  const tahun = sekarang.getFullYear();

  nomorSurat =`100/${String(nomorUrut).padStart(3, "0")}/07.2009/${bulan}/${tahun}`;
} else {

  nomorSurat = hasil.nomorSurat;
  nomorUrut = hasil.nomorUrut;
}

 const isiSuratFinal =
  await buildSuratHtml({
    pengajuanId,
    nomorSurat,
    tanggalSurat,
    isiSurat: pengajuan.isi_surat,
    templateSurat: pengajuan.template_surat,
  });

    // Update Pengajuan
    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        isi_surat=?,
        nomor_surat=?,
        nomor_urut=?,
        tanggal_surat=?,
        status='menunggu_persetujuan'
      WHERE id=?
      `,
      [
        isiSuratFinal,
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