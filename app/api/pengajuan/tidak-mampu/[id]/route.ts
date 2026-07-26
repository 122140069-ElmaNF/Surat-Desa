import db from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

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
      formData.get("nama") as string;

    const ttl =
      formData.get("ttl") as string;

    const nik =
      formData.get("nik") as string;

    const status_perkawinan =
      formData.get(
        "status_perkawinan"
      ) as string;

    const pekerjaan =
      formData.get(
        "pekerjaan"
      ) as string;

    const alamat =
      formData.get(
        "alamat"
      ) as string;

    const keperluan =
      formData.get(
        "keperluan"
      ) as string;

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // ===========================
    // AMBIL FILE LAMA
    // ===========================

    const [rows]: any =
      await db.query(
        `
        SELECT file_ktp
        FROM tidak_mampu
        WHERE pengajuan_id = ?
        `,
        [id]
      );

    if (
      rows.length === 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Data tidak ditemukan.",
        },
        {
          status: 404,
        }
      );

    }

    let newFileName =
      rows[0].file_ktp;

    // ===========================
    // JIKA ADA FILE BARU
    // ===========================

    if (fileKtp) {

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

      if (
        rows[0].file_ktp
      ) {

        try {

          await unlink(
            path.join(
              process.cwd(),
              "public",
              "uploads",
              "ktp",
              rows[0].file_ktp
            )
          );

        } catch {}

      }

    }

        // ===========================
    // UPDATE TIDAK MAMPU
    // ===========================

    await db.query(
      `
      UPDATE tidak_mampu
      SET
        nama=?,
        ttl=?,
        nik=?,
        status_perkawinan=?,
        pekerjaan=?,
        alamat=?,
        keperluan=?,
        file_ktp=?
      WHERE pengajuan_id=?
      `,
      [
        nama,
        ttl,
        nik,
        status_perkawinan,
        pekerjaan,
        alamat,
        keperluan,
        newFileName,
        id,
      ]
    );

    // ===========================
    // RESET STATUS PENGAJUAN
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