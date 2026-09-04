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
  const conn = await db.getConnection();

  let newUploadedFile: string | null = null;

  try {
    await conn.beginTransaction();

    const { id } = await context.params;

    const formData =
      await request.formData();

    // ===========================
    // DATA PEMILIK
    // ===========================

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

    // ===========================
    // DATA TANAH
    // ===========================

    const nomor_sertifikat =
      String(
        formData.get(
          "nomor_sertifikat"
        ) ?? ""
      ).trim();

    const luas_tanah =
      String(
        formData.get(
          "luas_tanah"
        ) ?? ""
      ).trim();

    const tahun_perolehan =
      String(
        formData.get(
          "tahun_perolehan"
        ) ?? ""
      ).trim();

    const asal_perolehan =
      String(
        formData.get(
          "asal_perolehan"
        ) ?? ""
      ).trim();

    const letak_tanah =
      String(
        formData.get(
          "letak_tanah"
        ) ?? ""
      ).trim();

    const harga_taksiran =
      String(
        formData.get(
          "harga_taksiran"
        ) ?? ""
      ).trim();

    // ===========================
    // VALIDASI NIK
    // ===========================

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

    // ===========================
    // VALIDASI DATA PEMILIK
    // ===========================

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
            "Data pemilik wajib dilengkapi.",
        },
        { status: 400 }
      );
    }

    // ===========================
    // VALIDASI DATA TANAH
    // ===========================

    if (
      !nomor_sertifikat ||
      !luas_tanah ||
      !tahun_perolehan ||
      !asal_perolehan ||
      !letak_tanah ||
      !harga_taksiran
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data tanah wajib dilengkapi.",
        },
        { status: 400 }
      );
    }

    // ===========================
    // CEK PENGAJUAN
    // ===========================

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

    // ===========================
    // AMBIL FILE LAMA
    // ===========================

    const [rows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM tafsiran_harga_tanah
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
            "Detail surat tafsiran harga tanah tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName =
      oldFile;

    // ===========================
    // FILE KTP BARU
    // ===========================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      // ===========================
      // VALIDASI TIPE
      // ===========================

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

      // ===========================
      // VALIDASI UKURAN
      // ===========================

      const maxSize =
        5 * 1024 * 1024;

      if (
        fileKtp.size > maxSize
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

      // ===========================
      // UPLOAD
      // ===========================

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

    // ===========================
    // UPDATE KEPENDUDUKAN
    // ===========================

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
        nama =
          VALUES(nama),
        ttl =
          VALUES(ttl),
        agama =
          VALUES(agama),
        jenis_kelamin =
          VALUES(jenis_kelamin),
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

    // ===========================
    // UPDATE PENGAJUAN
    // ===========================

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

    // ===========================
    // UPDATE DETAIL TANAH
    // ===========================

    await conn.query(
      `
      UPDATE tafsiran_harga_tanah
      SET
        nomor_sertifikat = ?,
        luas_tanah = ?,
        tahun_perolehan = ?,
        asal_perolehan = ?,
        letak_tanah = ?,
        harga_taksiran = ?,
        file_ktp = ?
      WHERE pengajuan_id = ?
      `,
      [
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
    // HAPUS FILE KTP LAMA
    // ===========================

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

    // ===========================
    // ACTIVITY LOG
    // ===========================

    await logActivity({
      pengajuanId:
        Number(id),
      status:
        "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // ===========================
    // COMMIT
    // ===========================

    await conn.commit();

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
      "UPDATE STHT ERROR:",
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