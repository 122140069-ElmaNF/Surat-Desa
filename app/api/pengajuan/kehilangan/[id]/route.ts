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

    const formData = await request.formData();

    // ===============================
    // Data Kependudukan
    // ===============================

    const nik = String(
      formData.get("nik") ?? ""
    ).trim();

    const nama = String(
      formData.get("nama") ?? ""
    ).trim();

    const ttl = String(
      formData.get("ttl") ?? ""
    ).trim();

    const agama = String(
      formData.get("agama") ?? ""
    ).trim();

    const jenis_kelamin = String(
      formData.get("jenis_kelamin") ?? ""
    ).trim();

    const status_perkawinan = String(
      formData.get("status_perkawinan") ?? ""
    ).trim();

    const pekerjaan = String(
      formData.get("pekerjaan") ?? ""
    ).trim();

    const alamat = String(
      formData.get("alamat") ?? ""
    ).trim();

    const dusun = String(
      formData.get("dusun") ?? ""
    ).trim();

    const rt = String(
      formData.get("rt") ?? ""
    ).trim();

    const rw = String(
      formData.get("rw") ?? ""
    ).trim();

    const kewarganegaraan = String(
      formData.get("kewarganegaraan") ?? ""
    ).trim();

    // ===============================
    // Data Khusus Kehilangan
    // ===============================

    const barang_hilang = String(
      formData.get("barang_hilang") ?? ""
    ).trim();

    const fileKtp =
      formData.get("file_ktp") as File | null;

    // ===============================
    // Validasi
    // ===============================

    if (!nik) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    if (!nama) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!barang_hilang) {
      return NextResponse.json(
        {
          success: false,
          message: "Barang yang hilang wajib diisi.",
        },
        { status: 400 }
      );
    }

    // ===============================
    // Ambil Data Pengajuan
    // ===============================

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

    if (pengajuanRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pengajuan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // ===============================
    // Ambil File Lama
    // ===============================

    const [rows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM kehilangan
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [id]
      );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data surat kehilangan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName = oldFile;

    // ===============================
    // Upload File Baru
    // ===============================

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
      ];

      if (!allowedTypes.includes(fileKtp.type)) {
        return NextResponse.json(
          {
            success: false,
            message: "File harus berupa JPG atau PNG.",
          },
          { status: 400 }
        );
      }

      const maxSize =
        5 * 1024 * 1024;

      if (fileKtp.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            message: "Ukuran file maksimal 5 MB.",
          },
          { status: 400 }
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
          ?.toLowerCase();

      newFileName =
        `${randomUUID()}.${ext}`;

      newUploadedFile =
        newFileName;

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
    }

    // ===============================
    // Update / Insert Kependudukan
    // ===============================

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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        ttl = VALUES(ttl),
        agama = VALUES(agama),
        jenis_kelamin = VALUES(jenis_kelamin),
        status_perkawinan = VALUES(status_perkawinan),
        pekerjaan = VALUES(pekerjaan),
        alamat = VALUES(alamat),
        dusun = VALUES(dusun),
        rt = VALUES(rt),
        rw = VALUES(rw),
        kewarganegaraan = VALUES(kewarganegaraan)
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

    // ===============================
    // Update NIK Pengajuan
    // ===============================

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

    // ===============================
    // Update Detail Kehilangan
    // ===============================

    await conn.query(
      `
      UPDATE kehilangan
      SET
        barang_hilang = ?,
        file_ktp = ?
      WHERE pengajuan_id = ?
      `,
      [
        barang_hilang,
        newFileName,
        id,
      ]
    );

    // ===============================
    // Hapus File Lama
    // ===============================

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

      if (fs.existsSync(oldPath)) {
        await unlink(oldPath);
      }
    }

    // ===============================
    // Activity Log
    // ===============================

    await logActivity({
      conn,
      pengajuanId: Number(id),
      status: "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
    });

    // ===============================
    // Commit
    // ===============================

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
      const newPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          newUploadedFile
        );

      try {
        if (fs.existsSync(newPath)) {
          await unlink(newPath);
        }
      } catch (fileError) {
        console.error(
          "Gagal menghapus file baru:",
          fileError
        );
      }
    }

    console.error(
      "PUT KEHILANGAN:",
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