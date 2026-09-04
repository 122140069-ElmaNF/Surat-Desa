import db from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

// =====================================================
// GET - CARI DATA PENDUDUK BERDASARKAN NIK
// =====================================================

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const nik =
      searchParams.get("nik")?.trim() ?? "";

    // ===============================
    // Validasi NIK
    // ===============================

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json({
        success: true,
        found: false,
        message: "NIK harus terdiri dari 16 digit.",
      });
    }

    // ===============================
    // Cari Penduduk
    // ===============================

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

    // ===============================
    // NIK DITEMUKAN
    // ===============================

    if (rows.length > 0) {
      return NextResponse.json({
        success: true,
        found: true,
        data: rows[0],
      });
    }

    // ===============================
    // NIK BELUM DITEMUKAN
    // ===============================

    return NextResponse.json({
      success: true,
      found: false,
      message: "Data penduduk belum terdaftar.",
    });

  } catch (error) {
    console.error(
      "GET /api/pengajuan/jalan error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat mencari data penduduk.",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST - AJUKAN SURAT KETERANGAN JALAN
// =====================================================

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedFilePath: string | null = null;

  try {
    await conn.beginTransaction();

    const formData =
      await request.formData();

    // =================================================
    // DATA PENDUDUK
    // =================================================

    const nama =
      formData.get("nama") as string;

    const ttl =
      formData.get("ttl") as string;

    const nik =
      formData.get("nik") as string;

    const agama =
      formData.get("agama") as string;

    const jenis_kelamin =
      formData.get("jenis_kelamin") as string;

    const status_perkawinan =
      formData.get("status_perkawinan") as string;

    const pekerjaan =
      formData.get("pekerjaan") as string;

    const alamat =
      formData.get("alamat") as string;

    const dusun =
      formData.get("dusun") as string;

    const rt =
      formData.get("rt") as string;

    const rw =
      formData.get("rw") as string;

    const kewarganegaraan =
      formData.get("kewarganegaraan") as string;

    // =================================================
    // DATA KHUSUS SURAT JALAN
    // =================================================

    const keperluan =
      formData.get("keperluan") as string;

    // =================================================
    // FILE KTP
    // =================================================

    const fileKtp =
      formData.get("file_ktp") as File | null;

    // =================================================
    // VALIDASI NIK
    // =================================================

    if (!nik || !/^\d{16}$/.test(nik)) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "NIK harus terdiri dari 16 digit.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // VALIDASI DATA WAJIB
    // =================================================

    if (
      !nama?.trim() ||
      !ttl?.trim() ||
      !agama?.trim() ||
      !jenis_kelamin?.trim() ||
      !status_perkawinan?.trim() ||
      !pekerjaan?.trim() ||
      !alamat?.trim() ||
      !dusun?.trim() ||
      !rt?.trim() ||
      !rw?.trim() ||
      !kewarganegaraan?.trim() ||
      !keperluan?.trim()
    ) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Data pengajuan belum lengkap.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // VALIDASI FILE KTP
    // =================================================

    if (!fileKtp) {
      await conn.rollback();

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

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        fileKtp.type
      )
    ) {
      await conn.rollback();

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

    if (fileKtp.size > maxSize) {
      await conn.rollback();

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

    // =================================================
    // UPLOAD FILE KTP
    // =================================================

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

    uploadedFilePath =
      uploadPath;

    // =================================================
    // AMBIL JENIS SURAT
    // =================================================

    const [jenisRows]: any =
      await conn.query(
        `
        SELECT id, kode_surat
        FROM jenis_surat
        WHERE kode_surat = 'SKJ'
        LIMIT 1
        `
      );

    if (
      !jenisRows ||
      jenisRows.length === 0
    ) {
      throw new Error(
        "Jenis surat SKJ tidak ditemukan."
      );
    }

    const jenisSuratId =
      jenisRows[0].id;

    const kodeSurat =
      jenisRows[0].kode_surat;

    // =================================================
    // UPDATE / INSERT KEPENDUDUKAN
    // =================================================

    const [pendudukRows]: any =
      await conn.query(
        `
        SELECT nik
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    if (
      pendudukRows.length === 0
    ) {
      // =============================
      // INSERT PENDUDUK BARU
      // =============================

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
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    } else {
      // =============================
      // UPDATE PENDUDUK
      // =============================

      await conn.query(
        `
        UPDATE kependudukan
        SET
          nama = ?,
          ttl = ?,
          agama = ?,
          jenis_kelamin = ?,
          status_perkawinan = ?,
          pekerjaan = ?,
          alamat = ?,
          dusun = ?,
          rt = ?,
          rw = ?,
          kewarganegaraan = ?
        WHERE nik = ?
        `,
        [
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
          nik,
        ]
      );
    }

    // =================================================
    // GENERATE KODE TRACKING
    // =================================================

    const sekarang =
      new Date();

    const tanggal =
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
        WHERE jenis_surat_id = ?
        `,
        [jenisSuratId]
      );

    const urut =
      String(
        Number(
          countRows[0].total
        ) + 1
      ).padStart(4, "0");

    const kode_tracking =
      `${kodeSurat}-${tanggal}-${urut}`;

    // =================================================
    // INSERT PENGAJUAN SURAT
    // =================================================

    const [result]: any =
      await conn.query(
        `
        INSERT INTO pengajuan_surat
        (
          jenis_surat_id,
          nik,
          status,
          kode_tracking
        )
        VALUES
        (?, ?, ?, ?)
        `,
        [
          jenisSuratId,
          nik,
          "pending",
          kode_tracking,
        ]
      );

    const pengajuan_id =
      result.insertId;

    // =================================================
    // INSERT DETAIL SURAT JALAN
    // =================================================

    await conn.query(
      `
      INSERT INTO jalan
      (
        pengajuan_id,
        keperluan,
        file_ktp
      )
      VALUES
      (?, ?, ?)
      `,
      [
        pengajuan_id,
        keperluan,
        fileName,
      ]
    );

    // =================================================
    // LOG AKTIVITAS
    // =================================================

    await logActivity({
      pengajuanId:
        pengajuan_id,
      status: "pending",
      aktivitas:
        "Pengajuan surat berhasil dikirim.",
      conn,
    });

    // =================================================
    // COMMIT
    // =================================================

    await conn.commit();

    uploadedFilePath = null;

    return NextResponse.json({
      success: true,
      kode_tracking,
      message:
        "Pengajuan berhasil.",
    });

  } catch (error) {
    // =================================================
    // ROLLBACK
    // =================================================

    await conn.rollback();

    console.error(
      "POST /api/pengajuan/jalan error:",
      error
    );

    // =================================================
    // HAPUS FILE JIKA DATABASE GAGAL
    // =================================================

    if (uploadedFilePath) {
      try {
        await unlink(
          uploadedFilePath
        );
      } catch (fileError) {
        console.error(
          "Gagal menghapus file:",
          fileError
        );
      }
    }

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