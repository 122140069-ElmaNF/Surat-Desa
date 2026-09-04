import db from "@/lib/db";
import {
  writeFile,
  unlink,
} from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";
import getJenisSurat from "@/lib/surat/getJenisSurat";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const nik =
      searchParams.get("nik")?.trim();

    if (
      !nik ||
      !/^\d{16}$/.test(nik)
    ) {
      return NextResponse.json({
        success: false,
        found: false,
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
      "GET SKL ERROR:",
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

  let oldFileName:
    string | null = null;

  try {

    await conn.beginTransaction();

    const formData =
      await request.formData();

    // ===============================
    // DATA PEMOHON
    // ===============================

    const nik =
      String(
        formData.get("nik") ?? ""
      ).trim();

    const nama =
      String(
        formData.get("nama") ?? ""
      ).trim();

    const ttl =
      String(
        formData.get("ttl") ?? ""
      ).trim();

    const agama =
      String(
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

    const pekerjaan =
      String(
        formData.get(
          "pekerjaan"
        ) ?? ""
      ).trim();

    const alamat =
      String(
        formData.get(
          "alamat"
        ) ?? ""
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

    // ===============================
    // DATA LISTRIK
    // ===============================

    const idpel =
      String(
        formData.get("idpel") ?? ""
      ).trim();

    const jenis_meteran =
      String(
        formData.get(
          "jenis_meteran"
        ) ?? ""
      ).trim();

    const keperluan =
      String(
        formData.get(
          "keperluan"
        ) ?? ""
      ).trim();

    // ===============================
    // VALIDASI NIK
    // ===============================

    if (!nik) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !/^\d{16}$/.test(nik)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK harus terdiri dari 16 digit.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // VALIDASI DATA PEMOHON
    // ===============================

    if (
      !nama ||
      !ttl ||
      !agama ||
      !jenis_kelamin ||
      !status_perkawinan ||
      !pekerjaan ||
      !alamat ||
      !dusun ||
      !rt ||
      !rw ||
      !kewarganegaraan
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data pemohon wajib dilengkapi.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // VALIDASI DATA LISTRIK
    // ===============================

    if (
      !idpel ||
      !jenis_meteran ||
      !keperluan
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data listrik wajib dilengkapi.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // CEK KTP LAMA
    // ===============================

    const [pendudukRows]: any =
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

    if (
      pendudukRows.length > 0
    ) {
      oldFileName =
        pendudukRows[0]?.file_ktp ??
        null;
    }

    // ===============================
    // FILE KTP
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

    // ===============================
    // VALIDASI FILE
    // ===============================

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
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    // ===============================
    // UPLOAD FILE KTP
    // ===============================

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

    // ===============================
    // UPSERT KEPENDUDUKAN
    // ===============================

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
          VALUES(kewarganegaraan),
        file_ktp =
          VALUES(file_ktp)
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
        fileName,
      ]
    );

    // ===============================
    // AMBIL JENIS SURAT
    // ===============================

    const jenis =
      await getJenisSurat("SKL");

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    // ===============================
    // GENERATE TRACKING
    // ===============================

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

    // ===============================
    // INSERT PENGAJUAN
    // ===============================

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

    // ===============================
    // INSERT DETAIL LISTRIK
    // ===============================

    await conn.query(
      `
      INSERT INTO listrik
      (
        pengajuan_id,
        idpel,
        jenis_meteran,
        keperluan
      )
      VALUES
      (?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        idpel,
        jenis_meteran,
        keperluan,
      ]
    );

    // ===============================
    // ACTIVITY LOG
    // ===============================

    await logActivity({
      pengajuanId:
        pengajuan_id,

      status:
        "pending",

      aktivitas:
        "Pengajuan surat berhasil dikirim.",

      conn,
    });

    // ===============================
    // COMMIT
    // ===============================

    await conn.commit();

    // ===============================
    // HAPUS KTP LAMA
    // ===============================

    if (
      oldFileName &&
      oldFileName !== fileName
    ) {
      const oldPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          oldFileName
        );

      try {
        await unlink(
          oldPath
        );
      } catch {
        // Abaikan jika file lama
        // tidak ditemukan.
      }
    }

    uploadedFilePath = null;

    return NextResponse.json({
      success: true,
      kode_tracking,
      message:
        "Pengajuan berhasil.",
    });

  } catch (error) {

    await conn.rollback();

    if (uploadedFilePath) {
      try {
        await unlink(
          uploadedFilePath
        );
      } catch {
        // Abaikan jika file tidak ditemukan
      }
    }

    console.error(
      "POST SKL ERROR:",
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