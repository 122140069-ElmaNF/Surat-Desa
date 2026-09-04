import db from "@/lib/db";
import {
  writeFile,
  mkdir,
  unlink,
} from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

// =========================================================
// GET - LOOKUP DATA PENDUDUK BERDASARKAN NIK
// =========================================================

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const nik =
      searchParams.get("nik");

    if (
      !nik ||
      !/^\d{16}$/.test(nik)
    ) {
      return NextResponse.json({
        success: false,
        found: false,
        message:
          "NIK harus terdiri dari 16 digit.",
      });
    }

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

    if (
      rows.length === 0
    ) {
      return NextResponse.json({
        success: true,
        found: false,
        message:
          "Data penduduk tidak ditemukan.",
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      data: rows[0],
      message:
        "Data penduduk ditemukan dan telah diisi otomatis.",
    });

  } catch (error) {
    console.error(
      "ERROR LOOKUP KEMATIAN:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        found: false,
        message:
          "Terjadi kesalahan saat mencari data penduduk.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================================================
// POST - PENGAJUAN SURAT KEMATIAN
// =========================================================

export async function POST(
  request: Request
) {
  const conn =
    await db.getConnection();

  let uploadedFilePath:
    | string
    | null = null;

  let oldFileName:
    | string
    | null = null;

  try {
    await conn.beginTransaction();

    const formData =
      await request.formData();

    // =====================================================
    // DATA IDENTITAS PENDUDUK
    // =====================================================

    const nik =
      String(
        formData.get("nik") ?? ""
      ).trim();

    const nama =
      String(
        formData.get("nama") ?? ""
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

    const pekerjaan =
      String(
        formData.get(
          "pekerjaan"
        ) ?? ""
      ).trim();

    const alamat =
      String(
        formData.get(
          "alamat"
        ) ?? ""
      ).trim();

    // =====================================================
    // DATA KHUSUS KEMATIAN
    // =====================================================

    const hari =
      String(
        formData.get("hari") ?? ""
      ).trim();

    const tanggal =
      String(
        formData.get("tanggal") ?? ""
      ).trim();

    const umur =
      String(
        formData.get("umur") ?? ""
      ).trim();

    const jam =
      String(
        formData.get("jam") ?? ""
      ).trim();

    const bertempat_di =
      String(
        formData.get(
          "bertempat_di"
        ) ?? ""
      ).trim();

    const penyebab =
      String(
        formData.get(
          "penyebab"
        ) ?? ""
      ).trim();

    const pelapor =
      String(
        formData.get(
          "pelapor"
        ) ?? ""
      ).trim();

    const hubungan_pelapor =
      String(
        formData.get(
          "hubungan_pelapor"
        ) ?? ""
      ).trim();

    // =====================================================
    // VALIDASI NIK
    // =====================================================

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

    // =====================================================
    // VALIDASI DATA WAJIB
    // =====================================================

    if (!nama) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Nama wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!jenis_kelamin) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Jenis kelamin wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!umur) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Umur wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!agama) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Agama wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!pekerjaan) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Pekerjaan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!alamat) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Alamat wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!hari) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Hari kematian wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!tanggal) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Tanggal kematian wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!jam) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Jam kematian wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!bertempat_di) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Tempat kematian wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!penyebab) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Penyebab kematian wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!pelapor) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Nama pelapor wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!hubungan_pelapor) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Hubungan pelapor wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VALIDASI FILE KTP
    // =====================================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    if (
      !fileKtp ||
      fileKtp.size === 0
    ) {
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
      "image/jpg",
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
            "File harus berupa JPG, JPEG, atau PNG.",
        },
        {
          status: 400,
        }
      );
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      fileKtp.size >
      maxSize
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

    // =====================================================
    // AMBIL KTP LAMA DARI KEPENDUDUKAN
    // =====================================================

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
      oldFileName =
        oldKtpRows[0]
          ?.file_ktp ?? null;
    }

    // =====================================================
    // UPLOAD FILE KTP
    // =====================================================

    const uploadDir =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "ktp"
      );

    await mkdir(
      uploadDir,
      {
        recursive: true,
      }
    );

    const bytes =
      await fileKtp.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const ext =
      fileKtp.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "jpg";

    const fileName =
      `${randomUUID()}.${ext}`;

    const uploadPath =
      path.join(
        uploadDir,
        fileName
      );

    await writeFile(
      uploadPath,
      buffer
    );

    uploadedFilePath =
      uploadPath;

    // =====================================================
    // AMBIL JENIS SURAT
    // =====================================================

    const [jenisRows]: any =
      await conn.query(
        `
        SELECT
          id,
          kode_surat
        FROM jenis_surat
        WHERE kode_surat = 'SKM'
        LIMIT 1
        `
      );

    if (
      jenisRows.length === 0
    ) {
      throw new Error(
        "Jenis surat SKM tidak ditemukan."
      );
    }

    const kodeSurat =
      jenisRows[0].kode_surat;

    const jenisSuratId =
      jenisRows[0].id;

    // =====================================================
    // UPDATE / INSERT KEPENDUDUKAN
    // =====================================================

    await conn.query(
      `
      INSERT INTO kependudukan
      (
        nik,
        nama,
        agama,
        jenis_kelamin,
        pekerjaan,
        alamat,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        agama = VALUES(agama),
        jenis_kelamin = VALUES(jenis_kelamin),
        pekerjaan = VALUES(pekerjaan),
        alamat = VALUES(alamat),
        file_ktp = VALUES(file_ktp)
      `,
      [
        nik,
        nama,
        agama,
        jenis_kelamin,
        pekerjaan,
        alamat,
        fileName,
      ]
    );

    // =====================================================
    // GENERATE KODE TRACKING
    // =====================================================

    const sekarang =
      new Date();

    const tanggalTracking =
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
      `${kodeSurat}-${tanggalTracking}-${urut}`;

    // =====================================================
    // INSERT PENGAJUAN SURAT
    // =====================================================

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

    // =====================================================
    // INSERT DETAIL KEMATIAN
    //
    // NIK TIDAK DISIMPAN DI TABEL KEMATIAN.
    // FILE KTP JUGA TIDAK DISIMPAN DI SINI.
    // =====================================================

    await conn.query(
      `
      INSERT INTO kematian
      (
        pengajuan_id,
        hari,
        tanggal,
        umur,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        hari,
        tanggal,
        umur,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor,
      ]
    );

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    await logActivity({
      conn,
      pengajuanId:
        pengajuan_id,
      status:
        "pending",
      aktivitas:
        "Pengajuan surat berhasil dikirim.",
    });

    // =====================================================
    // COMMIT
    // =====================================================

    await conn.commit();

    // File baru sudah tersimpan
    // dan tidak perlu dihapus
    uploadedFilePath = null;

    // =====================================================
    // HAPUS FILE KTP LAMA
    // =====================================================

    if (
      oldFileName &&
      oldFileName !== fileName
    ) {
      try {
        const oldFilePath =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldFileName
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

    await conn.rollback();

    // =====================================================
    // HAPUS FILE BARU JIKA DATABASE GAGAL
    // =====================================================

    if (uploadedFilePath) {
      try {
        await unlink(
          uploadedFilePath
        );
      } catch {
        // Abaikan jika file sudah tidak ada
      }
    }

    console.error(
      "ERROR PENGAJUAN KEMATIAN:",
      error
    );

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