import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM jenis_surat");
  return Response.json(rows);
}