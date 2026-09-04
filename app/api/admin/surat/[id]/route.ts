import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const TABLE_MAP: Record<string, string> = {
  SD: "domisili",
  SKIK: "izin_keramaian",
  STHT: "tafsiran_harga_tanah",
  SKL: "listrik",
  SKTM: "tidak_mampu",
  SKU: "usaha",
  SKJ: "jalan",
  SKH: "kehilangan",
  SKKD: "kebenaran_data",
  SKBNI: "beda_nama_identitas",
  SKTBAPT: "tidak_berlangganan_air",
  SKPHS: "penghasilan",
  SKM: "kematian",
};

export async function PATCH(
  req: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;

    const body = await req.json();

    const { isi_surat } = body;

    await db.query(
      `
      UPDATE pengajuan_surat
      SET isi_surat = ?
      WHERE id = ?
      `,
      [
        isi_surat,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );

  }
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  const conn = await db.getConnection();

  try {
    const { id } = await context.params;

    await conn.beginTransaction();

    const [rows]: any = await conn.query(
      `
      SELECT js.kode_surat
      FROM pengajuan_surat ps
      JOIN jenis_surat js
      ON ps.jenis_surat_id = js.id
      WHERE ps.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Surat tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const table =
      TABLE_MAP[rows[0].kode_surat];

    if (!table) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "Jenis surat tidak dikenali.",
        },
        {
          status: 400,
        }
      );
    }

    await conn.query(
      `DELETE FROM ${table} WHERE pengajuan_id = ?`,
      [id]
    );

    await conn.query(
      `
      DELETE FROM pengajuan_surat
      WHERE id = ?
      `,
      [id]
    );

    await conn.commit();

    return NextResponse.json({
      success: true,
      message: "Surat berhasil dihapus.",
    });

  } catch (err) {

    await conn.rollback();

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus surat.",
      },
      {
        status: 500,
      }
    );

  } finally {

    conn.release();

  }
}