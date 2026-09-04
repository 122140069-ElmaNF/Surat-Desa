import db from "@/lib/db";
import { NextRequest } from "next/server";
import { getActivityLogs } from "@/lib/queries/getActivityLogs";

type RouteContext = {
  params: Promise<{
    kode: string;
  }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { kode } = await context.params;

    // =========================================
    // Ambil data pengajuan
    // =========================================

    const [rows] = await db.query(
      `
      SELECT
        ps.id,
        ps.kode_tracking,
        ps.nik,
        ps.status,
        ps.alasan_penolakan,
        ps.created_at,

        js.nama_surat,
        js.kode_surat

      FROM pengajuan_surat ps

      JOIN jenis_surat js
        ON js.id = ps.jenis_surat_id

      WHERE ps.kode_tracking = ?

      LIMIT 1
      `,
      [kode]
    );

    const result = rows as any[];

    // =========================================
    // Jika data tidak ditemukan
    // =========================================

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Data tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const data = result[0];

    // =========================================
    // Ambil nama pemohon dari kependudukan
    // =========================================

    let namaPemohon = "-";

    if (data.nik) {
      const [pendudukRows] = await db.query(
        `
        SELECT nama
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [data.nik]
      );

      const penduduk =
        pendudukRows as any[];

      if (penduduk.length > 0) {
        namaPemohon =
          penduduk[0].nama ?? "-";
      }
    }

    // =========================================
    // Ambil activity log
    // =========================================

    const activities = await getActivityLogs(
      data.id,
      true
    );

    // =========================================
    // Response
    // =========================================

    return Response.json({
      success: true,
      data: {
        ...data,
        nama: namaPemohon,
        activities,
      },
    });
  } catch (error) {
    console.error(
      "ERROR TRACKING:",
      error
    );

    return Response.json(
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