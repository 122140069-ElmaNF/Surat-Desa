import db from "@/lib/db";

export async function PATCH(req, context) {
  const { id } = await context.params;
  const body = await req.json();

  const action = body.action;

  // ==========================
  // TOLAK
  // ==========================
  if (action === "tolak") {
    await db.query(
      `
      UPDATE pengajuan_surat
      SET status = 'ditolak'
      WHERE id = ?
      `,
      [id]
    );

    return Response.json({
      success: true,
      status: "ditolak",
    });
  }

  // ==========================
  // ACC
  // ==========================
  const [rows] = await db.query(
    `
    SELECT *
    FROM profil_pimpinan
    LIMIT 1
    `
  );

  const profil = rows[0];

  await db.query(
    `
    UPDATE pengajuan_surat
    SET
      status = 'selesai',
      nama_penandatangan = ?,
      jabatan_penandatangan = ?,
      file_ttd = ?
    WHERE id = ?
    `,
    [
      profil?.nama_kepala_desa ?? "",
      profil?.jabatan ?? "",
      profil?.tanda_tangan ?? null,
      id,
    ]
  );

  return Response.json({
    success: true,
    status: "selesai",
  });
}