import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    const nama = formData.get("nama") as string;
    const ttl = formData.get("ttl") as string;
    const nik = formData.get("nik") as string;
    const status_perkawinan = formData.get("status_perkawinan") as string;
    const pekerjaan = formData.get("pekerjaan") as string;
    const alamat = formData.get("alamat") as string;
    const dusun = formData.get("dusun") as string;
    const rt = formData.get("rt") as string;
    const rw = formData.get("rw") as string;

    const idpel = formData.get("idpel") as string;
    const jenis_meteran = formData.get("jenis_meteran") as string;
    const keperluan = formData.get("keperluan") as string;

    const fileKtp = formData.get("file_ktp") as File | null;

    if (!fileKtp) {
      return NextResponse.json(
        {
          success: false,
          message: "File KTP wajib diupload.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // Validasi File
    // ===============================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(fileKtp.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "File harus berupa JPG atau PNG.",
        },
        {
          status: 400,
        }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (fileKtp.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran file maksimal 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // Upload File
    // ===============================

    const bytes = await fileKtp.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = fileKtp.name
      .split(".")
      .pop()
      ?.toLowerCase();

    const fileName = `${randomUUID()}.${ext}`;

    const uploadPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "ktp",
      fileName
    );

    await writeFile(uploadPath, buffer);

    // ===============================
    // Ambil Jenis Surat
    // ===============================

    const [jenisRows]: any = await conn.query(
      `
      SELECT
        id,
        kode_surat
      FROM jenis_surat
      WHERE kode_surat = 'SKL'
      `
    );

    const jenisSuratId = jenisRows[0].id;
    const kodeSurat = jenisRows[0].kode_surat;

    // ===============================
    // Generate Tracking
    // ===============================

    const sekarang = new Date();

    const tanggal =
      `${String(sekarang.getDate()).padStart(2, "0")}` +
      `${String(sekarang.getMonth() + 1).padStart(2, "0")}` +
      `${String(sekarang.getFullYear()).slice(-2)}`;

    const [countRows]: any = await conn.query(
      `
      SELECT COUNT(*) total
      FROM pengajuan_surat
      WHERE jenis_surat_id = ?
      `,
      [jenisSuratId]
    );

    const urut = String(
      countRows[0].total + 1
    ).padStart(4, "0");

    const kode_tracking =
      `${kodeSurat}-${tanggal}-${urut}`;

    // ===============================
    // Insert Pengajuan
    // ===============================

    const [result]: any = await conn.query(
      `
      INSERT INTO pengajuan_surat
      (
        jenis_surat_id,
        status,
        kode_tracking
      )
      VALUES
      (?, ?, ?)
      `,
      [
        jenisSuratId,
        "pending",
        kode_tracking,
      ]
    );

    const pengajuan_id = result.insertId;

    // ===============================
    // Insert Tabel Listrik
    // ===============================

    await conn.query(
      `
      INSERT INTO listrik
      (
        pengajuan_id,
        nama,
        ttl,
        nik,
        status_perkawinan,
        pekerjaan,
        alamat,
        dusun,
        rt,
        rw,
        idpel,
        jenis_meteran,
        keperluan,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        nama,
        ttl,
        nik,
        status_perkawinan,
        pekerjaan,
        alamat,
        dusun,
        rt,
        rw,
        idpel,
        jenis_meteran,
        keperluan,
        fileName,
      ]
    );

    await logActivity({
  pengajuanId: pengajuan_id,
  status: "pending",
  aktivitas: "Pengajuan surat berhasil dikirim.",
  conn,
});

    await conn.commit();

    return NextResponse.json({
      success: true,
      kode_tracking,
      message: "Pengajuan berhasil.",
    });

  } catch (error) {

    await conn.rollback();

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );

  } finally {

    conn.release();

  }
}