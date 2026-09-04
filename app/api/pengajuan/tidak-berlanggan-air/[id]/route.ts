import { NextResponse } from "next/server";
import db from "@/lib/db";

import {
  writeFile,
  unlink,
  mkdir,
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

// =====================================================
// PUT - UPDATE / PERBAIKI PENGAJUAN
// =====================================================

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const conn = await db.getConnection();

  let uploadedFilePath: string | null = null;

  try {
    await conn.beginTransaction();

    const { id } = await context.params;

    const formData = await request.formData();

    // =====================================================
    // DATA ORANG PERTAMA / ORANG TUA / WALI
    // =====================================================

    const nikPertama = String(
      formData.get("nik_pertama") ?? ""
    ).trim();

    const namaPertama = String(
      formData.get("nama_pertama") ?? ""
    ).trim();

    const ttlPertama = String(
      formData.get("ttl_pertama") ?? ""
    ).trim();

    const agamaPertama = String(
      formData.get("agama_pertama") ?? ""
    ).trim();

    const jenisKelaminPertama = String(
      formData.get("jenis_kelamin_pertama") ?? ""
    ).trim();

    const statusPerkawinanPertama = String(
      formData.get("status_perkawinan_pertama") ?? ""
    ).trim();

    const pekerjaanPertama = String(
      formData.get("pekerjaan_pertama") ?? ""
    ).trim();

    const alamatPertama = String(
      formData.get("alamat_pertama") ?? ""
    ).trim();

    const dusunPertama = String(
      formData.get("dusun_pertama") ?? ""
    ).trim();

    const rtPertama = String(
      formData.get("rt_pertama") ?? ""
    ).trim();

    const rwPertama = String(
      formData.get("rw_pertama") ?? ""
    ).trim();

    const kewarganegaraanPertama = String(
      formData.get("kewarganegaraan_pertama") ?? ""
    ).trim();

    // =====================================================
    // DATA ORANG KEDUA / CALON MAHASISWA
    // =====================================================
    // HANYA:
    // NIK, Nama, TTL, Alamat
    // =====================================================

    const nikKedua = String(
      formData.get("nik_kedua") ?? ""
    ).trim();

    const namaKedua = String(
      formData.get("nama_kedua") ?? ""
    ).trim();

    const ttlKedua = String(
      formData.get("ttl_kedua") ?? ""
    ).trim();

    const alamatKedua = String(
      formData.get("alamat_kedua") ?? ""
    ).trim();

    // =====================================================
    // DATA KHUSUS SURAT
    // =====================================================

    const prodiKedua = String(
      formData.get("prodi_kedua") ?? ""
    ).trim();

    // =====================================================
    // VALIDASI NIK
    // =====================================================

    if (!/^\d{16}$/.test(nikPertama)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK orang pertama harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nikKedua)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK orang kedua harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI ORANG PERTAMA
    // =====================================================

    if (
      !namaPertama ||
      !ttlPertama ||
      !agamaPertama ||
      !jenisKelaminPertama ||
      !statusPerkawinanPertama ||
      !pekerjaanPertama ||
      !alamatPertama ||
      !dusunPertama ||
      !rtPertama ||
      !rwPertama ||
      !kewarganegaraanPertama
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data orang pertama belum lengkap.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI ORANG KEDUA
    // =====================================================

    if (
      !namaKedua ||
      !ttlKedua ||
      !alamatKedua
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data calon mahasiswa belum lengkap.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI PROGRAM STUDI
    // =====================================================

    if (!prodiKedua) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Program studi calon mahasiswa wajib diisi.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // AMBIL DATA DETAIL LAMA
    // =====================================================

    const [rows]: any = await conn.query(
      `
      SELECT
        file_ktp
      FROM tidak_berlangganan_air
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
            "Data pengajuan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const oldFile =
      rows[0]?.file_ktp ?? null;

    let newFileName = oldFile;

    // =====================================================
    // FILE KTP BARU - OPSIONAL SAAT EDIT
    // =====================================================

    const fileKtp =
      formData.get("file_ktp") as File | null;

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
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

      const maxSize =
        5 * 1024 * 1024;

      if (fileKtp.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file maksimal 5 MB.",
          },
          { status: 400 }
        );
      }

      // ===================================================
      // UPLOAD FILE BARU
      // ===================================================

      const uploadDir =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp"
        );

      await mkdir(
        uploadDir,
        {
          recursive: true,
        }
      );

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      newFileName =
        `${randomUUID()}.${ext}`;

      const uploadPath =
        path.join(
          uploadDir,
          newFileName
        );

      await writeFile(
        uploadPath,
        Buffer.from(
          await fileKtp.arrayBuffer()
        )
      );

      uploadedFilePath =
        uploadPath;
    }

    // =====================================================
    // UPSERT KEPENDUDUKAN ORANG PERTAMA
    // =====================================================

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
        status_perkawinan = VALUES(status_perkawinan),
        pekerjaan = VALUES(pekerjaan),
        alamat = VALUES(alamat),
        dusun = VALUES(dusun),
        rt = VALUES(rt),
        rw = VALUES(rw),
        kewarganegaraan = VALUES(kewarganegaraan)
      `,
      [
        nikPertama,
        namaPertama,
        ttlPertama,
        agamaPertama,
        jenisKelaminPertama,
        statusPerkawinanPertama,
        pekerjaanPertama,
        alamatPertama,
        dusunPertama,
        rtPertama,
        rwPertama,
        kewarganegaraanPertama,
      ]
    );

    // =====================================================
    // UPSERT KEPENDUDUKAN ORANG KEDUA / CALON MAHASISWA
    // =====================================================
    // Hanya memperbarui data yang memang digunakan
    // oleh form surat ini.
    //
    // Field lain seperti:
    // agama, jenis_kelamin, status_perkawinan,
    // pekerjaan, dusun, rt, rw, kewarganegaraan
    // TIDAK disentuh.
    // =====================================================

    await conn.query(
      `
      INSERT INTO kependudukan
      (
        nik,
        nama,
        ttl,
        alamat
      )
      VALUES
      (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        ttl = VALUES(ttl),
        alamat = VALUES(alamat)
      `,
      [
        nikKedua,
        namaKedua,
        ttlKedua,
        alamatKedua,
      ]
    );

    // =====================================================
    // UPDATE PENGAJUAN SURAT
    // =====================================================

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
        nikPertama,
        id,
      ]
    );

    // =====================================================
    // UPDATE DETAIL SURAT
    // =====================================================

    await conn.query(
      `
      UPDATE tidak_berlangganan_air
      SET
        nik_pertama = ?,
        nik_kedua = ?,
        prodi_kedua = ?,
        file_ktp = ?
      WHERE pengajuan_id = ?
      `,
      [
        nikPertama,
        nikKedua,
        prodiKedua,
        newFileName,
        id,
      ]
    );

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    await logActivity({
      pengajuanId: Number(id),
      status: "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // =====================================================
    // COMMIT
    // =====================================================

    await conn.commit();

    // =====================================================
    // HAPUS FILE KTP LAMA
    // SETELAH TRANSAKSI BERHASIL
    // =====================================================

    if (
      fileKtp &&
      fileKtp.size > 0 &&
      oldFile &&
      oldFile !== newFileName
    ) {
      try {
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
      } catch (fileError) {
        console.error(
          "Gagal menghapus file KTP lama:",
          fileError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (error: any) {
    try {
      await conn.rollback();
    } catch {
      // Abaikan jika transaksi belum berjalan
    }

    // Hapus file baru jika proses gagal
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
      "PUT tidak berlangganan air error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ??
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