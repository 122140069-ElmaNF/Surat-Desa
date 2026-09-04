import db from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { logActivity } from "@/lib/activity";

import { generateSurat } from "@/lib/surat/generateSurat";
import getJenisSurat from "@/lib/surat/getJenisSurat";

// =========================================
// GET - LOOKUP NIK
// =========================================

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const nik =
      searchParams.get("nik");

    if (!nik) {
      return NextResponse.json({
        success: false,
        found: false,
        message:
          "NIK tidak ditemukan.",
      });
    }

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

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(
      "GET IZIN KERAMAIAN:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat mencari data penduduk.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================================
// POST - AJUKAN IZIN KERAMAIAN
// =========================================

export async function POST(
  request: Request
) {
  const conn =
    await db.getConnection();

  let uploadedFileName:
    | string
    | null = null;

  try {
    await conn.beginTransaction();

    const formData =
      await request.formData();

    // =====================================
    // DATA KEPENDUDUKAN
    // =====================================

    const nik = String(
      formData.get("nik") ?? ""
    ).trim();

    const nama = String(
      formData.get("nama") ?? ""
    ).trim();

    const ttl = String(
      formData.get("ttl") ?? ""
    ).trim();

    const agama = String(
      formData.get("agama") ?? ""
    ).trim();

    const jenis_kelamin =
      String(
        formData.get(
          "jenis_kelamin"
        ) ?? ""
      ).trim();

    const status_perkawinan =
      String(
        formData.get(
          "status_perkawinan"
        ) ?? ""
      ).trim();

    const pekerjaan = String(
      formData.get("pekerjaan") ?? ""
    ).trim();

    const alamat = String(
      formData.get("alamat") ?? ""
    ).trim();

    const dusun = String(
      formData.get("dusun") ?? ""
    ).trim();

    const rt = String(
      formData.get("rt") ?? ""
    ).trim();

    const rw = String(
      formData.get("rw") ?? ""
    ).trim();

    const kewarganegaraan =
      String(
        formData.get(
          "kewarganegaraan"
        ) ?? ""
      ).trim();

    // =====================================
    // DATA KHUSUS IZIN KERAMAIAN
    // =====================================

    const jenis_kegiatan =
      String(
        formData.get(
          "jenis_kegiatan"
        ) ?? ""
      ).trim();

    const tanggal_kegiatan =
      String(
        formData.get(
          "tanggal_kegiatan"
        ) ?? ""
      ).trim();

    const jam_kegiatan =
      String(
        formData.get(
          "jam_kegiatan"
        ) ?? ""
      ).trim();

    const acara = String(
      formData.get("acara") ?? ""
    ).trim();

    // =====================================
    // FILE KTP
    // =====================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // =====================================
    // VALIDASI DATA
    // =====================================

    if (!nik) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    if (!nama) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!ttl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tempat dan tanggal lahir wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!agama) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Agama wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!jenis_kelamin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jenis kelamin wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!status_perkawinan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status perkawinan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!pekerjaan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pekerjaan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!alamat) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Alamat wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!dusun) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Dusun wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!rt) {
      return NextResponse.json(
        {
          success: false,
          message:
            "RT wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!rw) {
      return NextResponse.json(
        {
          success: false,
          message:
            "RW wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!kewarganegaraan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kewarganegaraan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!jenis_kegiatan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jenis kegiatan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!tanggal_kegiatan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tanggal kegiatan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!jam_kegiatan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jam kegiatan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!acara) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Acara wajib diisi.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // VALIDASI FILE
    // =====================================

    if (!fileKtp) {
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

    if (
      fileKtp.size > maxSize
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ukuran file maksimal 5 MB.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // UPLOAD FILE KTP
    // =====================================

    const bytes =
      await fileKtp.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const ext =
      fileKtp.name
        .split(".")
        .pop()
        ?.toLowerCase();

    uploadedFileName =
      `${randomUUID()}.${ext}`;

    const uploadPath =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "ktp",
        uploadedFileName
      );

    await writeFile(
      uploadPath,
      buffer
    );

    // =====================================
    // AMBIL JENIS SURAT
    // =====================================

    const jenis =
      await getJenisSurat(
        "SKIK"
      );

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ?? "";

    // =====================================
    // UPDATE / INSERT KEPENDUDUKAN
    // =====================================

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

    // =====================================
    // GENERATE TRACKING
    // =====================================

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
        SELECT COUNT(*) AS total
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

    // =====================================
    // INSERT PENGAJUAN
    // =====================================

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
          nik,
          "pending",
          kode_tracking,
        ]
      );

    const pengajuan_id =
      result.insertId;

    // =====================================
    // INSERT IZIN KERAMAIAN
    // =====================================

    await conn.query(
      `
      INSERT INTO izin_keramaian
      (
        pengajuan_id,
        jenis_kegiatan,
        tanggal_kegiatan,
        jam_kegiatan,
        acara,
        file_ktp
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        jenis_kegiatan,
        tanggal_kegiatan,
        jam_kegiatan,
        acara,
        uploadedFileName,
      ]
    );

    // =====================================
    // GENERATE ISI SURAT
    // =====================================

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

      nama,
      ttl,
      nik,
      agama,
      jenis_kelamin,
      status_perkawinan,
      pekerjaan,
      alamat,
      dusun,
      rt,
      rw,
      kewarganegaraan,

      jenis_kegiatan,
      tanggal_kegiatan,
      jam_kegiatan,
      acara,
    };

    const isiSurat =
      generateSurat(
        templateSurat,
        replaceFields,
        {
          preserveSystemFields:
            true,
        }
      );

    // =====================================
    // SIMPAN ISI SURAT
    // =====================================

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

    // =====================================
    // ACTIVITY LOG
    // =====================================

    await logActivity({
      conn,
      pengajuanId:
        pengajuan_id,
      status: "pending",
      aktivitas:
        "Pengajuan surat berhasil dikirim.",
    });

    // =====================================
    // COMMIT
    // =====================================

    await conn.commit();

    return NextResponse.json({
      success: true,
      pengajuan_id,
      kode_tracking,
      message:
        "Pengajuan berhasil dikirim.",
    });
  } catch (err) {
    await conn.rollback();

    console.error(
      "POST IZIN KERAMAIAN:",
      err
    );

    // Hapus file jika transaksi gagal
    if (uploadedFileName) {
      try {
        const filePath =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            uploadedFileName
          );

        const { unlink } =
          await import(
            "fs/promises"
          );

        await unlink(filePath);
      } catch {
        // Abaikan jika file
        // sudah tidak ada
      }
    }

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