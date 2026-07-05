import db from "@/lib/db";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    kode: string;
  }>;
};

const TABLE_MAP: Record<string, string> = {
  SD: "domisili",
  SKIK: "izin_keramaian",
  SKPA: "pindah_agama",
  SKL: "listrik",
  SKTM: "tidak_mampu",
  SKU: "usaha",
  SKJ: "jalan",
  SKH: "kehilangan",
  SKCK: "skck",
  SKKD: "kebenaran_data",
  SKBNI: "beda_nama_identitas",
  SKP: "kuasa_penuh",
  SKTBAPT: "tidak_berlangganan_air",
  SKPHS: "penghasilan",
  SKM: "kematian",
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { kode } = await context.params;

    const [rows] = await db.query(
      `
      SELECT
        ps.id,
        ps.kode_tracking,
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

    const table = TABLE_MAP[data.kode_surat];

    let namaPemohon = "-";

    if (table) {
      const [detailRows] = await db.query(
        `
        SELECT nama
        FROM ${table}
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [data.id]
      );

      const detail = detailRows as any[];

      if (detail.length > 0) {
        namaPemohon = detail[0].nama;
      }
    }

    return Response.json({
      success: true,
      data: {
        ...data,
        nama: namaPemohon,
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
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