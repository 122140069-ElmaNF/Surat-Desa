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

  let newFilePath:
    | string
    | null = null;

  let oldFilePath:
    | string
    | null = null;

  let oldFileName:
    | string
    | null = null;

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
        formData.get(
          "pekerjaan"
        ) ?? ""
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

    // =====================================================
    // DATA KHUSUS SURAT JALAN
    // =====================================================

    const keperluan =
      String(
        formData.get(
          "keperluan"
        ) ?? ""
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
    // NIK LAMA
    // =====================================================

    const oldNik =
      pengajuanRows[0]?.nik ?? null;

    // =====================================================
    // AMBIL FILE KTP DARI KEPENDUDUKAN
    // =====================================================

    if (oldNik) {
      const [oldKtpRows]: any =
        await conn.query(
          `
          SELECT
            file_ktp
          FROM kependudukan
          WHERE nik = ?
          LIMIT 1
          `,
          [oldNik]
        );

      oldFileName =
        oldKtpRows[0]
          ?.file_ktp ?? null;
    }

    // =====================================================
    // TENTUKAN FILE KTP
    // =====================================================

    let newFileName =
      oldFileName;

    // =====================================================
    // UPLOAD FILE KTP BARU
    // =====================================================

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      // ===============================================
      // VALIDASI TIPE FILE
      // ===============================================

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

      // ===============================================
      // VALIDASI UKURAN FILE
      // ===============================================

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

      // ===============================================
      // SIMPAN FILE BARU
      // ===============================================

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

      // ===============================================
      // SIMPAN PATH FILE LAMA
      // UNTUK DIHAPUS SETELAH COMMIT
      // ===============================================

      if (
        oldFileName &&
        oldFileName !== newFileName
      ) {
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
        newFileName,
      ]
    );

    // =====================================================
    // UPDATE PENGAJUAN SURAT
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
        keperluan = ?
      WHERE pengajuan_id = ?
      `,
      [
        keperluan,
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
    // HANYA JIKA ADA FILE BARU
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

    // File baru sudah berhasil
    // disimpan ke database
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