import db from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { logActivity } from "@/lib/activity";

import { generateSurat } from "@/lib/surat/generateSurat";
import getJenisSurat from "@/lib/surat/getJenisSurat";

// =====================================================
// POST
// Pengajuan Surat Keterangan Tidak Mampu
// =====================================================

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedFilePath: string | null = null;
  let oldFileName: string | null = null;

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    // =================================================
    // AMBIL DATA FORM
    // =================================================

    const nik =
      formData.get("nik") as string;

    const nama =
      formData.get("nama") as string;

    const ttl =
      formData.get("ttl") as string;

    const agama =
      formData.get("agama") as string;

    const jenis_kelamin =
      formData.get("jenis_kelamin") as string;

    const status_perkawinan =
      formData.get(
        "status_perkawinan"
      ) as string;

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
      formData.get(
        "kewarganegaraan"
      ) as string;

    const keperluan =
      formData.get(
        "keperluan"
      ) as string;

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // =================================================
    // VALIDASI NIK
    // =================================================

    if (
      !nik ||
      !/^\d{16}$/.test(nik)
    ) {
      await conn.rollback();

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

    // =================================================
    // VALIDASI FILE KTP
    // =================================================

    if (
      !fileKtp ||
      fileKtp.size === 0
    ) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "File KTP wajib diupload.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        fileKtp.type
      )
    ) {
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

    if (
      fileKtp.size >
      5 * 1024 * 1024
    ) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Ukuran file KTP maksimal 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // CEK KTP LAMA DI KEPENDUDUKAN
    // =================================================

    const [oldPendudukRows]: any =
      await conn.query(
        `
        SELECT
          file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    if (
      oldPendudukRows.length > 0
    ) {
      oldFileName =
        oldPendudukRows[0]?.file_ktp ??
        null;
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

    const fileName =
      `${randomUUID()}.${ext}`;

    const uploadPath =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "ktp",
        fileName
      );

    await writeFile(
      uploadPath,
      buffer
    );

    uploadedFilePath =
      uploadPath;

    // =================================================
    // AMBIL JENIS SURAT
    // =================================================

    const jenis =
      await getJenisSurat(
        "SKTM"
      );

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

    // =================================================
    // CEK DATA KEPENDUDUKAN
    // =================================================

    const [pendudukRows]: any =
      await conn.query(
        `
        SELECT
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
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    // =================================================
    // SIMPAN / UPDATE DATA KEPENDUDUKAN
    // =================================================

    if (
      pendudukRows.length === 0
    ) {

      // =================================================
      // JIKA NIK BELUM ADA → INSERT
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
          fileName,
        ]
      );

    } else {

      // =================================================
      // JIKA NIK SUDAH ADA → UPDATE
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
          fileName,
          nik,
        ]
      );
    }

    // =================================================
    // GENERATE KODE TRACKING
    // =================================================

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
    // INSERT PENGAJUAN SURAT
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
          "pending",
          kode_tracking,
        ]
      );

    const pengajuan_id =
      result.insertId;

    // =================================================
    // INSERT DETAIL SKTM
    // =================================================

    await conn.query(
      `
      INSERT INTO tidak_mampu
      (
        pengajuan_id,
        keperluan
      )
      VALUES
      (?, ?)
      `,
      [
        pengajuan_id,
        keperluan,
      ]
    );

    // =================================================
    // GENERATE ISI SURAT
    // =================================================

    const replaceFields: Record<
      string,
      string
    > = {
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

      keperluan,
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
      pengajuanId:
        pengajuan_id,
      status: "pending",
      aktivitas:
        "Pengajuan surat berhasil dikirim.",
      conn,
    });

    // =================================================
    // COMMIT
    // =================================================

    await conn.commit();

    // =================================================
    // HAPUS KTP LAMA
    // =================================================

    if (
      oldFileName &&
      oldFileName !== fileName
    ) {
      try {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldFileName
          )
        );
      } catch {
        // Abaikan jika file lama
        // tidak ditemukan
      }
    }

    uploadedFilePath = null;

    return NextResponse.json({
      success: true,
      pengajuan_id,
      kode_tracking,
      message:
        "Pengajuan berhasil dikirim.",
    });

  } catch (err) {

    try {
      await conn.rollback();
    } catch {
      // Abaikan jika transaksi
      // belum dimulai
    }

    // Hapus file jika database gagal
    if (uploadedFilePath) {
      try {
        await unlink(
          uploadedFilePath
        );
      } catch {
        // Abaikan jika file
        // tidak ditemukan
      }
    }

    console.error(
      "ERROR PENGAJUAN SKTM:",
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

// =====================================================
// GET
// LOOKUP DATA PENDUDUK BERDASARKAN NIK
// =====================================================

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const nik =
      searchParams.get("nik");

    // =================================================
    // NIK BELUM DIISI
    // =================================================

    if (!nik) {
      return NextResponse.json({
        success: true,
        found: false,
        message:
          "NIK belum diisi.",
      });
    }

    // =================================================
    // VALIDASI NIK
    // =================================================

    if (
      !/^\d{16}$/.test(nik)
    ) {
      return NextResponse.json({
        success: true,
        found: false,
        message:
          "NIK harus terdiri dari 16 digit.",
      });
    }

    // =================================================
    // CARI DATA PENDUDUK
    // =================================================

    const [rows]: any =
      await db.query(
        `
        SELECT
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
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    // =================================================
    // DATA TIDAK DITEMUKAN
    // =================================================

    if (
      rows.length === 0
    ) {
      return NextResponse.json({
        success: true,
        found: false,
        message:
          "Data penduduk belum terdaftar.",
      });
    }

    // =================================================
    // DATA DITEMUKAN
    // =================================================

    return NextResponse.json({
      success: true,
      found: true,
      data: rows[0],
    });

  } catch (error) {
    console.error(
      "ERROR LOOKUP PENDUDUK:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        found: false,
        message:
          "Gagal mengambil data penduduk.",
      },
      {
        status: 500,
      }
    );
  }
}