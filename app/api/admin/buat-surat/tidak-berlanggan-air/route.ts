import db from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { generateSurat } from "@/lib/surat/generateSurat";
import getJenisSurat from "@/lib/surat/getJenisSurat";

export async function POST(request: Request) {

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    const formData =
      await request.formData();

    // ===============================
    // Data Orang Tua / Wali
    // ===============================

    const nama_pertama =
      formData.get("nama_pertama") as string;

    const ttl_pertama =
      formData.get("ttl_pertama") as string;

    const nik_pertama =
      formData.get("nik_pertama") as string;

    const status_perkawinan_pertama =
      formData.get(
        "status_perkawinan_pertama"
      ) as string;

    const pekerjaan_pertama =
      formData.get(
        "pekerjaan_pertama"
      ) as string;

    const alamat_pertama =
      formData.get(
        "alamat_pertama"
      ) as string;

    // ===============================
    // Data Calon Mahasiswa
    // ===============================

    const nama_kedua =
      formData.get("nama_kedua") as string;

    const ttl_kedua =
      formData.get("ttl_kedua") as string;

    const nik_kedua =
      formData.get("nik_kedua") as string;

    const prodi_kedua =
      formData.get("prodi_kedua") as string;

    const alamat_kedua =
      formData.get("alamat_kedua") as string;

    // ===============================
    // File
    // ===============================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    if (!fileKtp) {

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

    const bytes =
      await fileKtp.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const ext =
      fileKtp.name
        .split(".")
        .pop();

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

        // ===============================
    // Ambil data jenis surat
    // ===============================

    const jenis =
      await getJenisSurat(
        "SKTBAPT"
      );

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

    // ===============================
    // Generate Tracking
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
    // Insert Pengajuan
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
    // Insert Tidak Berlangganan Air
    // ===============================

    await conn.query(
      `
      INSERT INTO tidak_berlangganan_air
      (
        pengajuan_id,

        nama_pertama,
        ttl_pertama,
        nik_pertama,
        status_perkawinan_pertama,
        pekerjaan_pertama,
        alamat_pertama,

        nama_kedua,
        ttl_kedua,
        nik_kedua,
        prodi_kedua,
        alamat_kedua,

        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,

        nama_pertama,
        ttl_pertama,
        nik_pertama,
        status_perkawinan_pertama,
        pekerjaan_pertama,
        alamat_pertama,

        nama_kedua,
        ttl_kedua,
        nik_kedua,
        prodi_kedua,
        alamat_kedua,

        fileName,
      ]
    );

    // ===============================
    // Generate Isi Surat
    // ===============================

    console.log("templateSurat =", templateSurat);
    console.log("typeof =", typeof templateSurat);

    const replaceFields: Record<string, string> = {
      nomor_surat: "",

      tanggal: new Date().toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),

      nama_pertama,
      ttl_pertama,
      nik_pertama,
      status_perkawinan_pertama,
      pekerjaan_pertama,
      alamat_pertama,

      nama_kedua,
      ttl_kedua,
      nik_kedua,
      prodi_kedua,
      alamat_kedua,
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
    // Simpan Isi Surat
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