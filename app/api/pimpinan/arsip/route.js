import db from "@/lib/db";
import { getNamaPemohon } from "@/lib/surat/getNamaPemohon";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (
      searchParams.get("q") || ""
    )
      .trim()
      .toLowerCase();

    const [rows] = await db.query(`
      SELECT
        ps.id,
        ps.kode_tracking,
        ps.status,

        COALESCE(
          (
            SELECT sal.created_at
            FROM surat_activity_logs sal
            WHERE sal.pengajuan_id = ps.id
              AND sal.status = 'selesai'
            ORDER BY sal.created_at DESC
            LIMIT 1
          ),
          ps.created_at
        ) AS created_at,

        ps.nomor_surat,
        ps.nama_penandatangan,

        js.nama_surat,
        js.kode_surat

      FROM pengajuan_surat ps

      JOIN jenis_surat js
        ON js.id = ps.jenis_surat_id

      WHERE ps.status = 'selesai'

      ORDER BY created_at DESC
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
      data = data.filter((item) => {
        const namaPemohon = String(
          item.nama ?? ""
        ).toLowerCase();

        const namaSurat = String(
          item.nama_surat ?? ""
        ).toLowerCase();

        const namaPenandatangan =
          String(
            item.nama_penandatangan ?? ""
          ).toLowerCase();

        return (
          namaPemohon.includes(q) ||
          namaSurat.includes(q) ||
          namaPenandatangan.includes(q)
        );
      });
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
    console.error(
      "ERROR API PIMPINAN ARSIP:",
      err
    );

    return new Response(
      JSON.stringify({
        error: "Server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  }
}