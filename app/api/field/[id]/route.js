import db from "@/lib/db";

export async function GET(req, context) {
  const { id } = await context.params;

  const [rows] = await db.query(
    "SELECT * FROM field_surat WHERE jenis_surat_id = ?",
    [id]
  );

  return Response.json(rows);
}