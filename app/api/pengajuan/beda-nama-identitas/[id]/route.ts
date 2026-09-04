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

  let newUploadedPath:
    string | null = null;

  let oldFile:
    string | null = null;

  let newFileName:
    string | null = null;

  try {
    await conn.beginTransaction();

    const { id } =
      await context.params;

    const pengajuanId =
      Number(id);

    if (
      !Number.isInteger(
        pengajuanId
      )
    ) {
      throw new Error(
        "ID pengajuan tidak valid."
      );
    }

    const formData =
      await request.formData();

    // ==================================
    // DATA PEMOHON
    // ==================================

    const nama =
      String(
        formData.get("nama") ?? ""
      ).trim();

    const ttl =
      String(
        formData.get("ttl") ?? ""
      ).trim();

    const nik =
      String(
        formData.get("nik") ?? ""
      ).trim();

    const agama =
      String(
        formData.get("agama") ?? ""
      ).trim();

    const jenis_kelamin =
      String(
        formData.get(
          "jenis_kelamin"
        ) ?? ""
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

    // ==================================
    // KETERANGAN
    // ==================================

    const isi_keterangan =
      String(
        formData.get(
          "isi_keterangan"
        ) ?? ""
      ).trim();

    // ==================================
    // VALIDASI NIK
    // ==================================

    if (
      !/^\d{16}$/.test(nik)
    ) {
      throw new Error(
        "NIK harus terdiri dari 16 digit."
      );
    }

    // ==================================
    // VALIDASI DATA PEMOHON
    // ==================================

    if (!nama) {
      throw new Error(
        "Nama wajib diisi."
      );
    }

    if (!ttl) {
      throw new Error(
        "TTL wajib diisi."
      );
    }

    if (!agama) {
      throw new Error(
        "Agama wajib diisi."
      );
    }

    if (!jenis_kelamin) {
      throw new Error(
        "Jenis kelamin wajib diisi."
      );
    }

    if (!status_perkawinan) {
      throw new Error(
        "Status perkawinan wajib diisi."
      );
    }

    if (!pekerjaan) {
      throw new Error(
        "Pekerjaan wajib diisi."
      );
    }

    if (!alamat) {
      throw new Error(
        "Alamat wajib diisi."
      );
    }

    if (!dusun) {
      throw new Error(
        "Dusun wajib diisi."
      );
    }

    if (!rt) {
      throw new Error(
        "RT wajib diisi."
      );
    }

    if (!rw) {
      throw new Error(
        "RW wajib diisi."
      );
    }

    if (!kewarganegaraan) {
      throw new Error(
        "Kewarganegaraan wajib diisi."
      );
    }

    // ==================================
    // VALIDASI KETERANGAN
    // ==================================

    if (!isi_keterangan) {
      throw new Error(
        "Keterangan wajib diisi."
      );
    }

    // ==================================
    // CEK DATA PENGAJUAN
    // ==================================

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
        [pengajuanId]
      );

    if (
      pengajuanRows.length === 0
    ) {
      throw new Error(
        "Data pengajuan tidak ditemukan."
      );
    }

    // ==================================
    // AMBIL FILE LAMA
    // ==================================

    const [detailRows]: any =
      await conn.query(
        `
        SELECT
          file_ktp
        FROM beda_nama_identitas
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [pengajuanId]
      );

    if (
      detailRows.length === 0
    ) {
      throw new Error(
        "Data beda nama identitas tidak ditemukan."
      );
    }

    oldFile =
      detailRows[0]?.file_ktp ??
      null;

    newFileName =
      oldFile;

    // ==================================
    // FILE KTP BARU
    // ==================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {

      // -------------------------------
      // VALIDASI TIPE
      // -------------------------------

      const allowedTypes = [
        "image/jpeg",
        "image/png",
      ];

      if (
        !allowedTypes.includes(
          fileKtp.type
        )
      ) {
        throw new Error(
          "File KTP harus berupa JPG atau PNG."
        );
      }

      // -------------------------------
      // VALIDASI UKURAN
      // -------------------------------

      const maxSize =
        5 * 1024 * 1024;

      if (
        fileKtp.size > maxSize
      ) {
        throw new Error(
          "Ukuran file KTP maksimal 5 MB."
        );
      }

      // -------------------------------
      // UPLOAD
      // -------------------------------

      const bytes =
        await fileKtp.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

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

      newUploadedPath =
        uploadPath;
    }

    // ==================================
    // SIMPAN / UPDATE KEPENDUDUKAN
    // ==================================

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

    // ==================================
    // UPDATE PENGAJUAN
    // ==================================

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
        pengajuanId,
      ]
    );

    // ==================================
    // UPDATE DETAIL SKBNI
    // ==================================

    await conn.query(
      `
      UPDATE beda_nama_identitas
      SET
        isi_keterangan = ?,
        file_ktp = ?
      WHERE pengajuan_id = ?
      `,
      [
        isi_keterangan,
        newFileName,
        pengajuanId,
      ]
    );

    // ==================================
    // ACTIVITY LOG
    // ==================================

    await logActivity({
      pengajuanId:
        pengajuanId,

      status:
        "pending",

      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",

      conn,
    });

    // ==================================
    // COMMIT
    // ==================================

    await conn.commit();

    // ==================================
    // HAPUS FILE LAMA
    // SETELAH COMMIT BERHASIL
    // ==================================

    if (
      fileKtp &&
      fileKtp.size > 0 &&
      oldFile &&
      newFileName &&
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

      try {
        if (
          fs.existsSync(
            oldPath
          )
        ) {
          await unlink(
            oldPath
          );
        }
      } catch (fileError) {
        console.error(
          "Gagal menghapus file KTP lama:",
          fileError
        );
      }
    }

    // File baru sudah berhasil
    // disimpan dan transaksi berhasil.
    newUploadedPath = null;

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (error: any) {

    await conn.rollback();

    // ==================================
    // CLEANUP FILE BARU
    // JIKA TRANSAKSI GAGAL
    // ==================================

    if (
      newUploadedPath
    ) {
      try {
        await unlink(
          newUploadedPath
        );
      } catch {
        // abaikan error cleanup
      }
    }

    console.error(
      "PUT BEDA NAMA IDENTITAS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ??
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