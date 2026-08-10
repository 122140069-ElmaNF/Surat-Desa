import db from "@/lib/db";
import { getNamaPemohon } from "@/lib/surat/getNamaPemohon";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (
      searchParams.get("q") || ""
    ).toLowerCase();

    const [rows] = await db.query(`
      SELECT
        ps.id,
        ps.kode_tracking,
        ps.status,
        ps.created_at,
        ps.nomor_surat,
        ps.nama_penandatangan,

        js.nama_surat,
        js.kode_surat

      FROM pengajuan_surat ps

      JOIN jenis_surat js
        ON js.id = ps.jenis_surat_id

      WHERE ps.status = 'selesai'

      ORDER BY ps.created_at DESC
    `);

    let data = await Promise.all(
      rows.map(async (item) => ({
        ...item,

        nama: await getNamaPemohon(
          item.kode_surat,
          item.id
        ),
      }))
    );

    if (q) {
      data = data.filter(
        (item) =>
          item.nama
            ?.toLowerCase()
            .includes(q) ||

          item.nama_surat
            ?.toLowerCase()
            .includes(q) ||

          item.nama_penandatangan
            ?.toLowerCase()
            .includes(q)
      );
    }

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        error: "Server error",
      }),
      {
        status: 500,
      }
    );
  }
}