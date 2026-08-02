import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { logActivity } from "@/lib/activity";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,
  { params }: Params
) {

  const conn =
    await db.getConnection();

  try {

    await conn.beginTransaction();

    const { id } =
      await params;

    const formData =
      await request.formData();

    const nama =
      formData.get("nama") as string;

    const ttl =
      formData.get("ttl") as string;

    const nik =
      formData.get("nik") as string;

    const jenis_kelamin =
      formData.get("jenis_kelamin") as string;

    const status_perkawinan =
      formData.get("status_perkawinan") as string;

    const alamat =
      formData.get("alamat") as string;

    const no_hp =
      formData.get("no_hp") as string;

    const nomor_porsi =
      formData.get("nomor_porsi") as string;

    const bin_binti =
      formData.get("bin_binti") as string;

    const fileKtp =
      formData.get("file_ktp") as File | null;

    const fileKk =
      formData.get("file_kk") as File | null;

    // ===========================
    // Ambil data lama
    // ===========================

    const [rows]: any =
      await conn.query(
        `
        SELECT *
        FROM kebenaran_data
        WHERE pengajuan_id = ?
        `,
        [id]
      );

    if (rows.length === 0) {

      return NextResponse.json(
        {
          success: false,
          message: "Data tidak ditemukan.",
        },
        {
          status: 404,
        }
      );

    }

    let fileKtpName =
      rows[0].file_ktp;

    let fileKkName =
      rows[0].file_kk;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    const maxSize =
      5 * 1024 * 1024;

      // ===========================
    // Upload KTP baru
    // ===========================

    if (fileKtp) {

      if (
        !allowedTypes.includes(fileKtp.type)
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "File KTP harus JPG atau PNG.",
          },
          {
            status: 400,
          }
        );

      }

      if (
        fileKtp.size > maxSize
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file KTP maksimal 5 MB.",
          },
          {
            status: 400,
          }
        );

      }

      const ext =
        fileKtp.name
          .split(".")
          .pop();

      fileKtpName =
        `${randomUUID()}.${ext}`;

      await writeFile(
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          fileKtpName
        ),
        Buffer.from(
          await fileKtp.arrayBuffer()
        )
      );

    }

    // ===========================
    // Upload KK baru
    // ===========================

    if (fileKk) {

      if (
        !allowedTypes.includes(fileKk.type)
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "File KK harus JPG atau PNG.",
          },
          {
            status: 400,
          }
        );

      }

      if (
        fileKk.size > maxSize
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file KK maksimal 5 MB.",
          },
          {
            status: 400,
          }
        );

      }

      const ext =
        fileKk.name
          .split(".")
          .pop();

      fileKkName =
        `${randomUUID()}.${ext}`;

      await writeFile(
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "kk",
          fileKkName
        ),
        Buffer.from(
          await fileKk.arrayBuffer()
        )
      );

    }

    // ===========================
    // Update Data Surat
    // ===========================

    await conn.query(
      `
      UPDATE kebenaran_data
      SET
        nama = ?,
        ttl = ?,
        nik = ?,
        jenis_kelamin = ?,
        status_perkawinan = ?,
        alamat = ?,
        no_hp = ?,
        nomor_porsi = ?,
        bin_binti = ?,
        file_ktp = ?,
        file_kk = ?
      WHERE pengajuan_id = ?
      `,
      [
        nama,
        ttl,
        nik,
        jenis_kelamin,
        status_perkawinan,
        alamat,
        no_hp,
        nomor_porsi,
        bin_binti,
        fileKtpName,
        fileKkName,
        id,
      ]
    );

      // ===========================
    // Reset Status Pengajuan
    // ===========================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        status = 'pending',
        alasan_penolakan = NULL
      WHERE id = ?
      `,
      [id]
    );

    // ===========================
    // Tambah Riwayat Aktivitas
    // ===========================

    await logActivity({
      pengajuanId: Number(id),
      status: "pending",
      aktivitas: "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // ===========================
    // Commit Transaction
    // ===========================

    await conn.commit();

    return NextResponse.json({
      success: true,
      message: "Pengajuan berhasil diperbarui.",
    });

    } catch (error) {

    await conn.rollback();

    console.error(error);

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

}