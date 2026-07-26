import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    const formData =
      await request.formData();

    const nama =
      formData.get("nama") as string;

    const nik =
      formData.get("nik") as string;

    const agama =
      formData.get("agama") as string;

    const jenis_kelamin =
      formData.get("jenis_kelamin") as string;

    const umur =
      formData.get("umur") as string;

    const pekerjaan =
      formData.get("pekerjaan") as string;

    const alamat =
      formData.get("alamat") as string;

    const hari =
      formData.get("hari") as string;

    const tanggal =
      formData.get("tanggal") as string;

    const jam =
      formData.get("jam") as string;

    const bertempat_di =
      formData.get("bertempat_di") as string;

    const penyebab =
      formData.get("penyebab") as string;

    const pelapor =
      formData.get("pelapor") as string;

    const hubungan_pelapor =
      formData.get("hubungan_pelapor") as string;

    const fileKtp =
      formData.get("file_ktp") as File | null;

    if (!fileKtp) {

      return NextResponse.json(
        {
          success: false,
          message:
            "File KTP wajib diupload.",
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

    if (
      !allowedTypes.includes(
        fileKtp.type
      )
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "File harus berupa JPG atau PNG.",
        },
        {
          status: 400,
        }
      );

    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      fileKtp.size > maxSize
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Ukuran file maksimal 5 MB.",
        },
        {
          status: 400,
        }
      );

    }

    // ===============================
    // Upload File
    // ===============================

    const bytes =
      await fileKtp.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const ext =
      fileKtp.name
        .split(".")
        .pop()
        ?.toLowerCase();

    const fileName =
      `${randomUUID()}.${ext}`;

    const uploadPath =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "ktp",
        fileName
      );

    await writeFile(
      uploadPath,
      buffer
    );

    // ===============================
    // Ambil Kode Surat
    // ===============================

    const [jenisRows]: any =
      await conn.query(
        `
        SELECT
          id,
          kode_surat
        FROM jenis_surat
        WHERE kode_surat='SKM'
        `
      );

    const kodeSurat =
      jenisRows[0].kode_surat;

    const jenisSuratId =
      jenisRows[0].id;

    // ===============================
    // Generate Tracking
    // ===============================

    const sekarang =
      new Date();

    const tanggalTracking =
      `${String(
        sekarang.getDate()
      ).padStart(2, "0")}${String(
        sekarang.getMonth() + 1
      ).padStart(2, "0")}${String(
        sekarang.getFullYear()
      ).slice(-2)}`;

    const [countRows]: any =
      await conn.query(
        `
        SELECT COUNT(*) total
        FROM pengajuan_surat
        WHERE jenis_surat_id=?
        `,
        [jenisSuratId]
      );

    const urut =
      String(
        countRows[0].total + 1
      ).padStart(4, "0");

    const kode_tracking =
      `${kodeSurat}-${tanggalTracking}-${urut}`;

    // ===============================
    // Insert Pengajuan
    // ===============================

    const [result]: any =
      await conn.query(
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

    const pengajuan_id =
      result.insertId;

    // ===============================
    // Insert Kematian
    // ===============================

    await conn.query(
      `
      INSERT INTO kematian
      (
        pengajuan_id,
        nama,
        nik,
        agama,
        jenis_kelamin,
        umur,
        pekerjaan,
        alamat,
        hari,
        tanggal,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        nama,
        nik,
        agama,
        jenis_kelamin,
        umur,
        pekerjaan,
        alamat,
        hari,
        tanggal,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor,
        fileName,
      ]
    );

    await conn.commit();

    return NextResponse.json({
      success: true,
      kode_tracking,
      message:
        "Pengajuan berhasil.",
    });

  } catch (error) {

    await conn.rollback();

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );

  } finally {

    conn.release();

  }

}