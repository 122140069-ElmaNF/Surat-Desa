import db from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
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
    // DATA IDENTITAS PENDUDUK
    // =================================================

    const nik = String(formData.get("nik") ?? "").trim();

    const nama = String(formData.get("nama") ?? "").trim();

    const ttl = String(formData.get("ttl") ?? "").trim();

    const agama = String(formData.get("agama") ?? "").trim();

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

    // =================================================
    // DATA KHUSUS KEMATIAN
    // =================================================

    const hari = String(
      formData.get("hari") ?? ""
    ).trim();

    const tanggal = String(
      formData.get("tanggal") ?? ""
    ).trim();

    const umur = String(
      formData.get("umur") ?? ""
    ).trim();

    const jam = String(
      formData.get("jam") ?? ""
    ).trim();

    const bertempat_di = String(
      formData.get("bertempat_di") ?? ""
    ).trim();

    const penyebab = String(
      formData.get("penyebab") ?? ""
    ).trim();

    const pelapor = String(
      formData.get("pelapor") ?? ""
    ).trim();

    const hubungan_pelapor = String(
      formData.get("hubungan_pelapor") ?? ""
    ).trim();

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
        {
          status: 400,
        }
      );
    }

    // =================================================
    // FILE KTP - OPSIONAL UNTUK ADMIN
    // =================================================

    const fileKtp = formData.get("file_ktp") as File | null;

    let fileName: string | null = null;

    if (fileKtp && fileKtp.size > 0) {
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
          {
            status: 400,
          }
        );
      }

      if (fileKtp.size > 5 * 1024 * 1024) {
        await conn.rollback();

        return NextResponse.json(
          {
            success: false,
            message: "Ukuran file KTP maksimal 5 MB.",
          },
          {
            status: 400,
          }
        );
      }

      // =================================================
      // BUAT FOLDER UPLOAD
      // =================================================

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "ktp"
      );

      await mkdir(uploadDir, {
        recursive: true,
      });

      // =================================================
      // UPLOAD FILE
      // =================================================

      const bytes = await fileKtp.arrayBuffer();

      const buffer = Buffer.from(bytes);

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      fileName = `${randomUUID()}.${ext}`;

      const uploadPath = path.join(
        uploadDir,
        fileName
      );

      await writeFile(
        uploadPath,
        buffer
      );

      uploadedFilePath = uploadPath;
    }

    // =================================================
    // AMBIL JENIS SURAT
    // =================================================

    const jenis = await getJenisSurat("SKM");

    const jenisSuratId = jenis.id;

    const kodeSurat = jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

    // =================================================
    // SIMPAN / UPDATE KEPENDUDUKAN
    // =================================================

    const [pendudukRows]: any =
      await conn.query(
        `
        SELECT
          nik
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
          kewarganegaraan
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          kewarganegaraan = ?
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
          nik,
        ]
      );
    }

    // =================================================
    // GENERATE TRACKING
    // =================================================

    const sekarang = new Date();

    const tanggalTracking =
      `${String(sekarang.getDate()).padStart(
        2,
        "0"
      )}${String(
        sekarang.getMonth() + 1
      ).padStart(
        2,
        "0"
      )}${String(
        sekarang.getFullYear()
      ).slice(-2)}`;

    const [countRows]: any =
      await conn.query(
        `
        SELECT
          COUNT(*) total
        FROM pengajuan_surat
        WHERE jenis_surat_id = ?
        `,
        [jenisSuratId]
      );

    const urut = String(
      Number(countRows[0].total) + 1
    ).padStart(4, "0");

    const kode_tracking =
      `${kodeSurat}-${tanggalTracking}-${urut}`;

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

    const pengajuan_id = result.insertId;

    // =================================================
    // INSERT DETAIL KEMATIAN
    //
    // NIK TIDAK DISIMPAN DI SINI.
    // NIK sudah berada di pengajuan_surat.
    // =================================================

    await conn.query(
      `
      INSERT INTO kematian
      (
        pengajuan_id,
        hari,
        tanggal,
        umur,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        hari,
        tanggal,
        umur,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor,
        fileName,
      ]
    );

    // =================================================
    // GENERATE ISI SURAT
    // =================================================

    const replaceFields: Record<string, string> = {
      // =================================================
      // DATA SISTEM SURAT
      // =================================================

      nomor_surat: "",

      // Tanggal surat dibuat oleh sistem
      tanggal: new Date().toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),

      // =================================================
      // DATA KEPENDUDUKAN
      // =================================================

      nama,
      nik,
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

      // =================================================
      // DATA KEMATIAN
      // =================================================

      hari,

      // Gunakan key berbeda agar tidak bentrok
      // dengan tanggal surat.
      tanggal_kematian: tanggal,

      umur,
      jam,
      bertempat_di,
      penyebab,

      // =================================================
      // DATA PELAPOR
      // =================================================

      pelapor,
      hubungan_pelapor,
    };

    const isiSurat = generateSurat(
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
      SET
        isi_surat = ?
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

      aktivitas:
        "Surat dibuat oleh Admin.",

      conn,
    });

    // =================================================
    // COMMIT
    // =================================================

    await conn.commit();

    uploadedFilePath = null;

    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json({
      success: true,
      pengajuan_id,
      kode_tracking,
      message: "Surat berhasil dibuat.",
    });
  } catch (err: any) {
    await conn.rollback();

    // =================================================
    // HAPUS FILE JIKA TRANSAKSI GAGAL
    // =================================================

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
      "ERROR ADMIN BUAT SKM:",
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