import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nik = searchParams.get("nik");

    if (!nik) {
      return NextResponse.json({
        success: false,
        found: false,
        message: "NIK tidak ditemukan.",
      });
    }

    const [rows]: any = await db.query(
      `
      SELECT
        nik,
        nama,
        ttl,
        agama,
        jenis_kelamin,
        status_perkawinan,
        pekerjaan,
        alamat,
        dusun,
        rt,
        rw,
        kewarganegaraan
      FROM kependudukan
      WHERE nik = ?
      LIMIT 1
      `,
      [nik]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("GET KEHILANGAN:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mencari data penduduk.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedFileName: string | null = null;

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    // ===============================
    // Data Kependudukan
    // ===============================

    const nik = String(formData.get("nik") ?? "").trim();
    const nama = String(formData.get("nama") ?? "").trim();
    const ttl = String(formData.get("ttl") ?? "").trim();
    const agama = String(formData.get("agama") ?? "").trim();
    const jenis_kelamin = String(
      formData.get("jenis_kelamin") ?? ""
    ).trim();
    const status_perkawinan = String(
      formData.get("status_perkawinan") ?? ""
    ).trim();
    const pekerjaan = String(
      formData.get("pekerjaan") ?? ""
    ).trim();
    const alamat = String(
      formData.get("alamat") ?? ""
    ).trim();
    const dusun = String(
      formData.get("dusun") ?? ""
    ).trim();
    const rt = String(
      formData.get("rt") ?? ""
    ).trim();
    const rw = String(
      formData.get("rw") ?? ""
    ).trim();
    const kewarganegaraan = String(
      formData.get("kewarganegaraan") ?? ""
    ).trim();

    // ===============================
    // Data Khusus Kehilangan
    // ===============================

    const barang_hilang = String(
      formData.get("barang_hilang") ?? ""
    ).trim();

    const fileKtp =
      formData.get("file_ktp") as File | null;

    // ===============================
    // Validasi Data
    // ===============================

    if (!nik) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    if (!nama) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!barang_hilang) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang yang hilang wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!fileKtp) {
      return NextResponse.json(
        {
          success: false,
          message: "File KTP wajib diupload.",
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (fileKtp.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran file maksimal 5 MB.",
        },
        { status: 400 }
      );
    }

    // ===============================
    // Upload File KTP
    // ===============================

    const bytes = await fileKtp.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = fileKtp.name
      .split(".")
      .pop()
      ?.toLowerCase();

    uploadedFileName = `${randomUUID()}.${ext}`;

    const uploadPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "ktp",
      uploadedFileName
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
      WHERE kode_surat = 'SKH'
      LIMIT 1
      `
    );

    if (jenisRows.length === 0) {
      throw new Error(
        "Jenis surat SKH tidak ditemukan."
      );
    }

    const jenisSuratId = jenisRows[0].id;
    const kodeSurat = jenisRows[0].kode_surat;

    // ===============================
    // Update / Insert Kependudukan
    // ===============================

    await conn.query(
      `
      INSERT INTO kependudukan
      (
        nik,
        nama,
        ttl,
        agama,
        jenis_kelamin,
        status_perkawinan,
        pekerjaan,
        alamat,
        dusun,
        rt,
        rw,
        kewarganegaraan
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        ttl = VALUES(ttl),
        agama = VALUES(agama),
        jenis_kelamin = VALUES(jenis_kelamin),
        status_perkawinan = VALUES(status_perkawinan),
        pekerjaan = VALUES(pekerjaan),
        alamat = VALUES(alamat),
        dusun = VALUES(dusun),
        rt = VALUES(rt),
        rw = VALUES(rw),
        kewarganegaraan = VALUES(kewarganegaraan)
      `,
      [
        nik,
        nama,
        ttl,
        agama,
        jenis_kelamin,
        status_perkawinan,
        pekerjaan,
        alamat,
        dusun,
        rt,
        rw,
        kewarganegaraan,
      ]
    );

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
      SELECT COUNT(*) AS total
      FROM pengajuan_surat
      WHERE jenis_surat_id = ?
      `,
      [jenisSuratId]
    );

    const urut = String(
      Number(countRows[0].total) + 1
    ).padStart(4, "0");

    const kode_tracking =
      `${kodeSurat}-${tanggal}-${urut}`;

    // ===============================
    // Insert Pengajuan Surat
    // ===============================

    const [result]: any = await conn.query(
      `
      INSERT INTO pengajuan_surat
      (
        jenis_surat_id,
        nik,
        status,
        kode_tracking
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        jenisSuratId,
        nik,
        "pending",
        kode_tracking,
      ]
    );

    const pengajuan_id = result.insertId;

    // ===============================
    // Insert Detail Kehilangan
    // ===============================

    await conn.query(
      `
      INSERT INTO kehilangan
      (
        pengajuan_id,
        barang_hilang,
        file_ktp
      )
      VALUES (?, ?, ?)
      `,
      [
        pengajuan_id,
        barang_hilang,
        uploadedFileName,
      ]
    );

    // ===============================
    // Activity Log
    // ===============================

    await logActivity({
      conn,
      pengajuanId: pengajuan_id,
      status: "pending",
      aktivitas: "Pengajuan surat berhasil dikirim.",
    });

    // ===============================
    // Commit
    // ===============================

    await conn.commit();

    return NextResponse.json({
      success: true,
      kode_tracking,
      message: "Pengajuan berhasil.",
    });
  } catch (error) {
    await conn.rollback();

    console.error("POST KEHILANGAN:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}