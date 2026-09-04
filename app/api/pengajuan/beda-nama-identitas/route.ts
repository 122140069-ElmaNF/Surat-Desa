import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";
import buildSuratHtml from "@/lib/surat/buildSuratHtml";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const nik =
      searchParams.get("nik");

    // ==================================
    // VALIDASI NIK
    // ==================================

    if (
      !nik ||
      !/^\d{16}$/.test(nik)
    ) {
      return NextResponse.json({
        success: false,
        message: "NIK tidak valid.",
      });
    }

    // ==================================
    // CARI DATA KEPENDUDUKAN
    // ==================================

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

    // ==================================
    // DATA TIDAK DITEMUKAN
    // ==================================

    if (
      rows.length === 0
    ) {
      return NextResponse.json({
        success: true,
        found: false,
        data: null,
      });
    }

    // ==================================
    // DATA DITEMUKAN
    // ==================================

    return NextResponse.json({
      success: true,
      found: true,
      data: rows[0],
    });

  } catch (error) {

    console.error(
      "GET BEDA NAMA IDENTITAS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengambil data penduduk.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  const conn =
    await db.getConnection();

  let uploadedFilePath:
    string | null = null;

  try {

    await conn.beginTransaction();

    const formData =
      await request.formData();

    // ==================================
    // DATA PEMOHON
    // ==================================

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

    const status_perkawinan =
      String(
        formData.get(
          "status_perkawinan"
        ) ?? ""
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

    const kewarganegaraan =
      String(
        formData.get(
          "kewarganegaraan"
        ) ?? ""
      ).trim();

    // ==================================
    // KETERANGAN
    // ==================================

    const isi_keterangan =
      String(
        formData.get(
          "isi_keterangan"
        ) ?? ""
      ).trim();

    // ==================================
    // VALIDASI NIK
    // ==================================

    if (
      !/^\d{16}$/.test(nik)
    ) {
      throw new Error(
        "NIK harus terdiri dari 16 digit."
      );
    }

    // ==================================
    // VALIDASI DATA PEMOHON
    // ==================================

    if (!nama) {
      throw new Error(
        "Nama wajib diisi."
      );
    }

    if (!ttl) {
      throw new Error(
        "TTL wajib diisi."
      );
    }

    if (!agama) {
      throw new Error(
        "Agama wajib diisi."
      );
    }

    if (!jenis_kelamin) {
      throw new Error(
        "Jenis kelamin wajib diisi."
      );
    }

    if (!status_perkawinan) {
      throw new Error(
        "Status perkawinan wajib diisi."
      );
    }

    if (!pekerjaan) {
      throw new Error(
        "Pekerjaan wajib diisi."
      );
    }

    if (!alamat) {
      throw new Error(
        "Alamat wajib diisi."
      );
    }

    if (!dusun) {
      throw new Error(
        "Dusun wajib diisi."
      );
    }

    if (!rt) {
      throw new Error(
        "RT wajib diisi."
      );
    }

    if (!rw) {
      throw new Error(
        "RW wajib diisi."
      );
    }

    if (!kewarganegaraan) {
      throw new Error(
        "Kewarganegaraan wajib diisi."
      );
    }

    // ==================================
    // VALIDASI KETERANGAN
    // ==================================

    if (!isi_keterangan) {
      throw new Error(
        "Keterangan wajib diisi."
      );
    }

    // ==================================
    // FILE KTP
    // ==================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    if (
      !fileKtp ||
      fileKtp.size === 0
    ) {
      throw new Error(
        "File KTP wajib diupload."
      );
    }

    // ==================================
    // VALIDASI FILE
    // ==================================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        fileKtp.type
      )
    ) {
      throw new Error(
        "File harus berupa JPG atau PNG."
      );
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      fileKtp.size > maxSize
    ) {
      throw new Error(
        "Ukuran file maksimal 5 MB."
      );
    }

    // ==================================
    // UPLOAD KTP
    // ==================================

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

    // ==================================
    // AMBIL JENIS SURAT
    // ==================================

    const [jenisRows]: any =
      await conn.query(
        `
        SELECT
          id,
          kode_surat,
          template_surat
        FROM jenis_surat
        WHERE kode_surat = 'SKBNI'
        LIMIT 1
        `
      );

    if (
      jenisRows.length === 0
    ) {
      throw new Error(
        "Jenis surat tidak ditemukan."
      );
    }

    const jenisSuratId =
      jenisRows[0].id;

    const kodeSurat =
      jenisRows[0].kode_surat;

    const templateSurat =
      jenisRows[0].template_surat;

    // ==================================
    // SIMPAN / UPDATE KEPENDUDUKAN
    // ==================================

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

      ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        ttl = VALUES(ttl),
        agama = VALUES(agama),
        jenis_kelamin =
          VALUES(jenis_kelamin),
        status_perkawinan =
          VALUES(status_perkawinan),
        pekerjaan =
          VALUES(pekerjaan),
        alamat =
          VALUES(alamat),
        dusun =
          VALUES(dusun),
        rt =
          VALUES(rt),
        rw =
          VALUES(rw),
        kewarganegaraan =
          VALUES(kewarganegaraan)
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

    // ==================================
    // GENERATE TRACKING
    // ==================================

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
        SELECT
          COUNT(*) AS total
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

    // ==================================
    // INSERT PENGAJUAN
    // ==================================

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

    // ==================================
    // INSERT DETAIL SKBNI
    // ==================================

    await conn.query(
      `
      INSERT INTO beda_nama_identitas
      (
        pengajuan_id,
        isi_keterangan,
        file_ktp
      )
      VALUES
      (?, ?, ?)
      `,
      [
        pengajuan_id,
        isi_keterangan,
        fileName,
      ]
    );

    // ==================================
    // GENERATE ISI SURAT
    // ==================================

    const isiSurat =
      await buildSuratHtml({
        pengajuanId:
          pengajuan_id,

        nomorSurat:
          "",

        tanggalSurat:
          sekarang,

        templateSurat:
          templateSurat ?? "",
      });

    if (
      isiSurat &&
      isiSurat.trim() !== ""
    ) {
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
    }

    // ==================================
    // ACTIVITY LOG
    // ==================================

    await logActivity({
      pengajuanId:
        pengajuan_id,

      status:
        "pending",

      aktivitas:
        "Pengajuan surat berhasil dikirim.",

      conn,
    });

    // ==================================
    // COMMIT
    // ==================================

    await conn.commit();

    // File sudah menjadi bagian
    // dari pengajuan yang berhasil.
    uploadedFilePath = null;

    return NextResponse.json({
      success: true,
      kode_tracking,
      message:
        "Pengajuan berhasil.",
    });

  } catch (error: any) {

    await conn.rollback();

    // ==================================
    // CLEANUP FILE JIKA GAGAL
    // ==================================

    if (
      uploadedFilePath
    ) {
      try {
        const {
          unlink,
        } = await import(
          "fs/promises"
        );

        await unlink(
          uploadedFilePath
        );

      } catch {
        // Abaikan error cleanup
      }
    }

    console.error(
      "POST BEDA NAMA IDENTITAS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ??
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