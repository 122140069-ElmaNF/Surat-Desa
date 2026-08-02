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

    // ===========================
    // Data Pemilik
    // ===========================

    const nama =
      String(formData.get("nama"));

    const ttl =
      String(formData.get("ttl"));

    const nik =
      String(formData.get("nik"));

    const agama =
      String(formData.get("agama"));

    const jenis_kelamin =
      String(
        formData.get(
          "jenis_kelamin"
        )
      );

    const status_perkawinan =
      String(
        formData.get(
          "status_perkawinan"
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

    // ===========================
    // Data Tanah
    // ===========================

    const nomor_sertifikat =
      String(
        formData.get(
          "nomor_sertifikat"
        )
      );

    const luas_tanah =
      String(
        formData.get(
          "luas_tanah"
        )
      );

    const tahun_perolehan =
      String(
        formData.get(
          "tahun_perolehan"
        )
      );

    const asal_perolehan =
      String(
        formData.get(
          "asal_perolehan"
        )
      );

    const letak_tanah =
      String(
        formData.get(
          "letak_tanah"
        )
      );

    const harga_taksiran =
      String(
        formData.get(
          "harga_taksiran"
        )
      );

    // ===========================
    // File KTP
    // ===========================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    const [rows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM tafsiran_harga_tanah
        WHERE pengajuan_id=?
        LIMIT 1
        `,
        [id]
      );

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName =
      oldFile;

      // ===========================
    // Upload File Baru
    // ===========================

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

      // ===========================
      // Hapus file lama
      // ===========================

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
    // Update tabel tafsiran_harga_tanah
    // ===========================

    await conn.query(
      `
      UPDATE tafsiran_harga_tanah
      SET
        nama=?,
        ttl=?,
        nik=?,
        agama=?,
        jenis_kelamin=?,
        status_perkawinan=?,
        pekerjaan=?,
        alamat=?,
        nomor_sertifikat=?,
        luas_tanah=?,
        tahun_perolehan=?,
        asal_perolehan=?,
        letak_tanah=?,
        harga_taksiran=?,
        file_ktp=?
      WHERE pengajuan_id=?
      `,
      [
        nama,
        ttl,
        nik,
        agama,
        jenis_kelamin,
        status_perkawinan,
        pekerjaan,
        alamat,
        nomor_sertifikat,
        luas_tanah,
        tahun_perolehan,
        asal_perolehan,
        letak_tanah,
        harga_taksiran,
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