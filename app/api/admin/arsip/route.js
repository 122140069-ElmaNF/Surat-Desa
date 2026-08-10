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

    // =========================================
    // AMBIL DATA ARSIP
    // =========================================

    const [rows] = await db.query(`
      SELECT
        ps.id,
        ps.kode_tracking,
        ps.status,
        ps.created_at,
        ps.nama_penandatangan,
        js.nama_surat,
        js.kode_surat

      FROM pengajuan_surat ps

      JOIN jenis_surat js
        ON js.id = ps.jenis_surat_id

      WHERE ps.status = 'selesai'

      ORDER BY ps.created_at DESC
    `);

    // =========================================
    // TAMBAHKAN NAMA PEMOHON
    // =========================================

    let data = await Promise.all(
      rows.map(async (item) => ({
        ...item,

        nama: await getNamaPemohon(
          item.kode_surat,
          item.id
        ),
      }))
    );

    // =========================================
    // SEARCH
    // =========================================

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

    console.log(
      "SEARCH ARSIP ADMIN:",
      q
    );

    console.log(
      "HASIL ARSIP ADMIN:",
      data.map((item) => ({
        id: item.id,
        nama: item.nama,
        nama_surat: item.nama_surat,
        nama_penandatangan:
          item.nama_penandatangan,
      }))
    );

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
      "ERROR API ADMIN ARSIP:",
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