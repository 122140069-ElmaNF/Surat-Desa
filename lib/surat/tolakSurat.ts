import db from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";

export default async function tolakSurat(
  id: number,
  alasan: string
) {

  const cookieStore = await cookies();

  const session = cookieStore.get("session");

  const currentUser = session
    ? JSON.parse(session.value)
    : null;

  await db.query(
    `
    UPDATE pengajuan_surat
    SET
      status='ditolak',
      alasan_penolakan=?,
      updated_at=NOW()
    WHERE id=?
    `,
    [alasan, id]
  );

  await logActivity({
  pengajuanId: id,
  userId: currentUser?.id,
  status: "ditolak",
  aktivitas: "Pengajuan surat ditolak oleh Admin.",
});

  return {
    success: true,
  };
}