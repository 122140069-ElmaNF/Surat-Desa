import db from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
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
  const conn = await db.getConnection();

  let newUploadedFile: string | null = null;

  try {
    await conn.beginTransaction();

    const { id } = await context.params;

    const formData = await request.formData();

    const nik =
      formData.get("nik") as string;

    const nama =
      formData.get("nama") as string;

    const ttl =
      formData.get("ttl") as string;

    const agama =
      formData.get("agama") as string;

    const jenis_kelamin =
      formData.get("jenis_kelamin") as string;

    const status_perkawinan =
      formData.get(
        "status_perkawinan"
      ) as string;

    const pekerjaan =
      formData.get("pekerjaan") as string;

    const alamat =
      formData.get("alamat") as string;

    const dusun =
      formData.get("dusun") as string;

    const rt =
      formData.get("rt") as string;

    const rw =
      formData.get("rw") as string;

    const kewarganegaraan =
      formData.get(
        "kewarganegaraan"
      ) as string;

    const keperluan =
      formData.get(
        "keperluan"
      ) as string;

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // =========================================
    // VALIDASI NIK
    // =========================================

    if (
      !nik ||
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

    // =========================================
    // CEK DATA PENGAJUAN
    // =========================================

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

    // =========================================
    // AMBIL FILE KTP LAMA
    // =========================================

    const [rows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM tidak_mampu
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [id]
      );

    if (
      rows.length === 0
    ) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Data SKTM tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const oldFileName =
      rows[0].file_ktp;

    let newFileName =
      oldFileName;

    // =========================================
    // CEK / UPDATE KEPENDUDUKAN
    // =========================================

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
      // Jika NIK belum ada,
      // buat data penduduk baru

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
      // Jika NIK sudah ada,
      // update data penduduk karena
      // ini merupakan proses perbaikan

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

    // =========================================
    // UPLOAD KTP BARU JIKA ADA
    // =========================================

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

      newUploadedFile =
        uploadPath;
    }

    // =========================================
    // UPDATE PENGAJUAN
    // =========================================

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

    // =========================================
    // UPDATE DETAIL SKTM
    // =========================================

    await conn.query(
      `
      UPDATE tidak_mampu
      SET
        keperluan = ?,
        file_ktp = ?
      WHERE pengajuan_id = ?
      `,
      [
        keperluan,
        newFileName,
        id,
      ]
    );

    // =========================================
    // ACTIVITY LOG
    // =========================================

    await logActivity({
      pengajuanId: Number(id),
      status: "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // =========================================
    // COMMIT
    // =========================================

    await conn.commit();

    // =========================================
    // HAPUS FILE LAMA SETELAH COMMIT
    // =========================================

    if (
      fileKtp &&
      fileKtp.size > 0 &&
      oldFileName &&
      oldFileName !== newFileName
    ) {
      try {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldFileName
          )
        );
      } catch {
        // Abaikan jika file lama tidak ditemukan
      }
    }

    newUploadedFile = null;

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (err: any) {
    await conn.rollback();

    // Hapus file baru jika transaksi gagal
    if (newUploadedFile) {
      try {
        await unlink(
          newUploadedFile
        );
      } catch {
        // Abaikan jika file tidak ditemukan
      }
    }

    console.error(
      "ERROR UPDATE SKTM:",
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