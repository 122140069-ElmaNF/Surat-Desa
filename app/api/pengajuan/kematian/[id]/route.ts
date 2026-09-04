import { NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/activity";

import {
  writeFile,
  unlink,
  mkdir,
} from "fs/promises";

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const conn =
    await db.getConnection();

  let uploadedFilePath:
    string | null = null;

  try {
    await conn.beginTransaction();

    const { id } =
      await context.params;

    const pengajuanId =
      Number(id);

    // =====================================================
    // VALIDASI ID
    // =====================================================

    if (
      !Number.isInteger(
        pengajuanId
      )
    ) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "ID pengajuan tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

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
    // VALIDASI DATA
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
    // CEK DATA PENGAJUAN
    // =====================================================

    const [pengajuanRows]: any =
      await conn.query(
        `
        SELECT
          id,
          nik,
          status
        FROM pengajuan_surat
        WHERE id = ?
        LIMIT 1
        `,
        [pengajuanId]
      );

    if (
      pengajuanRows.length === 0
    ) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Data pengajuan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // CEK DATA KEMATIAN
    // =====================================================

    const [kematianRows]: any =
      await conn.query(
        `
        SELECT
          file_ktp
        FROM kematian
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [pengajuanId]
      );

    if (
      kematianRows.length === 0
    ) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Data kematian tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const oldFile =
      kematianRows[0]?.file_ktp ??
      null;

    let newFileName =
      oldFile;

    // =====================================================
    // FILE KTP BARU
    // =====================================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {

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

      if (
        fileKtp.size >
        5 * 1024 * 1024
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

      // ===================================================
      // FOLDER UPLOAD
      // ===================================================

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

      // ===================================================
      // UPLOAD FILE BARU
      // ===================================================

      const bytes =
        await fileKtp.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      newFileName =
        `${randomUUID()}.${ext}`;

      const uploadPath =
        path.join(
          uploadDir,
          newFileName
        );

      await writeFile(
        uploadPath,
        buffer
      );

      uploadedFilePath =
        uploadPath;
    }

    // =====================================================
    // SIMPAN / UPDATE KEPENDUDUKAN
    // =====================================================

    const [pendudukRows]: any =
      await conn.query(
        `
        SELECT
          nik
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    if (
      pendudukRows.length === 0
    ) {

      // ===================================================
      // NIK BELUM ADA
      // ===================================================

      await conn.query(
        `
        INSERT INTO kependudukan
        (
          nik,
          nama,
          agama,
          jenis_kelamin,
          pekerjaan,
          alamat
        )
        VALUES
        (?, ?, ?, ?, ?, ?)
        `,
        [
          nik,
          nama,
          agama,
          jenis_kelamin,
          pekerjaan,
          alamat,
        ]
      );

    } else {

      // ===================================================
      // NIK SUDAH ADA
      // Update hanya data yang tersedia
      // pada form Kematian.
      // ===================================================

      await conn.query(
        `
        UPDATE kependudukan
        SET
          nama = ?,
          agama = ?,
          jenis_kelamin = ?,
          pekerjaan = ?,
          alamat = ?
        WHERE nik = ?
        `,
        [
          nama,
          agama,
          jenis_kelamin,
          pekerjaan,
          alamat,
          nik,
        ]
      );

    }

    // =====================================================
    // UPDATE PENGAJUAN
    //
    // NIK berada di pengajuan_surat.
    // =====================================================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        nik = ?,
        status = 'pending',
        alasan_penolakan = NULL
      WHERE id = ?
      `,
      [
        nik,
        pengajuanId,
      ]
    );

    // =====================================================
    // UPDATE DATA KEMATIAN
    //
    // TIDAK ADA nik DI SINI.
    // =====================================================

    await conn.query(
      `
      UPDATE kematian
      SET
        hari = ?,
        tanggal = ?,
        umur = ?,
        jam = ?,
        bertempat_di = ?,
        penyebab = ?,
        pelapor = ?,
        hubungan_pelapor = ?,
        file_ktp = ?
      WHERE pengajuan_id = ?
      `,
      [
        hari,
        tanggal,
        umur,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor,
        newFileName,
        pengajuanId,
      ]
    );

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    await logActivity({
      pengajuanId:
        pengajuanId,

      status:
        "pending",

      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",

      conn,
    });

    // =====================================================
    // COMMIT
    // =====================================================

    await conn.commit();

    // =====================================================
    // HAPUS FILE LAMA
    // Setelah database berhasil diperbarui.
    // =====================================================

    if (
      fileKtp &&
      fileKtp.size > 0 &&
      oldFile &&
      newFileName !== oldFile
    ) {

      const oldPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          oldFile
        );

      try {

        if (
          fs.existsSync(
            oldPath
          )
        ) {
          await unlink(
            oldPath
          );
        }

      } catch (fileError) {

        console.error(
          "Gagal menghapus file KTP lama:",
          fileError
        );

      }
    }

    uploadedFilePath = null;

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (err: any) {

    await conn.rollback();

    // =====================================================
    // HAPUS FILE BARU JIKA TRANSAKSI GAGAL
    // =====================================================

    if (uploadedFilePath) {

      try {

        await unlink(
          uploadedFilePath
        );

      } catch {
        // Abaikan jika file tidak ditemukan
      }

    }

    console.error(
      "ERROR EDIT PENGAJUAN KEMATIAN:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ??
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