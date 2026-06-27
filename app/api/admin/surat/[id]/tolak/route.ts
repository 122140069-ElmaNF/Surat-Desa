import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: Props
) {
  try {

    const { id } = await params;

    const body = await req.json();

    const { alasan } = body;

    if (!alasan?.trim()) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Alasan penolakan wajib diisi.",
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
          status = 'ditolak',
          alasan_penolakan = ?
      WHERE id = ?
      `,
      [
        alasan.trim(),
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message:
        "Surat berhasil ditolak.",
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