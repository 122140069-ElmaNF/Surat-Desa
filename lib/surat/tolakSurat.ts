import db from "@/lib/db";

export default async function tolakSurat(
  id: number,
  alasan: string
) {
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

  return {
    success: true,
  };
}