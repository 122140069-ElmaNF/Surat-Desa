import db from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { NextResponse } from "next/server";

import { generateSurat } from "@/lib/surat/generateSurat";
import getJenisSurat from "@/lib/surat/getJenisSurat";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedFilePath: string | null = null;

  try {
    await conn.beginTransaction();

    const formData =
      await request.formData();

    // ===============================
    // DATA PEMOHON
    // ===============================

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

    // ===============================
    // KETERANGAN
    // ===============================

    const isi_keterangan =
      String(
        formData.get("isi_keterangan") ?? ""
      ).trim();

    // ===============================
    // VALIDASI NIK
    // ===============================

    if (!/^\d{16}$/.test(nik)) {
      throw new Error(
        "NIK harus terdiri dari 16 digit."
      );
    }

    // ===============================
    // VALIDASI DATA PEMOHON
    // ===============================

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

    // ===============================
    // VALIDASI KETERANGAN
    // ===============================

    if (!isi_keterangan) {
      throw new Error(
        "Keterangan wajib diisi."
      );
    }

    // ===============================
    // FILE KTP - OPSIONAL UNTUK ADMIN
    // ===============================

    const fileKtp =
      formData.get("file_ktp") as File | null;

    let fileName:
      string | null = null;

    // ===============================
    // VALIDASI FILE JIKA DIUPLOAD
    // ===============================

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
        throw new Error(
          "File KTP harus berupa JPG atau PNG."
        );
      }

      const maxSize =
        5 * 1024 * 1024;

      if (
        fileKtp.size > maxSize
      ) {
        throw new Error(
          "Ukuran file KTP maksimal 5 MB."
        );
      }

      // ===============================
      // UPLOAD FILE KTP
      // ===============================

      const bytes =
        await fileKtp.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      fileName =
        `${randomUUID()}.${ext}`;

      const uploadDir =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp"
        );

      // Pastikan folder upload tersedia
      const { mkdir } =
        await import("fs/promises");

      await mkdir(
        uploadDir,
        {
          recursive: true,
        }
      );

      const uploadPath =
        path.join(
          uploadDir,
          fileName
        );

      await writeFile(
        uploadPath,
        buffer
      );

      uploadedFilePath =
        uploadPath;
    }

    // ===============================
    // JENIS SURAT
    // ===============================

    const jenis =
      await getJenisSurat(
        "SKBNI"
      );

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

    // ===============================
    // SIMPAN / UPDATE KEPENDUDUKAN
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
    // GENERATE TRACKING
    // ===============================

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

    const kode_tracking =
      `${kodeSurat}-${tanggal}-${urut}`;

    // ===============================
    // INSERT PENGAJUAN
    // ===============================

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

    // ===============================
    // INSERT DETAIL SKBNI
    // ===============================

    await conn.query(
      `
      INSERT INTO beda_nama_identitas
      (
        pengajuan_id,
        isi_keterangan,
        file_ktp
      )
      VALUES
      (?, ?, ?)
      `,
      [
        pengajuan_id,
        isi_keterangan,
        fileName,
      ]
    );

    // ===============================
    // GENERATE ISI SURAT
    // ===============================

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

        isi_keterangan,
      };

    const isiSurat =
      generateSurat(
        templateSurat,
        replaceFields,
        {
          preserveSystemFields: true,
        }
      );

    // ===============================
    // SIMPAN ISI SURAT
    // ===============================

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

    // ===============================
    // ACTIVITY LOG
    // ===============================

    await logActivity({
      pengajuanId:
        pengajuan_id,

      status:
        "draft",

      aktivitas:
        "Surat dibuat oleh Admin.",

      conn,
    });

    // ===============================
    // COMMIT
    // ===============================

    await conn.commit();

    // File sudah menjadi bagian dari pengajuan
    uploadedFilePath = null;

    return NextResponse.json({
      success: true,
      pengajuan_id,
      kode_tracking,
      message:
        "Surat berhasil dibuat.",
    });

  } catch (err: any) {

    try {
      await conn.rollback();
    } catch {
      // Abaikan jika transaksi belum dimulai
    }

    // ===============================
    // CLEANUP FILE
    // ===============================

    if (
      uploadedFilePath
    ) {
      try {
        await unlink(
          uploadedFilePath
        );
      } catch {
        // Abaikan error cleanup
      }
    }

    console.error(
      "ADMIN BEDA NAMA IDENTITAS ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err?.message ??
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