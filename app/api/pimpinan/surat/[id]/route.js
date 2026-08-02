import db from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";

export async function PATCH(req, context) {
  const { id } = await context.params;
  const body = await req.json();

  const action = body.action;

  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const currentUser = session
    ? JSON.parse(session.value)
    : null;

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

    await logActivity({
      pengajuanId: Number(id),
      userId: currentUser?.id,
      status: "ditolak",
      aktivitas: "Pengajuan surat ditolak oleh Kepala Desa.",
    });

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

    await logActivity({
    pengajuanId: Number(id),
    userId: currentUser?.id,
    status: "selesai",
    aktivitas: "Surat telah disetujui oleh Kepala Desa.",
  });

  return Response.json({
    success: true,
    status: "selesai",
  });
}