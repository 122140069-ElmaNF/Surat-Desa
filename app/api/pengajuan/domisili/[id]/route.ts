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
  const conn = await db.getConnection();

  let newFilePath: string | null = null;
  let oldFilePath: string | null = null;

  try {
    await conn.beginTransaction();

    const { id } = await context.params;

    const formData = await request.formData();

    // ===============================
    // Ambil data dari form
    // ===============================

    const nama =
      String(formData.get("nama") ?? "");

    const ttl =
      String(formData.get("ttl") ?? "");

    const nik =
      String(formData.get("nik") ?? "");

    const agama =
      String(formData.get("agama") ?? "");

    const jenis_kelamin =
      String(
        formData.get("jenis_kelamin") ?? ""
      );

    const pekerjaan =
      String(
        formData.get("pekerjaan") ?? ""
      );

    const alamat =
      String(
        formData.get("alamat") ?? ""
      );

    const dusun =
      String(
        formData.get("dusun") ?? ""
      );

    const rt =
      String(formData.get("rt") ?? "");

    const rw =
      String(formData.get("rw") ?? "");

    const fileKtp =
      formData.get("file_ktp") as File | null;

    // ===============================
    // Validasi NIK
    // ===============================

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

    // ===============================
    // Pastikan pengajuan ada
    // ===============================

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
        [id]
      );

    if (pengajuanRows.length === 0) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Pengajuan surat tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // ===============================
    // Pastikan data domisili ada
    // ===============================

    const [domisiliRows]: any =
      await conn.query(
        `
        SELECT id
        FROM domisili
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [id]
      );

    if (domisiliRows.length === 0) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Data domisili tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // ===============================
    // Ambil data KTP lama
    // dari kependudukan
    // ===============================

    const [pendudukRows]: any =
      await conn.query(
        `
        SELECT
          nik,
          file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    let oldFile: string | null = null;

    if (pendudukRows.length > 0) {
      oldFile =
        pendudukRows[0]?.file_ktp ?? null;
    }

    // ===============================
    // Upload KTP baru
    // ===============================

    let newFileName =
      oldFile;

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

      newFilePath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          newFileName
        );

      await writeFile(
        newFilePath,
        buffer
      );
    }

    // ===============================
    // Cek apakah NIK sudah ada
    // ===============================

    const [existingPendudukRows]: any =
      await conn.query(
        `
        SELECT nik
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    // ===============================
    // Simpan / Update Kependudukan
    // ===============================

    if (
      existingPendudukRows.length === 0
    ) {
      // ===============================
      // NIK belum ada
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
          pekerjaan,
          alamat,
          dusun,
          rt,
          rw,
          file_ktp
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nik,
          nama,
          ttl,
          agama,
          jenis_kelamin,
          pekerjaan,
          alamat,
          dusun,
          rt,
          rw,
          newFileName,
        ]
      );

    } else {
      // ===============================
      // NIK sudah ada
      // ===============================

      await conn.query(
        `
        UPDATE kependudukan
        SET
          nama = ?,
          ttl = ?,
          agama = ?,
          jenis_kelamin = ?,
          pekerjaan = ?,
          alamat = ?,
          dusun = ?,
          rt = ?,
          rw = ?,
          file_ktp = ?
        WHERE nik = ?
        `,
        [
          nama,
          ttl,
          agama,
          jenis_kelamin,
          pekerjaan,
          alamat,
          dusun,
          rt,
          rw,
          newFileName,
          nik,
        ]
      );
    }

    // ===============================
    // Update pengajuan_surat
    // ===============================

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

    // ===============================
    // Tabel domisili
    // ===============================
    // Tidak ada lagi update file_ktp
    // karena KTP sekarang berada
    // di kependudukan.file_ktp

    // ===============================
    // Activity Log
    // ===============================

    await logActivity({
      pengajuanId: Number(id),
      status: "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // ===============================
    // Commit Transaction
    // ===============================

    await conn.commit();

    // ===============================
    // Hapus file KTP lama
    // setelah database berhasil
    // ===============================

    if (
      fileKtp &&
      fileKtp.size > 0 &&
      oldFile &&
      oldFile !== newFileName
    ) {
      oldFilePath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          oldFile
        );

      if (
        fs.existsSync(oldFilePath)
      ) {
        try {
          await unlink(
            oldFilePath
          );
        } catch (fileError) {
          console.error(
            "Gagal menghapus file KTP lama:",
            fileError
          );
        }
      }
    }

    // ===============================
    // Response
    // ===============================

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (err: any) {

    await conn.rollback();

    // ===============================
    // Hapus file baru jika database
    // gagal diproses
    // ===============================

    if (newFilePath) {
      try {
        if (
          fs.existsSync(newFilePath)
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

    console.error(
      "ERROR UPDATE DOMISILI:",
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