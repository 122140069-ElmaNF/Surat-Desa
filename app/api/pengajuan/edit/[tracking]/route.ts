import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

type Props = {
  params: Promise<{
    tracking: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Props
) {
  try {
    const { tracking } = await params;

    // Cari pengajuan berdasarkan kode tracking
    const [pengajuanRows]: any = await db.query(
      `
      SELECT
        id,
        jenis_surat_id,
        status
      FROM pengajuan_surat
      WHERE kode_tracking = ?
      LIMIT 1
      `,
      [tracking]
    );

    if (pengajuanRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengajuan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const pengajuan = pengajuanRows[0];

    // Hanya boleh diedit jika status ditolak
    if (pengajuan.status !== "ditolak") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pengajuan ini tidak dapat diperbaiki.",
        },
        {
          status: 400,
        }
      );
    }

    // Ambil seluruh field beserta nilainya
    const [fields]: any = await db.query(
      `
      SELECT
        fs.id,
        fs.nama_field,
        fs.label_field,
        dp.value
      FROM field_surat fs
      LEFT JOIN detail_pengajuan dp
        ON dp.field_id = fs.id
       AND dp.pengajuan_id = ?
      WHERE fs.jenis_surat_id = ?
      ORDER BY fs.id
      `,
      [
        pengajuan.id,
        pengajuan.jenis_surat_id,
      ]
    );

    return NextResponse.json({
      success: true,

      jenis_surat_id:
        pengajuan.jenis_surat_id,

      fields,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: Props
) {
  try {

    const { tracking } = await params;

    const body = await req.json();

    const {
      fields,
    } = body;

    // Cari pengajuan
    const [rows]: any = await db.query(
      `
      SELECT id
      FROM pengajuan_surat
      WHERE kode_tracking = ?
      LIMIT 1
      `,
      [tracking]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pengajuan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const pengajuanId = rows[0].id;

    // Update seluruh field
    for (const item of fields) {

      await db.query(
        `
        UPDATE detail_pengajuan
        SET value = ?
        WHERE pengajuan_id = ?
          AND field_id = ?
        `,
        [
          item.value,
          pengajuanId,
          item.field_id,
        ]
      );

    }

    // Kembalikan menjadi pending
    await db.query(
      `
      UPDATE pengajuan_surat
      SET
        status = 'pending',
        alasan_penolakan = NULL
      WHERE id = ?
      `,
      [pengajuanId]
    );

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      {
        status: 500,
      }
    );

  }
}