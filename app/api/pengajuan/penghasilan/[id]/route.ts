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

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    const { id } = await params;

    const formData = await request.formData();

    // Kepala Keluarga
    const nama_kepala_keluarga =
      formData.get("nama_kepala_keluarga") as string;

    const ttl_kepala_keluarga =
      formData.get("ttl_kepala_keluarga") as string;

    const nik_kepala_keluarga =
      formData.get("nik_kepala_keluarga") as string;

    const jenis_kelamin_kepala_keluarga =
      formData.get("jenis_kelamin_kepala_keluarga") as string;

    const kewarganegaraan_kepala_keluarga =
      formData.get("kewarganegaraan_kepala_keluarga") as string;

    const agama_kepala_keluarga =
      formData.get("agama_kepala_keluarga") as string;

    const pekerjaan_kepala_keluarga =
      formData.get("pekerjaan_kepala_keluarga") as string;

    const alamat_kepala_keluarga =
      formData.get("alamat_kepala_keluarga") as string;

    // Anak
    const nama_anak =
      formData.get("nama_anak") as string;

    const ttl_anak =
      formData.get("ttl_anak") as string;

    const nik_anak =
      formData.get("nik_anak") as string;

    const jenis_kelamin_anak =
      formData.get("jenis_kelamin_anak") as string;

    const kewarganegaraan_anak =
      formData.get("kewarganegaraan_anak") as string;

    const agama_anak =
      formData.get("agama_anak") as string;

    const pekerjaan_anak =
      formData.get("pekerjaan_anak") as string;

    const alamat_anak =
      formData.get("alamat_anak") as string;

    const penghasilan =
      formData.get("penghasilan") as string;

    const fileKtp =
      formData.get("file_ktp") as File | null;

    // Ambil Data Lama
    const [rows]: any =
      await conn.query(
        `
        SELECT *
        FROM penghasilan
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

    let fileName =
      rows[0].file_ktp;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    const maxSize =
      5 * 1024 * 1024;

    // Upload File Baru
    if (fileKtp) {

      if (
        !allowedTypes.includes(fileKtp.type)
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "File harus JPG atau PNG.",
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
              "Ukuran file maksimal 5 MB.",
          },
          {
            status: 400,
          }
        );

      }

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase();

      fileName =
        `${randomUUID()}.${ext}`;

      await writeFile(

        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          fileName
        ),

        Buffer.from(
          await fileKtp.arrayBuffer()
        )

      );

    }

    // Update Penghasilan
    await conn.query(
      `
      UPDATE penghasilan
      SET

      nama_kepala_keluarga=?,
      ttl_kepala_keluarga=?,
      nik_kepala_keluarga=?,
      jenis_kelamin_kepala_keluarga=?,
      kewarganegaraan_kepala_keluarga=?,
      agama_kepala_keluarga=?,
      pekerjaan_kepala_keluarga=?,
      alamat_kepala_keluarga=?,

      nama_anak=?,
      ttl_anak=?,
      nik_anak=?,
      jenis_kelamin_anak=?,
      kewarganegaraan_anak=?,
      agama_anak=?,
      pekerjaan_anak=?,
      alamat_anak=?,

      penghasilan=?,
      file_ktp=?

      WHERE pengajuan_id=?
      `,
      [

        nama_kepala_keluarga,
        ttl_kepala_keluarga,
        nik_kepala_keluarga,
        jenis_kelamin_kepala_keluarga,
        kewarganegaraan_kepala_keluarga,
        agama_kepala_keluarga,
        pekerjaan_kepala_keluarga,
        alamat_kepala_keluarga,

        nama_anak,
        ttl_anak,
        nik_anak,
        jenis_kelamin_anak,
        kewarganegaraan_anak,
        agama_anak,
        pekerjaan_anak,
        alamat_anak,

        penghasilan,
        fileName,

        id,

      ]
    );

    // Reset Status
    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        status='pending',
        alasan_penolakan=NULL
      WHERE id=?
      `,
      [id]
    );

    await logActivity({
  pengajuanId: Number(id),
  status: "pending",
  aktivitas: "Pemohon mengirim perbaikan pengajuan.",
});

    await conn.commit();
    
    return NextResponse.json({

      success: true,

      message:
        "Pengajuan berhasil diperbarui.",

    });

  } catch (error) {

    await conn.rollback();

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