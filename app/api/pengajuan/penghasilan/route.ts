import db from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nik = searchParams.get("nik");

    if (!nik) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK wajib diisi.",
        },
        { status: 400 }
      );
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
        success: false,
        found: false,
        message: "Data penduduk tidak ditemukan.",
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("GET penghasilan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedFilePath: string | null = null;

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    // =====================================================
    // DATA KEPALA KELUARGA
    // =====================================================

    const nikKepalaKeluarga =
      String(formData.get("nik_kepala_keluarga") ?? "").trim();

    const namaKepalaKeluarga =
      String(formData.get("nama_kepala_keluarga") ?? "").trim();

    const ttlKepalaKeluarga =
      String(formData.get("ttl_kepala_keluarga") ?? "").trim();

    const agamaKepalaKeluarga =
      String(formData.get("agama_kepala_keluarga") ?? "").trim();

    const jenisKelaminKepalaKeluarga =
      String(
        formData.get("jenis_kelamin_kepala_keluarga") ?? ""
      ).trim();

    const statusPerkawinanKepalaKeluarga =
      String(
        formData.get("status_perkawinan_kepala_keluarga") ?? ""
      ).trim();

    const pekerjaanKepalaKeluarga =
      String(formData.get("pekerjaan_kepala_keluarga") ?? "").trim();

    const alamatKepalaKeluarga =
      String(formData.get("alamat_kepala_keluarga") ?? "").trim();

    const dusunKepalaKeluarga =
      String(formData.get("dusun_kepala_keluarga") ?? "").trim();

    const rtKepalaKeluarga =
      String(formData.get("rt_kepala_keluarga") ?? "").trim();

    const rwKepalaKeluarga =
      String(formData.get("rw_kepala_keluarga") ?? "").trim();

    const kewarganegaraanKepalaKeluarga =
      String(
        formData.get("kewarganegaraan_kepala_keluarga") ?? ""
      ).trim();

    // =====================================================
    // DATA ANAK
    // =====================================================

    const nikAnak =
      String(formData.get("nik_anak") ?? "").trim();

    const namaAnak =
      String(formData.get("nama_anak") ?? "").trim();

    const ttlAnak =
      String(formData.get("ttl_anak") ?? "").trim();

    const agamaAnak =
      String(formData.get("agama_anak") ?? "").trim();

    const jenisKelaminAnak =
      String(formData.get("jenis_kelamin_anak") ?? "").trim();

    const statusPerkawinanAnak =
      String(
        formData.get("status_perkawinan_anak") ?? ""
      ).trim();

    const pekerjaanAnak =
      String(formData.get("pekerjaan_anak") ?? "").trim();

    const alamatAnak =
      String(formData.get("alamat_anak") ?? "").trim();

    const dusunAnak =
      String(formData.get("dusun_anak") ?? "").trim();

    const rtAnak =
      String(formData.get("rt_anak") ?? "").trim();

    const rwAnak =
      String(formData.get("rw_anak") ?? "").trim();

    const kewarganegaraanAnak =
      String(
        formData.get("kewarganegaraan_anak") ?? ""
      ).trim();

    // =====================================================
    // DATA PENGHASILAN
    // =====================================================

    const nilaiPenghasilan =
      String(formData.get("penghasilan") ?? "").trim();

    // =====================================================
    // VALIDASI NIK
    // =====================================================

    if (!/^\d{16}$/.test(nikKepalaKeluarga)) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK kepala keluarga harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nikAnak)) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK anak harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI DATA KEPALA KELUARGA
    // =====================================================

    if (
      !namaKepalaKeluarga ||
      !ttlKepalaKeluarga ||
      !agamaKepalaKeluarga ||
      !jenisKelaminKepalaKeluarga ||
      !pekerjaanKepalaKeluarga ||
      !alamatKepalaKeluarga
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data kepala keluarga belum lengkap.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI DATA ANAK
    // =====================================================

    if (
      !namaAnak ||
      !ttlAnak ||
      !agamaAnak ||
      !jenisKelaminAnak ||
      !pekerjaanAnak ||
      !alamatAnak
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data anak belum lengkap.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI PENGHASILAN
    // =====================================================

    if (!nilaiPenghasilan) {
      return NextResponse.json(
        {
          success: false,
          message: "Penghasilan wajib diisi.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // FILE KTP
    // =====================================================

    const fileKtp =
      formData.get("file_ktp") as File | null;

    if (!fileKtp || fileKtp.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "File KTP wajib diupload.",
        },
        { status: 400 }
      );
    }

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
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (fileKtp.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran file maksimal 5 MB.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // UPLOAD KTP
    // =====================================================

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "ktp"
    );

    await mkdir(uploadDir, { recursive: true });

    const bytes = await fileKtp.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext =
      fileKtp.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const fileName =
      `${randomUUID()}.${ext}`;

    const uploadPath =
      path.join(uploadDir, fileName);

    await writeFile(uploadPath, buffer);

    uploadedFilePath = uploadPath;

    // =====================================================
    // AMBIL JENIS SURAT
    // =====================================================

    const [jenisRows]: any = await conn.query(
      `
      SELECT id, kode_surat
      FROM jenis_surat
      WHERE kode_surat = 'SKPHS'
      LIMIT 1
      `
    );

    if (!jenisRows.length) {
      throw new Error(
        "Jenis surat SKPHS tidak ditemukan."
      );
    }

    const jenisSuratId =
      jenisRows[0].id;

    const kodeSurat =
      jenisRows[0].kode_surat;

    // =====================================================
    // UPSERT KEPALA KELUARGA KE KEPENDUDUKAN
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
        kewarganegaraan
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        kewarganegaraan = VALUES(kewarganegaraan)
      `,
      [
        nikKepalaKeluarga,
        namaKepalaKeluarga,
        ttlKepalaKeluarga,
        agamaKepalaKeluarga,
        jenisKelaminKepalaKeluarga,
        statusPerkawinanKepalaKeluarga,
        pekerjaanKepalaKeluarga,
        alamatKepalaKeluarga,
        dusunKepalaKeluarga,
        rtKepalaKeluarga,
        rwKepalaKeluarga,
        kewarganegaraanKepalaKeluarga,
      ]
    );

    // =====================================================
    // UPSERT ANAK KE KEPENDUDUKAN
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
        kewarganegaraan
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        kewarganegaraan = VALUES(kewarganegaraan)
      `,
      [
        nikAnak,
        namaAnak,
        ttlAnak,
        agamaAnak,
        jenisKelaminAnak,
        statusPerkawinanAnak,
        pekerjaanAnak,
        alamatAnak,
        dusunAnak,
        rtAnak,
        rwAnak,
        kewarganegaraanAnak,
      ]
    );

    // =====================================================
    // GENERATE TRACKING
    // =====================================================

    const sekarang = new Date();

    const tanggal =
      `${String(sekarang.getDate()).padStart(2, "0")}` +
      `${String(sekarang.getMonth() + 1).padStart(2, "0")}` +
      `${String(sekarang.getFullYear()).slice(-2)}`;

    const [countRows]: any =
      await conn.query(
        `
        SELECT COUNT(*) AS total
        FROM pengajuan_surat
        WHERE jenis_surat_id = ?
        `,
        [jenisSuratId]
      );

    const urut =
      String(
        Number(countRows[0].total) + 1
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
        VALUES (?, ?, ?, ?)
        `,
        [
          jenisSuratId,
          nikKepalaKeluarga,
          "pending",
          kodeTracking,
        ]
      );

    const pengajuanId =
      result.insertId;

    // =====================================================
    // INSERT DETAIL PENGHASILAN
    // =====================================================

    await conn.query(
      `
      INSERT INTO penghasilan
      (
        pengajuan_id,
        nik_kepala_keluarga,
        nik_anak,
        penghasilan,
        file_ktp
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        pengajuanId,
        nikKepalaKeluarga,
        nikAnak,
        nilaiPenghasilan,
        fileName,
      ]
    );

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    await logActivity({
      pengajuanId,
      status: "pending",
      aktivitas: "Pengajuan surat berhasil dikirim.",
      conn,
    });

    // =====================================================
    // COMMIT
    // =====================================================

    await conn.commit();

    return NextResponse.json({
      success: true,
      kode_tracking: kodeTracking,
      message: "Pengajuan berhasil.",
    });
  } catch (error) {
    await conn.rollback();

    // Hapus file jika transaksi gagal
    if (uploadedFilePath) {
      try {
        const { unlink } = await import("fs/promises");
        await unlink(uploadedFilePath);
      } catch {
        // abaikan jika file sudah tidak ada
      }
    }

    console.error("POST penghasilan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}