import db from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

// =====================================================
// GET - LOOKUP DATA PENDUDUK BERDASARKAN NIK
// =====================================================

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const nik =
      searchParams.get("nik")?.trim();

    if (!nik) {
      return NextResponse.json({
        success: false,
        message: "NIK wajib diisi.",
      });
    }

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json({
        success: false,
        message: "NIK harus terdiri dari 16 digit.",
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

    if (!rows.length) {
      return NextResponse.json({
        success: false,
        message:
          "Data penduduk tidak ditemukan.",
      });
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });

  } catch (error) {
    console.error(
      "GET lookup SKKD:",
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

// =====================================================
// POST - PENGAJUAN SKKD
// =====================================================

export async function POST(request: Request) {
  const conn =
    await db.getConnection();

  let ktpName: string | null = null;
  let kkName: string | null = null;

  try {
    await conn.beginTransaction();

    const formData =
      await request.formData();

    // =================================================
    // DATA KEPENDUDUKAN
    // =================================================

    const nama =
      (formData.get("nama") as string | null)
        ?.trim() ?? "";

    const ttl =
      (formData.get("ttl") as string | null)
        ?.trim() ?? "";

    const nik =
      (formData.get("nik") as string | null)
        ?.trim() ?? "";

    const agama =
      (formData.get("agama") as string | null)
        ?.trim() ?? "";

    const jenis_kelamin =
      (
        formData.get(
          "jenis_kelamin"
        ) as string | null
      )?.trim() ?? "";

    const status_perkawinan =
      (
        formData.get(
          "status_perkawinan"
        ) as string | null
      )?.trim() ?? "";

    const pekerjaan =
      (
        formData.get(
          "pekerjaan"
        ) as string | null
      )?.trim() ?? "";

    const alamat =
      (formData.get("alamat") as string | null)
        ?.trim() ?? "";

    const dusun =
      (formData.get("dusun") as string | null)
        ?.trim() ?? "";

    const rt =
      (formData.get("rt") as string | null)
        ?.trim() ?? "";

    const rw =
      (formData.get("rw") as string | null)
        ?.trim() ?? "";

    const kewarganegaraan =
      (
        formData.get(
          "kewarganegaraan"
        ) as string | null
      )?.trim() ?? "";

    // =================================================
    // DATA PERSYARATAN
    // =================================================

    const no_kk =
      (formData.get("no_kk") as string | null)
        ?.trim() ?? "";

    // =================================================
    // DATA KHUSUS SKKD
    // =================================================

    const no_hp =
      (formData.get("no_hp") as string | null)
        ?.trim() ?? "";

    const nomor_porsi =
      (
        formData.get(
          "nomor_porsi"
        ) as string | null
      )?.trim() ?? "";

    const bin_binti =
      (
        formData.get(
          "bin_binti"
        ) as string | null
      )?.trim() ?? "";

    // =================================================
    // VALIDASI DATA KEPENDUDUKAN
    // =================================================

    if (!nik) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK wajib diisi.",
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

    // =================================================
    // VALIDASI DATA PERSYARATAN
    // =================================================

    if (!no_kk) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor KK wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(no_kk)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor KK harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // VALIDASI DATA KHUSUS
    // =================================================

    if (!no_hp) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor HP wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!nomor_porsi) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor porsi wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!bin_binti) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bin/Binti wajib diisi.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // FILE
    // =================================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    const fileKk =
      formData.get(
        "file_kk"
      ) as File | null;

    if (!fileKtp || !fileKk) {
      return NextResponse.json(
        {
          success: false,
          message:
            "File KTP dan KK wajib diupload.",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    const maxSize =
      5 * 1024 * 1024;

    for (const file of [
      fileKtp,
      fileKk,
    ]) {
      if (
        !allowedTypes.includes(
          file.type
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

      if (
        file.size > maxSize
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
    }

    // =================================================
    // UPLOAD KTP
    // =================================================

    const ktpExt =
      fileKtp.name
        .split(".")
        .pop()
        ?.toLowerCase();

    ktpName =
      `${randomUUID()}.${ktpExt}`;

    await writeFile(
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "ktp",
        ktpName
      ),
      Buffer.from(
        await fileKtp.arrayBuffer()
      )
    );

    // =================================================
    // UPLOAD KK
    // =================================================

    const kkExt =
      fileKk.name
        .split(".")
        .pop()
        ?.toLowerCase();

    kkName =
      `${randomUUID()}.${kkExt}`;

    await writeFile(
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "kk",
        kkName
      ),
      Buffer.from(
        await fileKk.arrayBuffer()
      )
    );

    // =================================================
    // AMBIL JENIS SURAT
    // =================================================

    const [jenisRows]: any =
      await conn.query(
        `
        SELECT
          id,
          kode_surat
        FROM jenis_surat
        WHERE kode_surat = 'SKKD'
        LIMIT 1
        `
      );

    if (!jenisRows.length) {
      throw new Error(
        "Jenis surat SKKD tidak ditemukan."
      );
    }

    const jenisSuratId =
      jenisRows[0].id;

    const kodeSurat =
      jenisRows[0].kode_surat;

    // =================================================
    // AMBIL KTP LAMA
    // =================================================

    const [oldKtpRows]: any =
      await conn.query(
        `
        SELECT
          file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    const oldKtp =
      oldKtpRows[0]?.file_ktp ??
      null;

    // =================================================
    // AMBIL KK LAMA
    // =================================================

    const [oldKkRows]: any =
      await conn.query(
        `
        SELECT
          file_kk
        FROM persyaratan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    const oldKk =
      oldKkRows[0]?.file_kk ??
      null;

    // =================================================
    // UPSERT KEPENDUDUKAN
    // =================================================

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
        ktpName,
      ]
    );

    // =================================================
    // UPSERT PERSYARATAN
    // =================================================

    await conn.query(
      `
      INSERT INTO persyaratan
      (
        nik,
        no_kk,
        file_kk
      )
      VALUES
      (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        no_kk = VALUES(no_kk),
        file_kk = VALUES(file_kk)
      `,
      [
        nik,
        no_kk,
        kkName,
      ]
    );

    // =================================================
    // GENERATE TRACKING
    // =================================================

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

    // =================================================
    // INSERT PENGAJUAN
    // =================================================

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

    // =================================================
    // INSERT KEBENARAN DATA
    // =================================================
    // Hanya data khusus surat.

    await conn.query(
      `
      INSERT INTO kebenaran_data
      (
        pengajuan_id,
        no_hp,
        nomor_porsi,
        bin_binti
      )
      VALUES
      (?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        no_hp,
        nomor_porsi,
        bin_binti,
      ]
    );

    // =================================================
    // ACTIVITY LOG
    // =================================================

    await logActivity({
      pengajuanId:
        pengajuan_id,

      status:
        "pending",

      aktivitas:
        "Pengajuan surat berhasil dikirim.",

      conn,
    });

    // =================================================
    // COMMIT
    // =================================================

    await conn.commit();

    // =================================================
    // HAPUS FILE LAMA SETELAH COMMIT
    // =================================================

    try {
      const { unlink } =
        await import("fs/promises");

      if (
        oldKtp &&
        oldKtp !== ktpName
      ) {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldKtp
          )
        );
      }

      if (
        oldKk &&
        oldKk !== kkName
      ) {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "kk",
            oldKk
          )
        );
      }
    } catch (fileError) {
      console.error(
        "Gagal menghapus file lama:",
        fileError
      );
    }

    return NextResponse.json({
      success: true,
      kode_tracking,
      message:
        "Pengajuan berhasil.",
    });

  } catch (error) {
    await conn.rollback();

    // =================================================
    // CLEANUP FILE JIKA DATABASE GAGAL
    // =================================================

    try {
      const { unlink } =
        await import("fs/promises");

      if (ktpName) {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            ktpName
          )
        );
      }

      if (kkName) {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "kk",
            kkName
          )
        );
      }
    } catch (fileError) {
      console.error(
        "Gagal menghapus file:",
        fileError
      );
    }

    console.error(error);

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