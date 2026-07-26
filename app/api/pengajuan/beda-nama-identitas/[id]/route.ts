import { NextResponse } from "next/server";
import db from "@/lib/db";

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

  try {

    const { id } =
      await context.params;

    const formData =
      await request.formData();

    // ===========================
    // IDENTITAS LAMA
    // ===========================

    const nama_lama =
      String(formData.get("nama_lama"));

    const ttl_lama =
      String(formData.get("ttl_lama"));

    const nik_lama =
      String(formData.get("nik_lama"));

    const jenis_kelamin_lama =
      String(
        formData.get(
          "jenis_kelamin_lama"
        )
      );

    const pekerjaan_lama =
      String(
        formData.get(
          "pekerjaan_lama"
        )
      );

    const alamat_lama =
      String(
        formData.get(
          "alamat_lama"
        )
      );

    // ===========================
    // IDENTITAS BARU
    // ===========================

    const nama_baru =
      String(formData.get("nama_baru"));

    const ttl_baru =
      String(formData.get("ttl_baru"));

    const nik_baru =
      String(formData.get("nik_baru"));

    const jenis_kelamin_baru =
      String(
        formData.get(
          "jenis_kelamin_baru"
        )
      );

    const pekerjaan_baru =
      String(
        formData.get(
          "pekerjaan_baru"
        )
      );

    const alamat_baru =
      String(
        formData.get(
          "alamat_baru"
        )
      );

    // ===========================
    // KETERANGAN
    // ===========================

    const isi_keterangan =
      String(
        formData.get(
          "isi_keterangan"
        )
      );

    // ===========================
    // FILE
    // ===========================

    const fileKtp =
      formData.get("file_ktp") as
        | File
        | null;

    const [rows]: any =
      await db.query(
        `
        SELECT file_ktp
        FROM beda_nama_identitas
        WHERE pengajuan_id=?
        LIMIT 1
        `,
        [id]
      );

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName =
      oldFile;

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
      // HAPUS FILE LAMA
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
          fs.existsSync(
            oldPath
          )
        ) {

          await unlink(
            oldPath
          );

        }

      }

    }
        // ===========================
    // UPDATE BEDA NAMA IDENTITAS
    // ===========================

    await db.query(
      `
      UPDATE beda_nama_identitas
      SET
        nama_lama=?,
        ttl_lama=?,
        nik_lama=?,
        jenis_kelamin_lama=?,
        pekerjaan_lama=?,
        alamat_lama=?,

        nama_baru=?,
        ttl_baru=?,
        nik_baru=?,
        jenis_kelamin_baru=?,
        pekerjaan_baru=?,
        alamat_baru=?,

        isi_keterangan=?,

        file_ktp=?
      WHERE pengajuan_id=?
      `,
      [
        nama_lama,
        ttl_lama,
        nik_lama,
        jenis_kelamin_lama,
        pekerjaan_lama,
        alamat_lama,

        nama_baru,
        ttl_baru,
        nik_baru,
        jenis_kelamin_baru,
        pekerjaan_baru,
        alamat_baru,

        isi_keterangan,

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