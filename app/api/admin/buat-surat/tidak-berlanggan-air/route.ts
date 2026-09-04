import db from "@/lib/db";
import { NextResponse } from "next/server";
import {
  writeFile,
  mkdir,
  unlink,
} from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

import { generateSurat } from "@/lib/surat/generateSurat";
import getJenisSurat from "@/lib/surat/getJenisSurat";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedFilePath: string | null = null;
  let oldKtpFile: string | null = null;

  try {
    await conn.beginTransaction();

    const formData =
      await request.formData();

    // =====================================================
    // DATA ORANG TUA / WALI
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

    const jenisKelaminPertama =
      String(
        formData.get(
          "jenis_kelamin_pertama"
        ) ?? ""
      ).trim();

    const statusPerkawinanPertama =
      String(
        formData.get(
          "status_perkawinan_pertama"
        ) ?? ""
      ).trim();

    const pekerjaanPertama = String(
      formData.get(
        "pekerjaan_pertama"
      ) ?? ""
    ).trim();

    const alamatPertama = String(
      formData.get(
        "alamat_pertama"
      ) ?? ""
    ).trim();

    const dusunPertama = String(
      formData.get(
        "dusun_pertama"
      ) ?? ""
    ).trim();

    const rtPertama = String(
      formData.get("rt_pertama") ?? ""
    ).trim();

    const rwPertama = String(
      formData.get("rw_pertama") ?? ""
    ).trim();

    const kewarganegaraanPertama =
      String(
        formData.get(
          "kewarganegaraan_pertama"
        ) ?? ""
      ).trim();

    // =====================================================
    // DATA CALON MAHASISWA
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

    const prodiKedua = String(
      formData.get("prodi_kedua") ?? ""
    ).trim();

    const alamatKedua = String(
      formData.get("alamat_kedua") ?? ""
    ).trim();

    // =====================================================
    // VALIDASI NIK
    // =====================================================

    if (!/^\d{16}$/.test(nikPertama)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK orang tua/wali harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nikKedua)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK calon mahasiswa harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI ORANG TUA / WALI
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
            "Data orang tua/wali belum lengkap.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI CALON MAHASISWA
    // =====================================================

    if (
      !namaKedua ||
      !ttlKedua ||
      !prodiKedua ||
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
    // FILE KTP - OPSIONAL UNTUK ADMIN
    // =====================================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    let fileName:
      string | null = null;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    const maxSize =
      5 * 1024 * 1024;

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      // ===================================================
      // VALIDASI TIPE FILE
      // ===================================================

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

      // ===================================================
      // VALIDASI UKURAN FILE
      // ===================================================

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
      // UPLOAD KTP
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

      fileName =
        `${randomUUID()}.${ext}`;

      const uploadPath =
        path.join(
          uploadDir,
          fileName
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
    // AMBIL KTP LAMA ORANG TUA / WALI
    // =====================================================

    const [oldKtpRows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nikPertama]
      );

    oldKtpFile =
      oldKtpRows?.[0]?.file_ktp ||
      null;

    const finalKtpFile =
      fileName ?? oldKtpFile;

    // =====================================================
    // AMBIL JENIS SURAT
    // =====================================================

    const jenis =
      await getJenisSurat(
        "SKTBAPT"
      );

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

    // =====================================================
    // UPSERT KEPENDUDUKAN ORANG TUA / WALI
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
        kewarganegaraan,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        kewarganegaraan = VALUES(kewarganegaraan),
        file_ktp = VALUES(file_ktp)
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
        finalKtpFile,
      ]
    );

    // =====================================================
    // UPSERT KEPENDUDUKAN CALON MAHASISWA
    // =====================================================

    const [existingKeduaRows]: any =
      await conn.query(
        `
        SELECT nik
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nikKedua]
      );

    if (
      existingKeduaRows.length
    ) {
      await conn.query(
        `
        UPDATE kependudukan
        SET
          nama = ?,
          ttl = ?,
          alamat = ?
        WHERE nik = ?
        `,
        [
          namaKedua,
          ttlKedua,
          alamatKedua,
          nikKedua,
        ]
      );
    } else {
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
        `,
        [
          nikKedua,
          namaKedua,
          ttlKedua,
          alamatKedua,
        ]
      );
    }

    // =====================================================
    // GENERATE TRACKING
    // =====================================================

    const sekarang =
      new Date();

    const tanggal =
      `${String(
        sekarang.getDate()
      ).padStart(2, "0")}` +
      `${String(
        sekarang.getMonth() + 1
      ).padStart(2, "0")}` +
      `${String(
        sekarang.getFullYear()
      ).slice(-2)}`;

    const [countRows]: any =
      await conn.query(
        `
        SELECT COUNT(*) AS total
        FROM pengajuan_surat
        WHERE jenis_surat_id = ?
        `,
        [jenisSuratId]
      );

    const urut =
      String(
        Number(
          countRows[0].total
        ) + 1
      ).padStart(4, "0");

    const kodeTracking =
      `${kodeSurat}-${tanggal}-${urut}`;

    // =====================================================
    // INSERT PENGAJUAN
    // =====================================================

    const [result]: any =
      await conn.query(
        `
        INSERT INTO pengajuan_surat
        (
          jenis_surat_id,
          nik,
          status,
          kode_tracking
        )
        VALUES
        (?, ?, ?, ?)
        `,
        [
          jenisSuratId,
          nikPertama,
          "draft",
          kodeTracking,
        ]
      );

    const pengajuanId =
      result.insertId;

    // =====================================================
    // INSERT DETAIL
    // =====================================================

    await conn.query(
      `
      INSERT INTO tidak_berlangganan_air
      (
        pengajuan_id,
        nik_pertama,
        nik_kedua,
        prodi_kedua
      )
      VALUES
      (?, ?, ?, ?)
      `,
      [
        pengajuanId,
        nikPertama,
        nikKedua,
        prodiKedua,
      ]
    );

    // =====================================================
    // GENERATE ISI SURAT
    // =====================================================

    const replaceFields:
      Record<string, string> = {
      nomor_surat: "",

      tanggal:
        sekarang.toLocaleDateString(
          "id-ID",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        ),

      nama_pertama:
        namaPertama,

      ttl_pertama:
        ttlPertama,

      nik_pertama:
        nikPertama,

      status_perkawinan_pertama:
        statusPerkawinanPertama,

      pekerjaan_pertama:
        pekerjaanPertama,

      alamat_pertama:
        alamatPertama,

      nama_kedua:
        namaKedua,

      ttl_kedua:
        ttlKedua,

      nik_kedua:
        nikKedua,

      prodi_kedua:
        prodiKedua,

      alamat_kedua:
        alamatKedua,
    };

    const isiSurat =
      generateSurat(
        templateSurat,
        replaceFields,
        {
          preserveSystemFields:
            true,
        }
      );

    // =====================================================
    // SIMPAN ISI SURAT
    // =====================================================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET isi_surat = ?
      WHERE id = ?
      `,
      [
        isiSurat,
        pengajuanId,
      ]
    );

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    await logActivity({
      pengajuanId,
      status: "draft",
      aktivitas:
        "Surat dibuat oleh Admin.",
      conn,
    });

    // =====================================================
    // COMMIT
    // =====================================================

    await conn.commit();

    // =====================================================
    // HAPUS KTP LAMA
    // JIKA DIGANTI DENGAN KTP BARU
    // =====================================================

    if (
      fileName &&
      oldKtpFile &&
      oldKtpFile !== fileName
    ) {
      try {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldKtpFile
          )
        );
      } catch {
        // Abaikan jika file lama tidak ditemukan
      }
    }

    // File baru sudah berhasil disimpan
    uploadedFilePath = null;

    return NextResponse.json({
      success: true,
      pengajuan_id:
        pengajuanId,
      kode_tracking:
        kodeTracking,
      message:
        "Surat berhasil dibuat.",
    });

  } catch (error) {
    try {
      await conn.rollback();
    } catch {
      // Abaikan jika transaksi belum dimulai
    }

    // =====================================================
    // CLEANUP FILE
    // =====================================================

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
      "POST admin tidak berlangganan air error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
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