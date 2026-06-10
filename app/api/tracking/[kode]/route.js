import db from "@/lib/db";

export async function GET(req, context) {
  const { kode } = await context.params;

  const [rows] = await db.query(
    `SELECT
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
    WHERE ps.kode_tracking = ?
    LIMIT 1`,
    [kode]
  );

  if (rows.length === 0) {
    return Response.json(
      {
        success: false,
        message: "Data tidak ditemukan",
      },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    data: rows[0],
  });
}
