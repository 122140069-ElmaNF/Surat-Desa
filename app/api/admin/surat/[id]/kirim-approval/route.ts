import { NextResponse } from "next/server";
import db from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const [rows] = await db.query(
      `
      SELECT
        id,
        status,
        nomor_surat
      FROM pengajuan_surat
      WHERE id=?
      LIMIT 1
      `,
      [id]
    );

    const surat = (rows as any[])[0];

    if (!surat) {
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

    if (!surat.nomor_surat) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor surat belum dibuat.",
        },
        {
          status: 400,
        }
      );
    }

    if (surat.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Surat sudah diproses.",
        },
        {
          status: 400,
        }
      );
    }

    await db.query(
      `
      UPDATE pengajuan_surat
      SET
      nomor_surat=?,
        status='menunggu tanda tangan'
      WHERE id=?
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      message:
        "Berhasil dikirim ke Kepala Desa.",
    });

  } catch (error) {

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

  }
}