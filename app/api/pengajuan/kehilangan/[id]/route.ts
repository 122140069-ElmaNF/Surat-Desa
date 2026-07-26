import { NextResponse } from "next/server";
import db from "@/lib/db";

import { writeFile, unlink } from "fs/promises";
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
  try {

    const { id } =
      await context.params;

    const formData =
      await request.formData();

    const nama =
      String(formData.get("nama"));

    const ttl =
      String(formData.get("ttl"));

    const nik =
      String(formData.get("nik"));

    const agama =
      String(formData.get("agama"));

    const status_perkawinan =
      String(
        formData.get(
          "status_perkawinan"
        )
      );

    const jenis_kelamin =
      String(
        formData.get(
          "jenis_kelamin"
        )
      );

    const kewarganegaraan =
      String(
        formData.get(
          "kewarganegaraan"
        )
      );

    const pekerjaan =
      String(
        formData.get(
          "pekerjaan"
        )
      );

    const alamat =
      String(
        formData.get(
          "alamat"
        )
      );

    const barang_hilang =
      String(
        formData.get(
          "barang_hilang"
        )
      );

    const fileKtp =
      formData.get("file_ktp") as File | null;

    const [rows]: any =
      await db.query(
        `
        SELECT file_ktp
        FROM kehilangan
        WHERE pengajuan_id=?
        LIMIT 1
        `,
        [id]
      );

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName = oldFile;

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
          await unlink(oldPath);
        }

      }

    }

    // ===========================
    // Update tabel kehilangan
    // ===========================

    await db.query(
      `
      UPDATE kehilangan
      SET
        nama=?,
        ttl=?,
        nik=?,
        agama=?,
        status_perkawinan=?,
        jenis_kelamin=?,
        kewarganegaraan=?,
        pekerjaan=?,
        alamat=?,
        barang_hilang=?,
        file_ktp=?
      WHERE pengajuan_id=?
      `,
      [
        nama,
        ttl,
        nik,
        agama,
        status_perkawinan,
        jenis_kelamin,
        kewarganegaraan,
        pekerjaan,
        alamat,
        barang_hilang,
        newFileName,
        id,
      ]
    );

    // ===========================
    // Reset status pengajuan
    // ===========================

    await db.query(
      `
      UPDATE pengajuan_surat
      SET
        status='pending',
        alasan_penolakan=NULL
      WHERE id=?
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (err: any) {

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

  }
}