import db from "@/lib/db";
import { NextResponse } from "next/server";
import {
  writeFile,
  unlink,
  mkdir,
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
    const formData =
      await request.formData();

    // ===========================
    // DATA PEMOHON
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
        formData.get("status_perkawinan") ?? ""
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
        formData.get("kewarganegaraan") ?? ""
      ).trim();

    // ===========================
    // DATA KEGIATAN
    // ===========================

    const jenis_kegiatan =
      String(
        formData.get("jenis_kegiatan") ?? ""
      ).trim();

    const tanggal_kegiatan =
      String(
        formData.get("tanggal_kegiatan") ?? ""
      ).trim();

    const jam_kegiatan =
      String(
        formData.get("jam_kegiatan") ?? ""
      ).trim();

    const acara =
      String(
        formData.get("acara") ?? ""
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
    // VALIDASI DATA PEMOHON
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
            "Data pemohon wajib dilengkapi.",
        },
        { status: 400 }
      );
    }

    // ===========================
    // VALIDASI DATA KEGIATAN
    // ===========================

    if (
      !jenis_kegiatan ||
      !tanggal_kegiatan ||
      !jam_kegiatan ||
      !acara
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data kegiatan wajib dilengkapi.",
        },
        { status: 400 }
      );
    }

    // ===========================
    // FILE KTP
    // ===========================
    // KTP OPSIONAL UNTUK ADMIN
    // ===========================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    let fileName:
      string | null = null;

    // ===========================
    // CEK KTP LAMA
    // ===========================

    const [
      oldKtpRows,
    ]: any = await conn.query(
      `
      SELECT file_ktp
      FROM kependudukan
      WHERE nik = ?
      LIMIT 1
      `,
      [nik]
    );

    oldKtpFile =
      oldKtpRows[0]?.file_ktp ?? null;

    // ===========================
    // VALIDASI DAN UPLOAD KTP
    // JIKA FILE DIISI
    // ===========================

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
      // FOLDER UPLOAD
      // ===========================

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

      // ===========================
      // NAMA FILE
      // ===========================

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

      // ===========================
      // SIMPAN FILE
      // ===========================

      const bytes =
        await fileKtp.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      await writeFile(
        uploadPath,
        buffer
      );

      uploadedFilePath =
        uploadPath;
    }

    // ===========================
    // MULAI TRANSAKSI
    // ===========================

    await conn.beginTransaction();

    // ===========================
    // AMBIL JENIS SURAT
    // ===========================

    const jenis =
      await getJenisSurat(
        "SKIK"
      );

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

    // ===========================
    // SIMPAN / UPDATE KEPENDUDUKAN
    // ===========================

    const finalKtpFile =
      fileName ?? oldKtpFile;

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
        finalKtpFile,
      ]
    );

    // ===========================
    // GENERATE TRACKING
    // ===========================

    const sekarang =
      new Date();

    const tanggal =
      `${String(
        sekarang.getDate()
      ).padStart(2, "0")}${String(
        sekarang.getMonth() + 1
      ).padStart(2, "0")}${String(
        sekarang.getFullYear()
      ).slice(-2)}`;

    const [
      countRows,
    ]: any = await conn.query(
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

    const kode_tracking =
      `${kodeSurat}-${tanggal}-${urut}`;

    // ===========================
    // INSERT PENGAJUAN
    // ===========================

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
          nik,
          "draft",
          kode_tracking,
        ]
      );

    const pengajuan_id =
      result.insertId;

    // ===========================
    // INSERT IZIN KERAMAIAN
    // ===========================

    await conn.query(
      `
      INSERT INTO izin_keramaian
      (
        pengajuan_id,
        jenis_kegiatan,
        tanggal_kegiatan,
        jam_kegiatan,
        acara
      )
      VALUES
      (?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        jenis_kegiatan,
        tanggal_kegiatan,
        jam_kegiatan,
        acara,
      ]
    );

    // ===========================
    // GENERATE ISI SURAT
    // ===========================

    const tanggalSurat =
      sekarang.toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

    const replaceFields:
      Record<string, string> = {
      nomor_surat: "",

      tanggal:
        tanggalSurat,

      nama,
      ttl,
      nik,
      agama,
      jenis_kelamin,
      status_perkawinan,
      pekerjaan,
      alamat,
      dusun,
      rt,
      rw,
      kewarganegaraan,

      jenis_kegiatan,
      tanggal_kegiatan,
      jam_kegiatan,
      acara,
    };

    const isiSurat =
      generateSurat(
        templateSurat,
        replaceFields,
        {
          preserveSystemFields: true,
        }
      );

    // ===========================
    // SIMPAN ISI SURAT
    // ===========================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET isi_surat = ?
      WHERE id = ?
      `,
      [
        isiSurat,
        pengajuan_id,
      ]
    );

    // ===========================
    // ACTIVITY LOG
    // ===========================

    await logActivity({
      pengajuanId:
        pengajuan_id,

      status:
        "draft",

      aktivitas:
        "Surat dibuat oleh Admin.",

      conn,
    });

    // ===========================
    // COMMIT
    // ===========================

    await conn.commit();

    // ===========================
    // HAPUS KTP LAMA JIKA DIGANTI
    // ===========================

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

    uploadedFilePath = null;

    // ===========================
    // RESPONSE
    // ===========================

    return NextResponse.json({
      success: true,
      pengajuan_id,
      kode_tracking,
      message:
        "Surat berhasil dibuat.",
    });

  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      // Abaikan jika transaksi belum dimulai
    }

    // ===========================
    // HAPUS FILE JIKA GAGAL
    // ===========================

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
      "ADMIN BUAT SURAT SKIK ERROR:",
      err
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