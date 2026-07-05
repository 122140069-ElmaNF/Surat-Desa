import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM jenis_surat
      ORDER BY id
    `);

    return Response.json({
      success: true,
      data: rows,
    });

  } catch (err) {
    console.error(err);

    return Response.json(
      {
        success: false,
        message: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}