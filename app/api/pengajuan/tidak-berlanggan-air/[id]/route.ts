import { NextResponse } from "next/server";
import db from "@/lib/db";

import {
  writeFile,
  unlink,
} from "fs/promises";

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { logActivity } from "@/lib/activity";

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

  try {

    await conn.beginTransaction();

    const { id } =
      await context.params;

    const formData =
      await request.formData();

    // ==========================
    // Data Orang Tua / Wali
    // ==========================

    const nama_pertama =
      String(
        formData.get(
          "nama_pertama"
        )
      );

    const ttl_pertama =
      String(
        formData.get(
          "ttl_pertama"
        )
      );

    const nik_pertama =
      String(
        formData.get(
          "nik_pertama"
        )
      );

    const status_perkawinan_pertama =
      String(
        formData.get(
          "status_perkawinan_pertama"
        )
      );

    const pekerjaan_pertama =
      String(
        formData.get(
          "pekerjaan_pertama"
        )
      );

    const alamat_pertama =
      String(
        formData.get(
          "alamat_pertama"
        )
      );

    // ==========================
    // Data Calon Mahasiswa
    // ==========================

    const nama_kedua =
      String(
        formData.get(
          "nama_kedua"
        )
      );

    const ttl_kedua =
      String(
        formData.get(
          "ttl_kedua"
        )
      );

    const nik_kedua =
      String(
        formData.get(
          "nik_kedua"
        )
      );

    const prodi_kedua =
      String(
        formData.get(
          "prodi_kedua"
        )
      );

    const alamat_kedua =
      String(
        formData.get(
          "alamat_kedua"
        )
      );

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // ==========================
    // Ambil file lama
    // ==========================

    const [rows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM tidak_berlangganan_air
        WHERE pengajuan_id=?
        LIMIT 1
        `,
        [id]
      );

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName =
      oldFile;

        // ==========================
    // Upload file baru
    // ==========================

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {

      const bytes =
        await fileKtp.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const ext =
        fileKtp.name
          .split(".")
          .pop();

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

      // ==========================
      // Hapus file lama
      // ==========================

      if (oldFile) {

        const oldPath =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldFile
          );

        if (
          fs.existsSync(oldPath)
        ) {

          await unlink(
            oldPath
          );

        }

      }

    }

    // ===========================
    // Update tabel tidak_berlangganan_air
    // ===========================

    await conn.query(
      `
      UPDATE tidak_berlangganan_air
      SET
        nama_pertama=?,
        ttl_pertama=?,
        nik_pertama=?,
        status_perkawinan_pertama=?,
        pekerjaan_pertama=?,
        alamat_pertama=?,

        nama_kedua=?,
        ttl_kedua=?,
        nik_kedua=?,
        prodi_kedua=?,
        alamat_kedua=?,

        file_ktp=?
      WHERE pengajuan_id=?
      `,
      [
        nama_pertama,
        ttl_pertama,
        nik_pertama,
        status_perkawinan_pertama,
        pekerjaan_pertama,
        alamat_pertama,

        nama_kedua,
        ttl_kedua,
        nik_kedua,
        prodi_kedua,
        alamat_kedua,

        newFileName,
        id,
      ]
    );

      // ===========================
    // Reset status pengajuan
    // ===========================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        status='pending',
        alasan_penolakan=NULL
      WHERE id=?
      `,
      [id]
    );

    // ===========================
    // Simpan Activity Log
    // ===========================

    await logActivity({
      pengajuanId: Number(id),
      status: "pending",
      aktivitas: "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // ===========================
    // Commit Transaction
    // ===========================

    await conn.commit();

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });
  
    } catch (err: any) {

    await conn.rollback();

    console.error(err);

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