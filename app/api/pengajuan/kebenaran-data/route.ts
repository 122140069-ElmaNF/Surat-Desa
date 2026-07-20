import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    const nama = formData.get("nama") as string;
    const ttl = formData.get("ttl") as string;
    const nik = formData.get("nik") as string;
    const jenis_kelamin = formData.get("jenis_kelamin") as string;
    const status_perkawinan = formData.get("status_perkawinan") as string;
    const alamat = formData.get("alamat") as string;
    const no_hp = formData.get("no_hp") as string;
    const nomor_porsi = formData.get("nomor_porsi") as string;
    const bin_binti = formData.get("bin_binti") as string;

    const fileKtp = formData.get("file_ktp") as File | null;
    const fileKk = formData.get("file_kk") as File | null;

    if (!fileKtp || !fileKk) {
      return NextResponse.json(
        {
          success: false,
          message: "File KTP dan KK wajib diupload.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    const maxSize = 5 * 1024 * 1024;

    for (const file of [fileKtp, fileKk]) {
      if (!allowedTypes.includes(file.type)) {
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

      if (file.size > maxSize) {
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
    }

    // ===============================
    // Upload KTP
    // ===============================

    const ktpExt = fileKtp.name.split(".").pop()?.toLowerCase();

    const ktpName = `${randomUUID()}.${ktpExt}`;

    await writeFile(
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "ktp",
        ktpName
      ),
      Buffer.from(await fileKtp.arrayBuffer())
    );

    // ===============================
    // Upload KK
    // ===============================

    const kkExt = fileKk.name.split(".").pop()?.toLowerCase();

    const kkName = `${randomUUID()}.${kkExt}`;

    await writeFile(
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "kk",
        kkName
      ),
      Buffer.from(await fileKk.arrayBuffer())
    );

    // ===============================
    // Ambil Jenis Surat
    // ===============================

    const [jenisRows]: any = await conn.query(
      `
      SELECT id, kode_surat
      FROM jenis_surat
      WHERE kode_surat = 'SKKD'
      `
    );

    const jenisSuratId = jenisRows[0].id;
    const kodeSurat = jenisRows[0].kode_surat;

    // ===============================
    // Generate Tracking
    // ===============================

    const sekarang = new Date();

    const tanggal = `${String(
      sekarang.getDate()
    ).padStart(2, "0")}${String(
      sekarang.getMonth() + 1
    ).padStart(2, "0")}${String(
      sekarang.getFullYear()
    ).slice(-2)}`;

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
    // Insert Kebenaran Data
    // ===============================

    await conn.query(
      `
      INSERT INTO kebenaran_data
      (
        pengajuan_id,
        nama,
        ttl,
        nik,
        jenis_kelamin,
        status_perkawinan,
        alamat,
        no_hp,
        nomor_porsi,
        bin_binti,
        file_ktp,
        file_kk
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        nama,
        ttl,
        nik,
        jenis_kelamin,
        status_perkawinan,
        alamat,
        no_hp,
        nomor_porsi,
        bin_binti,
        ktpName,
        kkName,
      ]
    );

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