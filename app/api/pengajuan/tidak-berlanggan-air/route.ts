import db from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

// =====================================================
// GET - LOOKUP DATA PENDUDUK BERDASARKAN NIK
// =====================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const nik = String(
      searchParams.get("nik") ?? ""
    ).trim();

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json({
        success: false,
        found: false,
        message: "NIK tidak valid.",
      });
    }

    const [rows]: any = await db.query(
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

    if (!rows.length) {
      return NextResponse.json({
        success: true,
        found: false,
        message: "Data penduduk belum ditemukan.",
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      data: rows[0],
      message: "Data penduduk ditemukan.",
    });
  } catch (error) {
    console.error(
      "GET lookup tidak berlangganan air error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST - AJUKAN SURAT
// =====================================================

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedFilePath: string | null = null;

  let oldFileName: string | null = null;

  try {
    const formData = await request.formData();

    // =====================================================
    // DATA ORANG PERTAMA
    // =====================================================

    const nikPertama = String(
      formData.get("nik_pertama") ?? ""
    ).trim();

    const namaPertama = String(
      formData.get("nama_pertama") ?? ""
    ).trim();

    const ttlPertama = String(
      formData.get("ttl_pertama") ?? ""
    ).trim();

    const agamaPertama = String(
      formData.get("agama_pertama") ?? ""
    ).trim();

    const jenisKelaminPertama = String(
      formData.get("jenis_kelamin_pertama") ?? ""
    ).trim();

    const statusPerkawinanPertama = String(
      formData.get("status_perkawinan_pertama") ?? ""
    ).trim();

    const pekerjaanPertama = String(
      formData.get("pekerjaan_pertama") ?? ""
    ).trim();

    const alamatPertama = String(
      formData.get("alamat_pertama") ?? ""
    ).trim();

    const dusunPertama = String(
      formData.get("dusun_pertama") ?? ""
    ).trim();

    const rtPertama = String(
      formData.get("rt_pertama") ?? ""
    ).trim();

    const rwPertama = String(
      formData.get("rw_pertama") ?? ""
    ).trim();

    const kewarganegaraanPertama = String(
      formData.get("kewarganegaraan_pertama") ?? ""
    ).trim();

    // =====================================================
    // DATA ORANG KEDUA / CALON MAHASISWA
    // =====================================================

    const nikKedua = String(
      formData.get("nik_kedua") ?? ""
    ).trim();

    const namaKedua = String(
      formData.get("nama_kedua") ?? ""
    ).trim();

    const ttlKedua = String(
      formData.get("ttl_kedua") ?? ""
    ).trim();

    const alamatKedua = String(
      formData.get("alamat_kedua") ?? ""
    ).trim();

    // =====================================================
    // DATA KHUSUS SURAT
    // =====================================================

    const prodiKedua = String(
      formData.get("prodi_kedua") ?? ""
    ).trim();

    // =====================================================
    // VALIDASI NIK
    // =====================================================

    if (!/^\d{16}$/.test(nikPertama)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK orang pertama harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nikKedua)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK orang kedua harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI DATA ORANG PERTAMA
    // =====================================================

    if (
      !namaPertama ||
      !ttlPertama ||
      !agamaPertama ||
      !jenisKelaminPertama ||
      !statusPerkawinanPertama ||
      !pekerjaanPertama ||
      !alamatPertama ||
      !dusunPertama ||
      !rtPertama ||
      !rwPertama ||
      !kewarganegaraanPertama
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data orang pertama belum lengkap.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI DATA ORANG KEDUA
    // =====================================================

    if (
      !namaKedua ||
      !ttlKedua ||
      !alamatKedua
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data calon mahasiswa belum lengkap.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI PROGRAM STUDI
    // =====================================================

    if (!prodiKedua) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Program studi calon mahasiswa wajib diisi.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // FILE KTP
    // =====================================================

    const fileKtp =
      formData.get("file_ktp") as File | null;

    if (
      !fileKtp ||
      fileKtp.size === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "File KTP wajib diupload.",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        fileKtp.type
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "File harus berupa JPG atau PNG.",
        },
        { status: 400 }
      );
    }

    const maxSize =
      5 * 1024 * 1024;

    if (fileKtp.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ukuran file maksimal 5 MB.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // CEK KTP LAMA ORANG PERTAMA
    // =====================================================

    const [pendudukRows]: any =
      await conn.query(
        `
        SELECT
          file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nikPertama]
      );

    if (
      pendudukRows.length > 0
    ) {
      oldFileName =
        pendudukRows[0]?.file_ktp ??
        null;
    }

    // =====================================================
    // UPLOAD KTP
    // =====================================================

    const uploadDir =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "ktp"
      );

    await mkdir(
      uploadDir,
      {
        recursive: true,
      }
    );

    const ext =
      fileKtp.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const fileName =
      `${randomUUID()}.${ext}`;

    const uploadPath =
      path.join(
        uploadDir,
        fileName
      );

    await writeFile(
      uploadPath,
      Buffer.from(
        await fileKtp.arrayBuffer()
      )
    );

    uploadedFilePath =
      uploadPath;

    // =====================================================
    // MULAI TRANSAKSI
    // =====================================================

    await conn.beginTransaction();

    // =====================================================
    // AMBIL JENIS SURAT
    // =====================================================

    const [jenisRows]: any =
      await conn.query(
        `
        SELECT
          id,
          kode_surat
        FROM jenis_surat
        WHERE kode_surat = 'SKTBAPT'
        LIMIT 1
        `
      );

    if (!jenisRows.length) {
      throw new Error(
        "Jenis surat SKTBAPT tidak ditemukan."
      );
    }

    const jenisSuratId =
      jenisRows[0].id;

    const kodeSurat =
      jenisRows[0].kode_surat;

    // =====================================================
    // UPSERT KEPENDUDUKAN ORANG PERTAMA
    // =====================================================

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
      ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        ttl = VALUES(ttl),
        agama = VALUES(agama),
        jenis_kelamin = VALUES(jenis_kelamin),
        status_perkawinan = VALUES(status_perkawinan),
        pekerjaan = VALUES(pekerjaan),
        alamat = VALUES(alamat),
        dusun = VALUES(dusun),
        rt = VALUES(rt),
        rw = VALUES(rw),
        kewarganegaraan = VALUES(kewarganegaraan),
        file_ktp = VALUES(file_ktp)
      `,
      [
        nikPertama,
        namaPertama,
        ttlPertama,
        agamaPertama,
        jenisKelaminPertama,
        statusPerkawinanPertama,
        pekerjaanPertama,
        alamatPertama,
        dusunPertama,
        rtPertama,
        rwPertama,
        kewarganegaraanPertama,
        fileName,
      ]
    );

    // =====================================================
    // UPSERT KEPENDUDUKAN ORANG KEDUA
    // =====================================================

    await conn.query(
      `
      INSERT INTO kependudukan
      (
        nik,
        nama,
        ttl,
        alamat
      )
      VALUES
      (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        ttl = VALUES(ttl),
        alamat = VALUES(alamat)
      `,
      [
        nikKedua,
        namaKedua,
        ttlKedua,
        alamatKedua,
      ]
    );

    // =====================================================
    // GENERATE KODE TRACKING
    // =====================================================

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

    const kodeTracking =
      `${kodeSurat}-${tanggal}-${urut}`;

    // =====================================================
    // INSERT PENGAJUAN SURAT
    // =====================================================

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
          nikPertama,
          "pending",
          kodeTracking,
        ]
      );

    const pengajuanId =
      result.insertId;

    // =====================================================
    // INSERT DETAIL SURAT
    // =====================================================

    await conn.query(
      `
      INSERT INTO tidak_berlangganan_air
      (
        pengajuan_id,
        nik_pertama,
        nik_kedua,
        prodi_kedua
      )
      VALUES
      (?, ?, ?, ?)
      `,
      [
        pengajuanId,
        nikPertama,
        nikKedua,
        prodiKedua,
      ]
    );

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    await logActivity({
      pengajuanId,
      status: "pending",
      aktivitas:
        "Pengajuan surat berhasil dikirim.",
      conn,
    });

    // =====================================================
    // COMMIT
    // =====================================================

    await conn.commit();

    // =====================================================
    // HAPUS KTP LAMA
    // =====================================================

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

    uploadedFilePath =
      null;

    return NextResponse.json({
      success: true,
      kode_tracking:
        kodeTracking,
      message:
        "Pengajuan berhasil.",
    });

  } catch (error) {

    try {
      await conn.rollback();
    } catch {
      // Abaikan jika transaksi
      // belum dimulai
    }

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
      "POST tidak berlangganan air error:",
      error
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