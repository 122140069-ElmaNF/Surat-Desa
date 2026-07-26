import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    // ===============================
    // Data Pemilik
    // ===============================

    const nama = formData.get("nama") as string;
    const ttl = formData.get("ttl") as string;
    const nik = formData.get("nik") as string;
    const agama = formData.get("agama") as string;
    const jenis_kelamin = formData.get("jenis_kelamin") as string;
    const status_perkawinan = formData.get(
      "status_perkawinan"
    ) as string;
    const pekerjaan = formData.get("pekerjaan") as string;
    const alamat = formData.get("alamat") as string;

    // ===============================
    // Data Tanah
    // ===============================

    const nomor_sertifikat = formData.get(
      "nomor_sertifikat"
    ) as string;

    const luas_tanah = formData.get(
      "luas_tanah"
    ) as string;

    const tahun_perolehan = formData.get(
      "tahun_perolehan"
    ) as string;

    const asal_perolehan = formData.get(
      "asal_perolehan"
    ) as string;

    const letak_tanah = formData.get(
      "letak_tanah"
    ) as string;

    const harga_taksiran = formData.get(
      "harga_taksiran"
    ) as string;

    // ===============================
    // File KTP
    // ===============================

    const fileKtp = formData.get(
      "file_ktp"
    ) as File | null;

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

    // Validasi tipe file

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

    // Validasi ukuran maksimal 5 MB

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

    // ===============================
    // Upload File
    // ===============================

    const bytes = await fileKtp.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = fileKtp.name
      .split(".")
      .pop()
      ?.toLowerCase();

    const fileName = `${randomUUID()}.${ext}`;

    const uploadPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "ktp",
      fileName
    );

    await writeFile(uploadPath, buffer);

        // ===============================
    // Ambil kode surat
    // ===============================

    const [jenisRows]: any = await conn.query(
      `
      SELECT id,
      kode_surat
      FROM jenis_surat
      WHERE kode_surat = 'STHT'
      `
    );

    const kodeSurat = jenisRows[0].kode_surat;
    const jenisSuratId = jenisRows[0].id;

    // ===============================
    // Generate Tracking
    // ===============================

    const sekarang = new Date();

    const tanggal = `${String(
      sekarang.getDate()
    ).padStart(2, "0")}${String(
      sekarang.getMonth() + 1
    ).padStart(2, "0")}${String(
      sekarang.getFullYear()
    ).slice(-2)}`;

    const [countRows]: any = await conn.query(
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
    // Insert pengajuan
    // ===============================

    const [result]: any = await conn.query(
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

    const pengajuan_id = result.insertId;
        // ===============================
    // Insert tafsiran harga tanah
    // ===============================

    await conn.query(
      `
      INSERT INTO tafsiran_harga_tanah
      (
        pengajuan_id,
        nama,
        ttl,
        nik,
        agama,
        jenis_kelamin,
        status_perkawinan,
        pekerjaan,
        alamat,
        nomor_sertifikat,
        luas_tanah,
        tahun_perolehan,
        asal_perolehan,
        letak_tanah,
        harga_taksiran,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        nama,
        ttl,
        nik,
        agama,
        jenis_kelamin,
        status_perkawinan,
        pekerjaan,
        alamat,
        nomor_sertifikat,
        luas_tanah,
        tahun_perolehan,
        asal_perolehan,
        letak_tanah,
        harga_taksiran,
        fileName,
      ]
    );

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