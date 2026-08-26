import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    // ==========================
    // Kepala Keluarga
    // ==========================

    const nama_kepala_keluarga =
      formData.get("nama_kepala_keluarga") as string;

    const ttl_kepala_keluarga =
      formData.get("ttl_kepala_keluarga") as string;

    const nik_kepala_keluarga =
      formData.get("nik_kepala_keluarga") as string;

    const jenis_kelamin_kepala_keluarga =
      formData.get("jenis_kelamin_kepala_keluarga") as string;

    const kewarganegaraan_kepala_keluarga =
      formData.get("kewarganegaraan_kepala_keluarga") as string;

    const agama_kepala_keluarga =
      formData.get("agama_kepala_keluarga") as string;

    const pekerjaan_kepala_keluarga =
      formData.get("pekerjaan_kepala_keluarga") as string;

    const alamat_kepala_keluarga =
      formData.get("alamat_kepala_keluarga") as string;

    // ==========================
    // Anak
    // ==========================

    const nama_anak =
      formData.get("nama_anak") as string;

    const ttl_anak =
      formData.get("ttl_anak") as string;

    const nik_anak =
      formData.get("nik_anak") as string;

    const jenis_kelamin_anak =
      formData.get("jenis_kelamin_anak") as string;

    const kewarganegaraan_anak =
      formData.get("kewarganegaraan_anak") as string;

    const agama_anak =
      formData.get("agama_anak") as string;

    const pekerjaan_anak =
      formData.get("pekerjaan_anak") as string;

    const alamat_anak =
      formData.get("alamat_anak") as string;

    // ==========================
    // Penghasilan
    // ==========================

    const penghasilan =
      formData.get("penghasilan") as string;

    // ==========================
    // File KTP
    // ==========================

    const fileKtp =
      formData.get("file_ktp") as File | null;

    if (!fileKtp) {
      return NextResponse.json(
        {
          success: false,
          message: "File KTP wajib diupload.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================
    // Validasi File
    // ==========================

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
        {
          status: 400,
        }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (fileKtp.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran file maksimal 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================
    // Upload File
    // ==========================

    const bytes =
      await fileKtp.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const ext =
      fileKtp.name
        .split(".")
        .pop()
        ?.toLowerCase();

    const fileName =
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

    // ==========================
    // Ambil Jenis Surat
    // ==========================

    const [jenisRows]: any =
      await conn.query(
        `
        SELECT id, kode_surat
        FROM jenis_surat
        WHERE kode_surat = 'SKPHS'
        `
      );

    if (jenisRows.length === 0) {
      throw new Error(
        "Jenis surat tidak ditemukan."
      );
    }

    const kodeSurat =
      jenisRows[0].kode_surat;

    const jenisSuratId =
      jenisRows[0].id;

    // ==========================
    // Generate Tracking
    // ==========================

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
        countRows[0].total + 1
      ).padStart(4, "0");

    const kode_tracking =
      `${kodeSurat}-${tanggal}-${urut}`;

    // ==========================
    // Insert Pengajuan
    // ==========================

    const [result]: any =
      await conn.query(
        `
        INSERT INTO pengajuan_surat
        (
          jenis_surat_id,
          status,
          kode_tracking
        )
        VALUES
        (?, ?, ?)
        `,
        [
          jenisSuratId,
          "draft",
          kode_tracking,
        ]
      );

    const pengajuan_id =
      result.insertId;

    // ==========================
    // Insert Penghasilan
    // ==========================

    await conn.query(
      `
      INSERT INTO penghasilan
      (
        pengajuan_id,

        nama_kepala_keluarga,
        ttl_kepala_keluarga,
        nik_kepala_keluarga,
        jenis_kelamin_kepala_keluarga,
        kewarganegaraan_kepala_keluarga,
        agama_kepala_keluarga,
        pekerjaan_kepala_keluarga,
        alamat_kepala_keluarga,

        nama_anak,
        ttl_anak,
        nik_anak,
        jenis_kelamin_anak,
        kewarganegaraan_anak,
        agama_anak,
        pekerjaan_anak,
        alamat_anak,

        penghasilan,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,

        nama_kepala_keluarga,
        ttl_kepala_keluarga,
        nik_kepala_keluarga,
        jenis_kelamin_kepala_keluarga,
        kewarganegaraan_kepala_keluarga,
        agama_kepala_keluarga,
        pekerjaan_kepala_keluarga,
        alamat_kepala_keluarga,

        nama_anak,
        ttl_anak,
        nik_anak,
        jenis_kelamin_anak,
        kewarganegaraan_anak,
        agama_anak,
        pekerjaan_anak,
        alamat_anak,

        penghasilan,
        fileName,
      ]
    );

    // ==========================
    // Activity Log
    // ==========================

    await logActivity({
      pengajuanId: pengajuan_id,
      status: "draft",
      aktivitas: "Surat dibuat oleh Admin.",
      conn,
    });

    await conn.commit();

    return NextResponse.json({
      success: true,
      message: "Surat berhasil dibuat.",
      pengajuan_id,
      kode_tracking,
    });

  } catch (error) {
    await conn.rollback();

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );

  } finally {
    conn.release();
  }
}