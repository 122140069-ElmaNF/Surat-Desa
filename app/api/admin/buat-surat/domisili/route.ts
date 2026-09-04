import db from "@/lib/db";
import { NextResponse } from "next/server";
import {
  writeFile,
  unlink,
  mkdir,
} from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

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

    // ===============================
    // DATA KEPENDUDUKAN
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

    // ===============================
    // VALIDASI NIK
    // ===============================

    if (!/^\d{16}$/.test(nik)) {
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

    // ===============================
    // FILE KTP
    // ===============================
    // KTP OPSIONAL UNTUK ADMIN
    // ===============================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    let fileName:
      string | null = null;

    // ===============================
    // CEK KTP LAMA
    // ===============================

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

    // ===============================
    // VALIDASI DAN UPLOAD KTP
    // JIKA FILE DIISI
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
        return NextResponse.json(
          {
            success: false,
            message:
              "File harus berupa JPG atau PNG.",
          },
          {
            status: 400,
          }
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
          {
            status: 400,
          }
        );
      }

      // ===============================
      // FOLDER UPLOAD
      // ===============================

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

      // ===============================
      // NAMA FILE UUID
      // ===============================

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

      // ===============================
      // SIMPAN FILE
      // ===============================

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

    // ===============================
    // MULAI TRANSAKSI
    // ===============================

    await conn.beginTransaction();

    // ===============================
    // AMBIL JENIS SURAT
    // ===============================

    const jenis =
      await getJenisSurat("SD");

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

    // ===============================
    // SIMPAN / UPDATE KEPENDUDUKAN
    // ===============================

    const finalKtpFile =
      fileName ?? oldKtpFile;

    const [
      pendudukRows,
    ]: any = await conn.query(
      `
      SELECT
        nik
      FROM kependudukan
      WHERE nik = ?
      LIMIT 1
      `,
      [nik]
    );

    // ===============================
    // JIKA NIK BELUM ADA
    // ===============================

    if (
      pendudukRows.length === 0
    ) {
      await conn.query(
        `
        INSERT INTO kependudukan
        (
          nik,
          nama,
          ttl,
          agama,
          jenis_kelamin,
          pekerjaan,
          alamat,
          dusun,
          rt,
          rw,
          file_ktp
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nik,
          nama,
          ttl,
          agama,
          jenis_kelamin,
          pekerjaan,
          alamat,
          dusun,
          rt,
          rw,
          finalKtpFile,
        ]
      );
    } else {
      // ===============================
      // UPDATE DATA KEPENDUDUKAN
      // ===============================

      await conn.query(
        `
        UPDATE kependudukan
        SET
          nama = ?,
          ttl = ?,
          agama = ?,
          jenis_kelamin = ?,
          pekerjaan = ?,
          alamat = ?,
          dusun = ?,
          rt = ?,
          rw = ?,
          file_ktp = ?
        WHERE nik = ?
        `,
        [
          nama,
          ttl,
          agama,
          jenis_kelamin,
          pekerjaan,
          alamat,
          dusun,
          rt,
          rw,
          finalKtpFile,
          nik,
        ]
      );
    }

    // ===============================
    // GENERATE TRACKING
    // ===============================

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
      SELECT COUNT(*) total
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
    // INSERT DOMISILI
    // ===============================

    await conn.query(
      `
      INSERT INTO domisili
      (
        pengajuan_id
      )
      VALUES
      (?)
      `,
      [
        pengajuan_id,
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
      pekerjaan,
      alamat,
      dusun,
      rt,
      rw,
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

    // ===============================
    // HAPUS KTP LAMA JIKA DIGANTI
    // ===============================

    if (
      fileName &&
      oldKtpFile &&
      oldKtpFile !== fileName
    ) {
      const oldPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          oldKtpFile
        );

      if (
        fs.existsSync(oldPath)
      ) {
        try {
          await unlink(oldPath);
        } catch (fileError) {
          console.error(
            "Gagal menghapus KTP lama:",
            fileError
          );
        }
      }
    }

    uploadedFilePath = null;

    // ===============================
    // RESPONSE
    // ===============================

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

    // ===============================
    // HAPUS FILE JIKA GAGAL
    // ===============================

    if (
      uploadedFilePath &&
      fs.existsSync(
        uploadedFilePath
      )
    ) {
      try {
        await unlink(
          uploadedFilePath
        );
      } catch (fileError) {
        console.error(
          "Gagal menghapus file:",
          fileError
        );
      }
    }

    console.error(
      "ERROR ADMIN BUAT SURAT DOMISILI:",
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