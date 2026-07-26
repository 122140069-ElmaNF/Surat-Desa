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

    const nama =
      formData.get("nama") as string;

    const nik =
      formData.get("nik") as string;

    const agama =
      formData.get("agama") as string;

    const jenis_kelamin =
      formData.get("jenis_kelamin") as string;

    const umur =
      formData.get("umur") as string;

    const pekerjaan =
      formData.get("pekerjaan") as string;

    const alamat =
      formData.get("alamat") as string;

    const hari =
      formData.get("hari") as string;

    const tanggal =
      formData.get("tanggal") as string;

    const jam =
      formData.get("jam") as string;

    const bertempat_di =
      formData.get("bertempat_di") as string;

    const penyebab =
      formData.get("penyebab") as string;

    const pelapor =
      formData.get("pelapor") as string;

    const hubungan_pelapor =
      formData.get("hubungan_pelapor") as string;

    const fileKtp =
      formData.get("file_ktp") as File | null;

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

    // ===============================
    // Upload File
    // ===============================

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
    // Ambil Data Jenis Surat
    // ===============================

    const jenis =
      await getJenisSurat("SKM");

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

    const tanggalTracking =
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
      `${kodeSurat}-${tanggalTracking}-${urut}`;

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
    // Insert Kematian
    // ===============================

    await conn.query(
      `
      INSERT INTO kematian
      (
        pengajuan_id,
        nama,
        nik,
        agama,
        jenis_kelamin,
        umur,
        pekerjaan,
        alamat,
        hari,
        tanggal,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        nama,
        nik,
        agama,
        jenis_kelamin,
        umur,
        pekerjaan,
        alamat,
        hari,
        tanggal,
        jam,
        bertempat_di,
        penyebab,
        pelapor,
        hubungan_pelapor,
        fileName,
      ]
    );

    // ===============================
    // Generate Isi Surat
    // ===============================

    console.log(
      "templateSurat =",
      templateSurat
    );

    console.log(
      "typeof =",
      typeof templateSurat
    );

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
      nik,
      agama,
      jenis_kelamin,
      umur,
      pekerjaan,
      alamat,

      hari,
      jam,

      bertempat_di,
      penyebab,

      pelapor,
      hubungan_pelapor,

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
      message:
        "Surat berhasil dibuat.",
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