import { NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/activity";

import {
  writeFile,
  unlink,
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

  let newFilePath: string | null = null;
  let oldFilePath: string | null = null;
  let oldFileName: string | null = null;

  try {
    await conn.beginTransaction();

    const { id } =
      await context.params;

    const formData =
      await request.formData();

    // =====================================================
    // DATA PENDUDUK
    // =====================================================

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
        formData.get("jenis_kelamin") ?? ""
      ).trim();

    const status_perkawinan =
      String(
        formData.get("status_perkawinan") ?? ""
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
        formData.get("kewarganegaraan") ?? ""
      ).trim();

    // =====================================================
    // DATA KHUSUS SURAT JALAN
    // =====================================================

    const keperluan =
      String(
        formData.get("keperluan") ?? ""
      ).trim();

    // =====================================================
    // FILE KTP
    // =====================================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // =====================================================
    // VALIDASI NIK
    // =====================================================

    if (!/^\d{16}$/.test(nik)) {
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

    // =====================================================
    // CEK PENGAJUAN
    // =====================================================

    const [pengajuanRows]: any =
      await conn.query(
        `
        SELECT
          id,
          nik
        FROM pengajuan_surat
        WHERE id = ?
        LIMIT 1
        `,
        [id]
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
    // AMBIL FILE KTP LAMA
    // =====================================================

    const [rows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM jalan
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [id]
      );

    oldFileName =
      rows[0]?.file_ktp ?? null;

    let newFileName =
      oldFileName;

    // =====================================================
    // UPLOAD FILE KTP BARU
    // =====================================================

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      // ===============================
      // Validasi tipe file
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

      // ===============================
      // Validasi ukuran
      // ===============================

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

      // ===============================
      // Simpan file baru
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

      newFileName =
        `${randomUUID()}.${ext}`;

      const uploadPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          newFileName
        );

      await writeFile(
        uploadPath,
        buffer
      );

      newFilePath =
        uploadPath;

      // Simpan path file lama
      // untuk dihapus setelah commit
      if (oldFileName) {
        oldFilePath =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldFileName
          );
      }
    }

    // =====================================================
    // INSERT / UPDATE KEPENDUDUKAN
    // =====================================================

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
      // =================================================
      // INSERT PENDUDUK BARU
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
      // =================================================
      // UPDATE DATA PENDUDUK
      // =================================================

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

    // =====================================================
    // UPDATE NIK PADA PENGAJUAN
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
        id,
      ]
    );

    // =====================================================
    // UPDATE DETAIL SURAT JALAN
    // =====================================================

    await conn.query(
      `
      UPDATE jalan
      SET
        keperluan = ?,
        file_ktp = ?
      WHERE pengajuan_id = ?
      `,
      [
        keperluan,
        newFileName,
        id,
      ]
    );

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    await logActivity({
      pengajuanId:
        Number(id),
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
    // HAPUS FILE KTP LAMA
    // Dilakukan setelah commit berhasil
    // =====================================================

    if (
      newFilePath &&
      oldFilePath &&
      oldFileName &&
      oldFileName !== newFileName
    ) {
      try {
        if (
          fs.existsSync(
            oldFilePath
          )
        ) {
          await unlink(
            oldFilePath
          );
        }
      } catch (fileError) {
        console.error(
          "Gagal menghapus file KTP lama:",
          fileError
        );
      }
    }

    // File baru sudah menjadi bagian
    // dari data yang berhasil disimpan
    newFilePath = null;

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (err: any) {

    // =====================================================
    // ROLLBACK
    // =====================================================

    await conn.rollback();

    console.error(
      "PUT /api/pengajuan/jalan/[id] error:",
      err
    );

    // =====================================================
    // HAPUS FILE BARU JIKA DATABASE GAGAL
    // =====================================================

    if (newFilePath) {
      try {
        if (
          fs.existsSync(
            newFilePath
          )
        ) {
          await unlink(
            newFilePath
          );
        }
      } catch (fileError) {
        console.error(
          "Gagal menghapus file baru:",
          fileError
        );
      }
    }

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