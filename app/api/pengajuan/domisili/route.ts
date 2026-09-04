import db from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nik = searchParams.get("nik");

    if (!nik || !/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK harus terdiri dari 16 digit.",
        },
        {
          status: 400,
        }
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
        pekerjaan,
        alamat,
        dusun,
        rt,
        rw,
        file_ktp
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
        message: "Data penduduk belum terdaftar.",
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      data: rows[0],
    });

  } catch (error) {
    console.error("ERROR CEK NIK:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mencari data penduduk.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  let filePath: string | null = null;

  try {
    const formData = await request.formData();

    // ===============================
    // Ambil data dari form
    // ===============================

    const nama = formData.get("nama") as string;
    const ttl = formData.get("ttl") as string;
    const nik = formData.get("nik") as string;
    const agama = formData.get("agama") as string;
    const jenis_kelamin = formData.get("jenis_kelamin") as string;
    const pekerjaan = formData.get("pekerjaan") as string;
    const alamat = formData.get("alamat") as string;
    const dusun = formData.get("dusun") as string;
    const rt = formData.get("rt") as string;
    const rw = formData.get("rw") as string;

    const fileKtp = formData.get("file_ktp") as File | null;

    // ===============================
    // Validasi NIK
    // ===============================

    if (!nik || !/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK harus terdiri dari 16 digit.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // Validasi file KTP
    // ===============================

    if (!fileKtp) {
      return NextResponse.json(
        {
          success: false,
          message: "File KTP wajib diupload.",
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (fileKtp.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran file maksimal 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // Upload File KTP
    // ===============================

    const bytes = await fileKtp.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = fileKtp.name
      .split(".")
      .pop()
      ?.toLowerCase();

    const fileName = `${randomUUID()}.${ext}`;

    filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "ktp",
      fileName
    );

    await writeFile(filePath, buffer);

    // ===============================
    // Mulai Transaction
    // ===============================

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      // ===============================
      // Cek jenis surat
      // ===============================

      const [jenisRows]: any = await conn.query(
        `
        SELECT id, kode_surat
        FROM jenis_surat
        WHERE kode_surat = 'SD'
        LIMIT 1
        `
      );

      if (jenisRows.length === 0) {
        throw new Error(
          "Jenis surat Domisili tidak ditemukan."
        );
      }

      const kodeSurat = jenisRows[0].kode_surat;
      const jenisSuratId = jenisRows[0].id;

      // ===============================
      // Cek data penduduk
      // ===============================

      const [pendudukRows]: any = await conn.query(
        `
        SELECT nik
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

      // ===============================
      // Simpan / Update Data Penduduk
      // ===============================

      if (pendudukRows.length === 0) {
        // NIK belum ada → INSERT
        await conn.query(
          `
          INSERT INTO kependudukan
          (
            nik,
            nama,
            ttl,
            agama,
            jenis_kelamin,
            pekerjaan,
            alamat,
            dusun,
            rt,
            rw,
            file_ktp
          )
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            nik,
            nama,
            ttl,
            agama,
            jenis_kelamin,
            pekerjaan,
            alamat,
            dusun,
            rt,
            rw,
            fileName,
          ]
        );

      } else {
        // NIK sudah ada → UPDATE
        await conn.query(
          `
          UPDATE kependudukan
          SET
            nama = ?,
            ttl = ?,
            agama = ?,
            jenis_kelamin = ?,
            pekerjaan = ?,
            alamat = ?,
            dusun = ?,
            rt = ?,
            rw = ?,
            file_ktp = ?
          WHERE nik = ?
          `,
          [
            nama,
            ttl,
            agama,
            jenis_kelamin,
            pekerjaan,
            alamat,
            dusun,
            rt,
            rw,
            fileName,
            nik,
          ]
        );
      }

      // ===============================
      // Generate Tracking
      // ===============================

      const sekarang = new Date();

      const tanggal = `${String(
        sekarang.getDate()
      ).padStart(2, "0")}${String(
        sekarang.getMonth() + 1
      ).padStart(2, "0")}${String(
        sekarang.getFullYear()
      ).slice(-2)}`;

      const [countRows]: any = await conn.query(
        `
        SELECT COUNT(*) AS total
        FROM pengajuan_surat
        WHERE jenis_surat_id = ?
        `,
        [jenisSuratId]
      );

      const urut = String(
        Number(countRows[0].total) + 1
      ).padStart(4, "0");

      const kode_tracking =
        `${kodeSurat}-${tanggal}-${urut}`;

      // ===============================
      // Insert pengajuan_surat
      // ===============================

      const [result]: any = await conn.query(
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

      const pengajuan_id = result.insertId;

      // ===============================
      // Insert domisili
      // ===============================
      // file_ktp TIDAK lagi disimpan di sini.
      // Untuk sementara kolom file_ktp di tabel
      // domisili tetap dibiarkan ada karena belum
      // kita hapus dari database.

      await conn.query(
        `
        INSERT INTO domisili
        (
          pengajuan_id
        )
        VALUES
        (?)
        `,
        [pengajuan_id]
      );

      // ===============================
      // Log Activity
      // ===============================

      await logActivity({
        pengajuanId: pengajuan_id,
        status: "pending",
        aktivitas: "Pengajuan surat berhasil dikirim.",
        conn,
      });

      // ===============================
      // Commit
      // ===============================

      await conn.commit();

      return NextResponse.json({
        success: true,
        kode_tracking,
        message: "Pengajuan berhasil.",
      });

    } catch (error) {
      await conn.rollback();

      console.error(
        "ERROR API DOMISILI:",
        error
      );

      // Hapus file jika database gagal
      if (filePath) {
        try {
          await unlink(filePath);
        } catch (unlinkError) {
          console.error(
            "Gagal menghapus file:",
            unlinkError
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: "Terjadi kesalahan server.",
        },
        {
          status: 500,
        }
      );

    } finally {
      conn.release();
    }

  } catch (error) {
    console.error(
      "ERROR UPLOAD/API DOMISILI:",
      error
    );

    if (filePath) {
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        console.error(
          "Gagal menghapus file:",
          unlinkError
        );
      }
    }

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