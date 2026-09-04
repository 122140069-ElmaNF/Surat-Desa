import db from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

import { generateSurat } from "@/lib/surat/generateSurat";
import getJenisSurat from "@/lib/surat/getJenisSurat";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedFilePath: string | null = null;

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    // =================================================
    // DATA PEMOHON
    // =================================================

    const nama = formData.get("nama") as string;
    const ttl = formData.get("ttl") as string;
    const nik = formData.get("nik") as string;
    const agama = formData.get("agama") as string;
    const jenis_kelamin =
      formData.get("jenis_kelamin") as string;

    const status_perkawinan =
      formData.get("status_perkawinan") as string;

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
      formData.get("kewarganegaraan") as string;

    const nama_usaha =
      formData.get("nama_usaha") as string;

    // =================================================
    // VALIDASI NIK
    // =================================================

    if (!nik || !/^\d{16}$/.test(nik)) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "NIK harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // FILE KTP - OPSIONAL UNTUK ADMIN
    // =================================================

    const fileKtp =
      formData.get("file_ktp") as File | null;

    let fileName: string | null = null;

    // =================================================
    // AMBIL KTP LAMA DARI KEPENDUDUKAN
    // =================================================

    const [oldPendudukRows]: any =
      await conn.query(
        `
        SELECT file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    const oldKtpFile =
      oldPendudukRows.length > 0
        ? oldPendudukRows[0].file_ktp
        : null;

    // Hanya diproses jika admin mengupload KTP
    if (fileKtp && fileKtp.size > 0) {
      // =================================================
      // VALIDASI TIPE FILE
      // =================================================

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!allowedTypes.includes(fileKtp.type)) {
        await conn.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "File KTP harus berupa JPG, JPEG, atau PNG.",
          },
          { status: 400 }
        );
      }

      // =================================================
      // VALIDASI UKURAN FILE
      // =================================================

      if (fileKtp.size > 5 * 1024 * 1024) {
        await conn.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file KTP maksimal 5 MB.",
          },
          { status: 400 }
        );
      }

      // =================================================
      // UPLOAD FILE KTP
      // =================================================

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

    // =================================================
    // KTP FINAL
    // =================================================

    const finalKtpFile =
      fileName ?? oldKtpFile;

    // =================================================
    // AMBIL JENIS SURAT
    // =================================================

    const jenis =
      await getJenisSurat("SKU");

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

    // =================================================
    // SIMPAN / UPDATE DATA KEPENDUDUKAN
    // =================================================

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

    if (pendudukRows.length === 0) {
      // =================================================
      // NIK BELUM ADA → INSERT
      // =================================================

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
    } else {
      // =================================================
      // NIK SUDAH ADA → UPDATE
      // =================================================

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
          kewarganegaraan = ?,
          file_ktp = ?
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
          finalKtpFile,
          nik,
        ]
      );
    }

    // =================================================
    // GENERATE TRACKING
    // =================================================

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

    const [countRows]: any =
      await conn.query(
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

    // =================================================
    // INSERT PENGAJUAN
    // =================================================

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

    // =================================================
    // INSERT DETAIL SKU
    // =================================================

    await conn.query(
      `
      INSERT INTO usaha
      (
        pengajuan_id,
        nama_usaha
      )
      VALUES
      (?, ?)
      `,
      [
        pengajuan_id,
        nama_usaha,
      ]
    );

    // =================================================
    // GENERATE ISI SURAT
    // =================================================

    const replaceFields:
      Record<string, string> = {
        nomor_surat: "",

        tanggal:
          new Date().toLocaleDateString(
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

        nama_usaha,
      };

    const isiSurat =
      generateSurat(
        templateSurat,
        replaceFields,
        {
          preserveSystemFields: true,
        }
      );

    // =================================================
    // SIMPAN ISI SURAT
    // =================================================

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

    // =================================================
    // ACTIVITY LOG
    // =================================================

    await logActivity({
      pengajuanId: pengajuan_id,
      status: "draft",
      aktivitas: "Surat dibuat oleh Admin.",
      conn,
    });

    // =================================================
    // COMMIT
    // =================================================

    await conn.commit();

    // Hanya hapus referensi agar file baru
    // tidak ikut terhapus setelah commit
    uploadedFilePath = null;

    // =================================================
    // HAPUS KTP LAMA JIKA DIGANTI
    // =================================================

    if (
      fileName &&
      oldKtpFile &&
      oldKtpFile !== fileName
    ) {
      try {
        const oldFilePath =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldKtpFile
          );

        await unlink(oldFilePath);
      } catch {
        // Abaikan jika file lama tidak ditemukan
      }
    }

    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json({
      success: true,
      pengajuan_id,
      kode_tracking,
      message: "Surat berhasil dibuat.",
    });

  } catch (err) {
    await conn.rollback();

    // =================================================
    // HAPUS FILE JIKA DATABASE GAGAL
    // =================================================

    if (uploadedFilePath) {
      try {
        await unlink(uploadedFilePath);
      } catch {
        // Abaikan jika file tidak ditemukan
      }
    }

    console.error(
      "ERROR ADMIN BUAT SKU:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan server.",
      },
      { status: 500 }
    );

  } finally {
    conn.release();
  }
}