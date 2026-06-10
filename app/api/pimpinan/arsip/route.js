import db from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    let sql = `SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      ps.created_at,
      js.nama_surat,
      (
        SELECT dp.value
        FROM detail_pengajuan dp
        JOIN field_surat fs ON fs.id = dp.field_id
        WHERE dp.pengajuan_id = ps.id
          AND fs.nama_field = 'nama'
        LIMIT 1
      ) AS nama
    FROM pengajuan_surat ps
    LEFT JOIN jenis_surat js ON js.id = ps.jenis_surat_id
    WHERE ps.status = 'selesai'`;

    const params = [];
    if (q) {
      sql += ` AND (
        (
          SELECT dp.value
          FROM detail_pengajuan dp
          JOIN field_surat fs ON fs.id = dp.field_id
          WHERE dp.pengajuan_id = ps.id
            AND fs.nama_field = 'nama'
          LIMIT 1
        ) LIKE ?
        OR js.nama_surat LIKE ?
      )`;
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += ` ORDER BY ps.created_at DESC`;

    const [rows] = await db.query(sql, params);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
