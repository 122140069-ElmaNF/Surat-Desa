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

  let newUploadedFile: string | null = null;

  try {
    await conn.beginTransaction();

    const { id } = await context.params;

    const formData =
      await request.formData();

    // ==========================
    // DATA PEMOHON
    // ==========================

    const nik =
      String(
        formData.get("nik") ?? ""
      ).trim();

    const nama =
      String(
        formData.get("nama") ?? ""
      ).trim();

    const ttl =
      String(
        formData.get("ttl") ?? ""
      ).trim();

    const agama =
      String(
        formData.get("agama") ?? ""
      ).trim();

    const jenis_kelamin =
      String(
        formData.get("jenis_kelamin") ?? ""
      ).trim();

    const status_perkawinan =
      String(
        formData.get(
          "status_perkawinan"
        ) ?? ""
      ).trim();

    const pekerjaan =
      String(
        formData.get("pekerjaan") ?? ""
      ).trim();

    const alamat =
      String(
        formData.get("alamat") ?? ""
      ).trim();

    const dusun =
      String(
        formData.get("dusun") ?? ""
      ).trim();

    const rt =
      String(
        formData.get("rt") ?? ""
      ).trim();

    const rw =
      String(
        formData.get("rw") ?? ""
      ).trim();

    const kewarganegaraan =
      String(
        formData.get(
          "kewarganegaraan"
        ) ?? ""
      ).trim();

    // ==========================
    // DATA LISTRIK
    // ==========================

    const idpel =
      String(
        formData.get("idpel") ?? ""
      ).trim();

    const jenis_meteran =
      String(
        formData.get(
          "jenis_meteran"
        ) ?? ""
      ).trim();

    const keperluan =
      String(
        formData.get(
          "keperluan"
        ) ?? ""
      ).trim();

    // ==========================
    // VALIDASI NIK
    // ==========================

    if (!nik) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    // ==========================
    // VALIDASI DATA PEMOHON
    // ==========================

    if (
      !nama ||
      !ttl ||
      !agama ||
      !jenis_kelamin ||
      !status_perkawinan ||
      !pekerjaan ||
      !alamat ||
      !dusun ||
      !rt ||
      !rw ||
      !kewarganegaraan
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data pemohon wajib dilengkapi.",
        },
        { status: 400 }
      );
    }

    // ==========================
    // VALIDASI DATA LISTRIK
    // ==========================

    if (
      !idpel ||
      !jenis_meteran ||
      !keperluan
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data listrik wajib dilengkapi.",
        },
        { status: 400 }
      );
    }

    // ==========================
    // AMBIL DATA PENGAJUAN
    // ==========================

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

    if (!pengajuanRows.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data pengajuan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // ==========================
    // AMBIL FILE KTP LAMA
    // ==========================

    const [rows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM listrik
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [id]
      );

    if (!rows.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Detail surat listrik tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName =
      oldFile;

    // ==========================
    // FILE KTP BARU
    // ==========================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      // ==========================
      // VALIDASI TIPE FILE
      // ==========================

      const allowedTypes = [
        "image/jpeg",
        "image/png",
      ];

      if (
        !allowedTypes.includes(
          fileKtp.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "File harus berupa JPG atau PNG.",
          },
          { status: 400 }
        );
      }

      // ==========================
      // VALIDASI UKURAN FILE
      // ==========================

      const maxSize =
        5 * 1024 * 1024;

      if (
        fileKtp.size >
        maxSize
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file maksimal 5 MB.",
          },
          { status: 400 }
        );
      }

      // ==========================
      // UPLOAD FILE
      // ==========================

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

    // ==========================
    // UPDATE KEPENDUDUKAN
    // ==========================

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
      ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        ttl = VALUES(ttl),
        agama = VALUES(agama),
        jenis_kelamin = VALUES(jenis_kelamin),
        status_perkawinan =
          VALUES(status_perkawinan),
        pekerjaan =
          VALUES(pekerjaan),
        alamat =
          VALUES(alamat),
        dusun =
          VALUES(dusun),
        rt =
          VALUES(rt),
        rw =
          VALUES(rw),
        kewarganegaraan =
          VALUES(kewarganegaraan)
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

    // ==========================
    // UPDATE PENGAJUAN
    // ==========================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        nik = ?,
        status = 'pending',
        alasan_penolakan = NULL
      WHERE id = ?
      `,
      [nik, id]
    );

    // ==========================
    // UPDATE DETAIL LISTRIK
    // ==========================

    await conn.query(
      `
      UPDATE listrik
      SET
        idpel = ?,
        jenis_meteran = ?,
        keperluan = ?,
        file_ktp = ?
      WHERE pengajuan_id = ?
      `,
      [
        idpel,
        jenis_meteran,
        keperluan,
        newFileName,
        id,
      ]
    );

    // ==========================
    // HAPUS FILE KTP LAMA
    // ==========================

    if (
      newUploadedFile &&
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
        await unlink(
          oldPath
        );
      }
    }

    // ==========================
    // ACTIVITY LOG
    // ==========================

    await logActivity({
      pengajuanId:
        Number(id),
      status:
        "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // ==========================
    // COMMIT
    // ==========================

    await conn.commit();

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (err: any) {
    await conn.rollback();

    // Hapus file baru jika
    // transaction gagal
    if (newUploadedFile) {
      try {
        if (
          fs.existsSync(
            newUploadedFile
          )
        ) {
          await unlink(
            newUploadedFile
          );
        }
      } catch {
        // Abaikan error cleanup
      }
    }

    console.error(
      "UPDATE SKL ERROR:",
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