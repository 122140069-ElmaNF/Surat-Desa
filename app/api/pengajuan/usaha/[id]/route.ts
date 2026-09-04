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

  let uploadedFilePath: string | null = null;

  try {
    await conn.beginTransaction();

    const { id } = await context.params;

    const formData =
      await request.formData();

    // =================================================
    // AMBIL DATA FORM
    // =================================================

    const nik =
      String(formData.get("nik") ?? "");

    const nama =
      String(formData.get("nama") ?? "");

    const ttl =
      String(formData.get("ttl") ?? "");

    const agama =
      String(formData.get("agama") ?? "");

    const jenis_kelamin =
      String(
        formData.get(
          "jenis_kelamin"
        ) ?? ""
      );

    const status_perkawinan =
      String(
        formData.get(
          "status_perkawinan"
        ) ?? ""
      );

    const pekerjaan =
      String(
        formData.get(
          "pekerjaan"
        ) ?? ""
      );

    const alamat =
      String(
        formData.get(
          "alamat"
        ) ?? ""
      );

    const dusun =
      String(
        formData.get(
          "dusun"
        ) ?? ""
      );

    const rt =
      String(
        formData.get(
          "rt"
        ) ?? ""
      );

    const rw =
      String(
        formData.get(
          "rw"
        ) ?? ""
      );

    const kewarganegaraan =
      String(
        formData.get(
          "kewarganegaraan"
        ) ?? ""
      );

    const nama_usaha =
      String(
        formData.get(
          "nama_usaha"
        ) ?? ""
      );

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // =================================================
    // VALIDASI NIK
    // =================================================

    if (
      !/^\d{16}$/.test(nik)
    ) {
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

    // =================================================
    // CEK PENGAJUAN
    // =================================================

    const [pengajuanRows]: any =
      await conn.query(
        `
        SELECT id, nik
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

    // =================================================
    // AMBIL FILE KTP LAMA
    // =================================================

    const [rows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM usaha
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [id]
      );

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName =
      oldFile;

    // =================================================
    // VALIDASI & UPLOAD FILE BARU
    // =================================================

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
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
              "File KTP harus berupa JPG, JPEG, atau PNG.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        fileKtp.size >
        5 * 1024 * 1024
      ) {
        await conn.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file KTP maksimal 5 MB.",
          },
          {
            status: 400,
          }
        );
      }

      const bytes =
        await fileKtp.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

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

      uploadedFilePath =
        uploadPath;
    }

    // =================================================
    // SIMPAN / UPDATE DATA KEPENDUDUKAN
    // =================================================

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
      // NIK BELUM ADA → INSERT
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
      // NIK SUDAH ADA → UPDATE
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

    // =================================================
    // UPDATE PENGAJUAN
    // =================================================

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

    // =================================================
    // UPDATE DETAIL SKU
    // =================================================

    await conn.query(
      `
      UPDATE usaha
      SET
        nama_usaha = ?,
        file_ktp = ?
      WHERE pengajuan_id = ?
      `,
      [
        nama_usaha,
        newFileName,
        id,
      ]
    );

    // =================================================
    // ACTIVITY LOG
    // =================================================

    await logActivity({
      pengajuanId:
        Number(id),
      status: "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // =================================================
    // COMMIT
    // =================================================

    await conn.commit();

    // =================================================
    // HAPUS FILE LAMA SETELAH COMMIT
    // =================================================

    if (
      fileKtp &&
      fileKtp.size > 0 &&
      oldFile &&
      oldFile !== newFileName
    ) {
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
        try {
          await unlink(
            oldPath
          );
        } catch {
          // Abaikan jika gagal menghapus file lama
        }
      }
    }

    uploadedFilePath = null;

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (err: any) {
    await conn.rollback();

    // =================================================
    // HAPUS FILE BARU JIKA TRANSAKSI GAGAL
    // =================================================

    if (uploadedFilePath) {
      try {
        await unlink(
          uploadedFilePath
        );
      } catch {
        // Abaikan jika file tidak ditemukan
      }
    }

    console.error(
      "ERROR PERBAIKAN SKU:",
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