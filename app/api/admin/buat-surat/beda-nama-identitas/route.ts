import db from "@/lib/db";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { NextResponse } from "next/server";

import { generateSurat } from "@/lib/surat/generateSurat";
import getJenisSurat from "@/lib/surat/getJenisSurat";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    // ===============================
    // IDENTITAS LAMA
    // ===============================

    const nama_lama =
      formData.get("nama_lama") as string;

    const ttl_lama =
      formData.get("ttl_lama") as string;

    const nik_lama =
      formData.get("nik_lama") as string;

    const jenis_kelamin_lama =
      formData.get("jenis_kelamin_lama") as string;

    const pekerjaan_lama =
      formData.get("pekerjaan_lama") as string;

    const alamat_lama =
      formData.get("alamat_lama") as string;

    // ===============================
    // IDENTITAS BARU
    // ===============================

    const nama_baru =
      formData.get("nama_baru") as string;

    const ttl_baru =
      formData.get("ttl_baru") as string;

    const nik_baru =
      formData.get("nik_baru") as string;

    const jenis_kelamin_baru =
      formData.get("jenis_kelamin_baru") as string;

    const pekerjaan_baru =
      formData.get("pekerjaan_baru") as string;

    const alamat_baru =
      formData.get("alamat_baru") as string;

    // ===============================
    // KETERANGAN
    // ===============================

    const isi_keterangan =
      formData.get("isi_keterangan") as string;

    // ===============================
    // FILE KTP
    // ===============================

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

    // ===============================
    // VALIDASI FILE
    // ===============================

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

    const maxSize =
      5 * 1024 * 1024;

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

    // ===============================
    // UPLOAD FILE
    // ===============================

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

    // ===============================
    // JENIS SURAT
    // ===============================

    const jenis =
      await getJenisSurat("SKBNI");

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

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

    // ===============================
    // INSERT PENGAJUAN
    // ===============================

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

    // ===============================
    // INSERT BEDA NAMA IDENTITAS
    // ===============================

    await conn.query(
      `
      INSERT INTO beda_nama_identitas
      (
        pengajuan_id,

        nama_lama,
        ttl_lama,
        nik_lama,
        jenis_kelamin_lama,
        pekerjaan_lama,
        alamat_lama,

        nama_baru,
        ttl_baru,
        nik_baru,
        jenis_kelamin_baru,
        pekerjaan_baru,
        alamat_baru,

        isi_keterangan,

        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,

        nama_lama,
        ttl_lama,
        nik_lama,
        jenis_kelamin_lama,
        pekerjaan_lama,
        alamat_lama,

        nama_baru,
        ttl_baru,
        nik_baru,
        jenis_kelamin_baru,
        pekerjaan_baru,
        alamat_baru,

        isi_keterangan,

        fileName,
      ]
    );

    // ===============================
    // GENERATE ISI SURAT
    // ===============================

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

      nama_lama,
      ttl_lama,
      nik_lama,
      jenis_kelamin_lama,
      pekerjaan_lama,
      alamat_lama,

      nama_baru,
      ttl_baru,
      nik_baru,
      jenis_kelamin_baru,
      pekerjaan_baru,
      alamat_baru,

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
      pengajuanId: pengajuan_id,
      status: "draft",
      aktivitas: "Surat dibuat oleh Admin.",
      conn,
    });

    // ===============================
    // COMMIT
    // ===============================

    await conn.commit();

    return NextResponse.json({
      success: true,
      pengajuan_id,
      kode_tracking,
      message: "Surat berhasil dibuat.",
    });

  } catch (err) {
    await conn.rollback();

    console.error(err);

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