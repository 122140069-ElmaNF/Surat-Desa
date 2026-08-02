import db from "@/lib/db";
import generateNomorSurat from "./generateNomorSurat";
import buildSuratHtml from "./buildSuratHtml";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";

export default async function approvalSurat(
  pengajuanId: number,
  nomorUrutManual?: string
) {

  const conn = await db.getConnection();

  const cookieStore = await cookies();

  const session = cookieStore.get("session");

  const currentUser = session
    ? JSON.parse(session.value)
    : null;
  
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
console.log(currentUser);
    // Update Pengajuan
    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        isi_surat=?,
        nomor_surat=?,
        nomor_urut=?,
        tanggal_surat=?,
        status='menunggu_persetujuan',
        admin_id=?,
        nama_admin=?
      WHERE id=?
      `,
      [
        isiSuratFinal,
        nomorSurat,
        nomorUrut,
        tanggalSurat,
        currentUser?.id ?? null,
        currentUser?.nama ?? null,
        pengajuanId,
      ]
    );
    
    await conn.commit();

    await logActivity({
      pengajuanId,
      userId: currentUser?.id,
      status: "menunggu_persetujuan",
      aktivitas: "Surat sedang diproses oleh Admin.",
    });


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