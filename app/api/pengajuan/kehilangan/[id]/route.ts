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

  let newUploadedFile:
    | string
    | null = null;

  let oldFileName:
    | string
    | null = null;

  let oldFilePath:
    | string
    | null = null;

  try {
    await conn.beginTransaction();

    const { id } =
      await context.params;

    const formData =
      await request.formData();

    // =====================================================
    // DATA KEPENDUDUKAN
    // =====================================================

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

    // =====================================================
    // DATA KHUSUS KEHILANGAN
    // =====================================================

    const barang_hilang =
      String(
        formData.get(
          "barang_hilang"
        ) ?? ""
      ).trim();

    // =====================================================
    // FILE KTP
    // =====================================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // =====================================================
    // VALIDASI
    // =====================================================

    if (!nik) {
      await conn.rollback();

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

    if (!nama) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Nama wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ttl) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Tempat dan tanggal lahir wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!agama) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Agama wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!jenis_kelamin) {
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

    if (!status_perkawinan) {
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

    if (!pekerjaan) {
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

    if (!alamat) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Alamat wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!dusun) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Dusun wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!rt) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "RT wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!rw) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "RW wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!kewarganegaraan) {
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

    if (!barang_hilang) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Barang yang hilang wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // AMBIL DATA PENGAJUAN
    // =====================================================

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
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Data pengajuan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const oldNik =
      pengajuanRows[0]?.nik ??
      null;

    // =====================================================
    // AMBIL FILE KTP DARI KEPENDUDUKAN
    // =====================================================

    if (oldNik) {
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

      if (
        pendudukRows.length > 0
      ) {
        oldFileName =
          pendudukRows[0]
            ?.file_ktp ?? null;
      }
    }

    let newFileName =
      oldFileName;

    // =====================================================
    // UPLOAD KTP BARU
    // =====================================================

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

      const maxSize =
        5 * 1024 * 1024;

      if (
        fileKtp.size > maxSize
      ) {
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

      // Simpan path file lama
      // untuk dihapus setelah commit
      if (
        oldFileName &&
        oldFileName !== newFileName
      ) {
        oldFilePath =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldFileName
          );
      }
    }

    // =====================================================
    // UPDATE / INSERT KEPENDUDUKAN
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

    // =====================================================
    // UPDATE PENGAJUAN SURAT
    // =====================================================

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

    // =====================================================
    // UPDATE DETAIL KEHILANGAN
    // =====================================================

    await conn.query(
      `
      UPDATE kehilangan
      SET
        barang_hilang = ?
      WHERE pengajuan_id = ?
      `,
      [
        barang_hilang,
        id,
      ]
    );

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    await logActivity({
      conn,
      pengajuanId:
        Number(id),
      status:
        "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
    });

    // =====================================================
    // COMMIT
    // =====================================================

    await conn.commit();

    // File baru sudah aman
    // di database
    newUploadedFile = null;

    // =====================================================
    // HAPUS FILE KTP LAMA
    // =====================================================

    if (
      oldFilePath &&
      oldFileName &&
      oldFileName !== newFileName
    ) {
      try {
        if (
          fs.existsSync(
            oldFilePath
          )
        ) {
          await unlink(
            oldFilePath
          );
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
    // =====================================================
    // ROLLBACK
    // =====================================================

    await conn.rollback();

    // =====================================================
    // HAPUS FILE BARU JIKA TRANSAKSI GAGAL
    // =====================================================

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
          fs.existsSync(
            newPath
          )
        ) {
          await unlink(
            newPath
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
      "PUT KEHILANGAN:",
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