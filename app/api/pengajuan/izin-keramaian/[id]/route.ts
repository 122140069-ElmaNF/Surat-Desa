import db from "@/lib/db";
import { logActivity } from "@/lib/activity";

import { NextResponse } from "next/server";
import {
  writeFile,
  unlink,
} from "fs/promises";

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const conn =
    await db.getConnection();

  let newUploadedFile:
    | string
    | null = null;

  try {
    await conn.beginTransaction();

    const { id } =
      await context.params;

    const formData =
      await request.formData();

    // =========================================
    // DATA KEPENDUDUKAN
    // =========================================

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
        formData.get(
          "dusun"
        ) ?? ""
      ).trim();

    const rt =
      String(
        formData.get(
          "rt"
        ) ?? ""
      ).trim();

    const rw =
      String(
        formData.get(
          "rw"
        ) ?? ""
      ).trim();

    const kewarganegaraan =
      String(
        formData.get(
          "kewarganegaraan"
        ) ?? ""
      ).trim();

    // =========================================
    // DATA KHUSUS IZIN KERAMAIAN
    // =========================================

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

    const acara =
      String(
        formData.get(
          "acara"
        ) ?? ""
      ).trim();

    // =========================================
    // FILE KTP
    // =========================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // =========================================
    // VALIDASI DATA
    // =========================================

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

    // =========================================
    // AMBIL DATA PENGAJUAN
    // =========================================

    const [pengajuanRows]: any =
      await conn.query(
        `
        SELECT
          id,
          nik
        FROM pengajuan_surat
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (
      pengajuanRows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data pengajuan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // =========================================
    // AMBIL KTP LAMA DARI KEPENDUDUKAN
    // =========================================

    const oldNik =
      pengajuanRows[0]?.nik;

    const [pendudukRows]: any =
      await conn.query(
        `
        SELECT
          file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [oldNik]
      );

    const oldFile =
      pendudukRows.length > 0
        ? pendudukRows[0]?.file_ktp ?? null
        : null;

    let newFileName =
      oldFile;

    // =========================================
    // UPLOAD FILE KTP BARU
    // =========================================

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
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

      const bytes =
        await fileKtp.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase();

      newFileName =
        `${randomUUID()}.${ext}`;

      newUploadedFile =
        newFileName;

      const uploadPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          newFileName
        );

      await writeFile(
        uploadPath,
        buffer
      );
    }

    // =========================================
    // UPDATE / INSERT KEPENDUDUKAN
    // =========================================

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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        newFileName,
      ]
    );

    // =========================================
    // UPDATE PENGAJUAN SURAT
    // =========================================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        nik = ?,
        status = 'pending',
        alasan_penolakan = NULL
      WHERE id = ?
      `,
      [
        nik,
        id,
      ]
    );

    // =========================================
    // UPDATE DETAIL IZIN KERAMAIAN
    // =========================================

    await conn.query(
      `
      UPDATE izin_keramaian
      SET
        jenis_kegiatan = ?,
        tanggal_kegiatan = ?,
        jam_kegiatan = ?,
        acara = ?
      WHERE pengajuan_id = ?
      `,
      [
        jenis_kegiatan,
        tanggal_kegiatan,
        jam_kegiatan,
        acara,
        id,
      ]
    );

    // =========================================
    // ACTIVITY LOG
    // =========================================

    await logActivity({
      conn,
      pengajuanId:
        Number(id),
      status: "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
    });

    // =========================================
    // COMMIT
    // =========================================

    await conn.commit();

    // =========================================
    // HAPUS FILE KTP LAMA
    // =========================================

    if (
      fileKtp &&
      fileKtp.size > 0 &&
      oldFile &&
      oldFile !== newFileName
    ) {
      const oldPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          oldFile
        );

      try {
        if (
          fs.existsSync(oldPath)
        ) {
          await unlink(oldPath);
        }
      } catch (fileError) {
        console.error(
          "Gagal menghapus file KTP lama:",
          fileError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });
  } catch (err: any) {
    await conn.rollback();

    // =========================================
    // HAPUS FILE BARU JIKA TRANSAKSI GAGAL
    // =========================================

    if (newUploadedFile) {
      const newPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          newUploadedFile
        );

      try {
        if (
          fs.existsSync(newPath)
        ) {
          await unlink(newPath);
        }
      } catch (fileError) {
        console.error(
          "Gagal menghapus file baru:",
          fileError
        );
      }
    }

    console.error(
      "PUT IZIN KERAMAIAN:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ??
          "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}