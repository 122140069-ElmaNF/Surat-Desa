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
    // FILE
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
          message:
            "File harus berupa JPG atau PNG.",
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
          message:
            "Ukuran file maksimal 5 MB.",
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

    const ext = fileKtp.name
      .split(".")
      .pop()
      ?.toLowerCase();

    const fileName =
      `${randomUUID()}.${ext}`;

    const uploadPath = path.join(
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
        // ===============================
    // AMBIL JENIS SURAT
    // ===============================

    const [jenisRows]: any =
      await conn.query(
        `
        SELECT
          id,
          kode_surat
        FROM jenis_surat
        WHERE kode_surat = 'SKBNI'
        `
      );

    const kodeSurat =
      jenisRows[0].kode_surat;

    const jenisSuratId =
      jenisRows[0].id;

    // ===============================
    // GENERATE TRACKING
    // ===============================

    const sekarang = new Date();

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

    const urut = String(
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
          "pending",
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

    await logActivity({
  pengajuanId: pengajuan_id,
  status: "pending",
  aktivitas: "Pengajuan surat berhasil dikirim.",
  conn,
});

    await conn.commit();

    return NextResponse.json({
      success: true,
      kode_tracking,
      message: "Pengajuan berhasil.",
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
