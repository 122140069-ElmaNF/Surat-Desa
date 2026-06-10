import db from "@/lib/db";

export async function PATCH(req, context) {
  const { id } = await context.params;
  const body = await req.json();

  const status = body.action === "tolak" ? "ditolak" : "selesai";

  await db.query(
    `UPDATE pengajuan_surat
    SET status = ?
    WHERE id = ? AND status = 'menunggu tanda tangan'`,
    [status, id]
  );

  return Response.json({
    success: true,
    status,
  });
}
