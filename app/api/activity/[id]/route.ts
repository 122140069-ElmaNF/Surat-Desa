import { NextResponse } from "next/server";
import db from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);

    const isPublic =
      searchParams.get("public") === "true";

    let query = `
      SELECT
        sal.id,
        sal.status,
        sal.aktivitas,
        sal.visible_to_user,
        sal.created_at,

        u.nama,
        u.role

      FROM surat_activity_logs sal

      LEFT JOIN users u
        ON u.id = sal.user_id

      WHERE sal.pengajuan_id = ?
    `;

    if (isPublic) {
      query += `
        AND sal.visible_to_user = 1
      `;
    }

    query += `
      ORDER BY sal.created_at ASC
    `;

    const [rows] = await db.query(query, [id]);

    return NextResponse.json({
      success: true,
      data: rows,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil riwayat aktivitas.",
      },
      {
        status: 500,
      }
    );
  }
}