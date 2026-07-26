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

    const umur =
      String(
        formData.get("umur")
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

    const hari =
      String(
        formData.get("hari")
      );

    const tanggal =
      String(
        formData.get("tanggal")
      );

    const jam =
      String(
        formData.get("jam")
      );

    const bertempat_di =
      String(
        formData.get(
          "bertempat_di"
        )
      );

    const penyebab =
      String(
        formData.get(
          "penyebab"
        )
      );

    const pelapor =
      String(
        formData.get("pelapor")
      );

    const hubungan_pelapor =
      String(
        formData.get(
          "hubungan_pelapor"
        )
      );

    const fileKtp =
      formData.get("file_ktp") as File | null;

    const [rows]: any = await db.query(
      `
      SELECT file_ktp
      FROM kematian
      WHERE pengajuan_id=?
      LIMIT 1
      `,
      [id]
    );

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName = oldFile;

    if (fileKtp && fileKtp.size > 0) {

      const bytes =
        await fileKtp.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const ext =
        fileKtp.name.split(".").pop();

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
      // Hapus File Lama
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

        if (fs.existsSync(oldPath)) {

          await unlink(oldPath);

        }

      }

    }

    // ==========================
    // Update Tabel Kematian
    // ==========================

    await db.query(
      `
      UPDATE kematian
      SET
        nama=?,
        nik=?,
        agama=?,
        jenis_kelamin=?,
        umur=?,
        pekerjaan=?,
        alamat=?,
        hari=?,
        tanggal=?,
        jam=?,
        bertempat_di=?,
        penyebab=?,
        pelapor=?,
        hubungan_pelapor=?,
        file_ktp=?
      WHERE pengajuan_id=?
      `,
      [
        nama,
        nik,
        agama,
        jenis_kelamin,
        umur,
        pekerjaan,
        alamat,
        hari,
        tanggal,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor,
        newFileName,
        id,
      ]
    );

    // ==========================
    // Reset Status Pengajuan
    // ==========================

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