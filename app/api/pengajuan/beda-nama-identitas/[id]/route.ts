import { NextResponse } from "next/server";
import db from "@/lib/db";
import { logActivity } from "@/lib/activity";

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

  let newFilePath: string | null = null;
  let oldFilePath: string | null = null;

  try {
    await conn.beginTransaction();

    const { id } =
      await context.params;

    const formData =
      await request.formData();

    // ===============================
    // DATA IDENTITAS
    // ===============================

    const nama =
      String(
        formData.get("nama") ?? ""
      );

    const ttl =
      String(
        formData.get("ttl") ?? ""
      );

    const nik =
      String(
        formData.get("nik") ?? ""
      );

    const agama =
      String(
        formData.get("agama") ?? ""
      );

    const jenis_kelamin =
      String(
        formData.get("jenis_kelamin") ?? ""
      );

    const status_perkawinan =
      String(
        formData.get("status_perkawinan") ?? ""
      );

    const pekerjaan =
      String(
        formData.get("pekerjaan") ?? ""
      );

    const alamat =
      String(
        formData.get("alamat") ?? ""
      );

    const dusun =
      String(
        formData.get("dusun") ?? ""
      );

    const rt =
      String(
        formData.get("rt") ?? ""
      );

    const rw =
      String(
        formData.get("rw") ?? ""
      );

    const kewarganegaraan =
      String(
        formData.get("kewarganegaraan") ?? ""
      );

    // ===============================
    // DATA KHUSUS SKBNI
    // ===============================

    const isi_keterangan =
      String(
        formData.get("isi_keterangan") ?? ""
      );

    // ===============================
    // FILE KTP BARU
    // ===============================

    const fileKtp =
      formData.get("file_ktp") as
        | File
        | null;

    // ===============================
    // VALIDASI NIK
    // ===============================

    if (!/^\d{16}$/.test(nik)) {
      await conn.rollback();

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
    // VALIDASI DATA
    // ===============================

    if (!nama.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ttl.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "TTL wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!agama.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Agama wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!jenis_kelamin.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Jenis kelamin wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!status_perkawinan.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Status perkawinan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!pekerjaan.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Pekerjaan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!alamat.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Alamat wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!dusun.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Dusun wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!rt.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "RT wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!rw.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "RW wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!kewarganegaraan.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Kewarganegaraan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isi_keterangan.trim()) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Keterangan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // PASTIKAN PENGAJUAN ADA
    // ===============================

    const [pengajuanRows]: any =
      await conn.query(
        `
        SELECT
          id,
          nik,
          status
        FROM pengajuan_surat
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (pengajuanRows.length === 0) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Pengajuan surat tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // ===============================
    // AMBIL DATA KEPENDUDUKAN LAMA
    // ===============================

    const [oldPendudukRows]: any =
      await conn.query(
        `
        SELECT
          nik,
          file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    const oldFile =
      oldPendudukRows.length > 0
        ? oldPendudukRows[0]?.file_ktp ?? null
        : null;

    // ===============================
    // UPLOAD KTP BARU
    // ===============================

    let newFileName =
      oldFile;

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      // ===============================
      // Validasi tipe
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
        await conn.rollback();

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

      // ===============================
      // Validasi ukuran
      // ===============================

      const maxSize =
        5 * 1024 * 1024;

      if (fileKtp.size > maxSize) {
        await conn.rollback();

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
      // Simpan file baru
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

      newFileName =
        `${randomUUID()}.${ext}`;

      newFilePath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          newFileName
        );

      await writeFile(
        newFilePath,
        buffer
      );
    }

    // ===============================
    // SIMPAN / UPDATE KEPENDUDUKAN
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
        jenis_kelamin = VALUES(jenis_kelamin),
        status_perkawinan =
          VALUES(status_perkawinan),
        pekerjaan = VALUES(pekerjaan),
        alamat = VALUES(alamat),
        dusun = VALUES(dusun),
        rt = VALUES(rt),
        rw = VALUES(rw),
        kewarganegaraan =
          VALUES(kewarganegaraan),
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

    // ===============================
    // UPDATE PENGAJUAN
    // ===============================

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

    // ===============================
    // UPDATE DETAIL SKBNI
    // ===============================
    // Tabel ini hanya menyimpan
    // data khusus surat.

    await conn.query(
      `
      UPDATE beda_nama_identitas
      SET
        isi_keterangan = ?
      WHERE pengajuan_id = ?
      `,
      [
        isi_keterangan,
        id,
      ]
    );

    // ===============================
    // ACTIVITY LOG
    // ===============================

    await logActivity({
      pengajuanId:
        Number(id),

      status:
        "pending",

      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",

      conn,
    });

    // ===============================
    // COMMIT
    // ===============================

    await conn.commit();

    // File baru sudah aman tersimpan.
    newFilePath = null;

    // ===============================
    // HAPUS KTP LAMA
    // ===============================

    if (
      fileKtp &&
      fileKtp.size > 0 &&
      oldFile &&
      oldFile !== newFileName
    ) {
      oldFilePath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          oldFile
        );

      if (
        fs.existsSync(oldFilePath)
      ) {
        try {
          await unlink(
            oldFilePath
          );
        } catch (fileError) {
          console.error(
            "Gagal menghapus file KTP lama:",
            fileError
          );
        }
      }
    }

    // ===============================
    // RESPONSE
    // ===============================

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (err: any) {

    await conn.rollback();

    // ===============================
    // HAPUS FILE BARU JIKA GAGAL
    // ===============================

    if (newFilePath) {
      try {
        if (
          fs.existsSync(newFilePath)
        ) {
          await unlink(
            newFilePath
          );
        }
      } catch (fileError) {
        console.error(
          "Gagal menghapus file baru:",
          fileError
        );
      }
    }

    console.error(
      "ERROR UPDATE BEDA NAMA IDENTITAS:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ??
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