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

  try {

    await conn.beginTransaction();

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

    const dusun =
      String(
        formData.get(
          "dusun"
        )
      );

    const rt =
      String(
        formData.get("rt")
      );

    const rw =
      String(
        formData.get("rw")
      );

    const keperluan =
      String(
        formData.get(
          "keperluan"
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
        FROM jalan
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

    // ==========================
    // Update tabel jalan
    // ==========================

    await conn.query(
      `
      UPDATE jalan
      SET
        nama=?,
        ttl=?,
        nik=?,
        agama=?,
        jenis_kelamin=?,
        status_perkawinan=?,
        pekerjaan=?,
        alamat=?,
        dusun=?,
        rt=?,
        rw=?,
        keperluan=?,
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
        dusun,
        rt,
        rw,
        keperluan,
        newFileName,
        id,
      ]
    );

      // ==========================
    // Reset Status Pengajuan
    // ==========================

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

    // ==========================
    // Simpan Activity Log
    // ==========================

    await logActivity({
      pengajuanId: Number(id),
      status: "pending",
      aktivitas: "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // ==========================
    // Commit Transaction
    // ==========================

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