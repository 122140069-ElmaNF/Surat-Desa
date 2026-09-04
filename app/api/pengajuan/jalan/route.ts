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
        message:
          "NIK harus terdiri dari 16 digit.",
      });
    }

    // ===============================
    // Cari Penduduk
    // ===============================

    const [rows]: any =
      await db.query(
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
      message:
        "Data penduduk belum terdaftar.",
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
  const conn =
    await db.getConnection();

  let uploadedFilePath:
    | string
    | null = null;

  let uploadedFileName:
    | string
    | null = null;

  let oldFileKtp:
    | string
    | null = null;

  try {
    await conn.beginTransaction();

    const formData =
      await request.formData();

    // =================================================
    // DATA PENDUDUK
    // =================================================

    const nama =
      String(
        formData.get("nama") ?? ""
      ).trim();

    const ttl =
      String(
        formData.get("ttl") ?? ""
      ).trim();

    const nik =
      String(
        formData.get("nik") ?? ""
      ).trim();

    const agama =
      String(
        formData.get("agama") ?? ""
      ).trim();

    const jenis_kelamin =
      String(
        formData.get(
          "jenis_kelamin"
        ) ?? ""
      ).trim();

    const status_perkawinan =
      String(
        formData.get(
          "status_perkawinan"
        ) ?? ""
      ).trim();

    const pekerjaan =
      String(
        formData.get("pekerjaan") ?? ""
      ).trim();

    const alamat =
      String(
        formData.get("alamat") ?? ""
      ).trim();

    const dusun =
      String(
        formData.get("dusun") ?? ""
      ).trim();

    const rt =
      String(
        formData.get("rt") ?? ""
      ).trim();

    const rw =
      String(
        formData.get("rw") ?? ""
      ).trim();

    const kewarganegaraan =
      String(
        formData.get(
          "kewarganegaraan"
        ) ?? ""
      ).trim();

    // =================================================
    // DATA KHUSUS SURAT JALAN
    // =================================================

    const keperluan =
      String(
        formData.get("keperluan") ?? ""
      ).trim();

    // =================================================
    // FILE KTP
    // =================================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // =================================================
    // VALIDASI NIK
    // =================================================

    if (
      !nik ||
      !/^\d{16}$/.test(nik)
    ) {
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
      !nama ||
      !ttl ||
      !agama ||
      !jenis_kelamin ||
      !status_perkawinan ||
      !pekerjaan ||
      !alamat ||
      !dusun ||
      !rt ||
      !rw ||
      !kewarganegaraan ||
      !keperluan
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

    if (
      fileKtp.size > maxSize
    ) {
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
    // AMBIL KTP LAMA DARI KEPENDUDUKAN
    // =================================================

    const [oldKtpRows]: any =
      await conn.query(
        `
        SELECT
          file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    if (
      oldKtpRows.length > 0
    ) {
      oldFileKtp =
        oldKtpRows[0]
          ?.file_ktp ?? null;
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

    uploadedFileName =
      `${randomUUID()}.${ext}`;

    const uploadPath =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "ktp",
        uploadedFileName
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
        SELECT
          id,
          kode_surat
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
        kewarganegaraan,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        kewarganegaraan = VALUES(kewarganegaraan),
        file_ktp = VALUES(file_ktp)
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
        uploadedFileName,
      ]
    );

    // =================================================
    // GENERATE KODE TRACKING
    // =================================================

    const sekarang =
      new Date();

    const tanggal =
      `${String(
        sekarang.getDate()
      ).padStart(2, "0")}` +
      `${String(
        sekarang.getMonth() + 1
      ).padStart(2, "0")}` +
      `${String(
        sekarang.getFullYear()
      ).slice(-2)}`;

    const [countRows]: any =
      await conn.query(
        `
        SELECT
          COUNT(*) AS total
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
        keperluan
      )
      VALUES
      (?, ?)
      `,
      [
        pengajuan_id,
        keperluan,
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

    // =================================================
    // HAPUS FILE KTP LAMA
    // =================================================

    if (
      oldFileKtp &&
      oldFileKtp !== uploadedFileName
    ) {
      try {
        const oldFilePath =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldFileKtp
          );

        await unlink(
          oldFilePath
        );
      } catch {
        // Abaikan jika file lama
        // sudah tidak ada
      }
    }

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
    // HAPUS FILE BARU JIKA DATABASE GAGAL
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