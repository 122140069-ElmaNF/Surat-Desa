import db from "@/lib/db";

type ActivityParams = {
  pengajuanId: number;
  userId?: number | null;
  status: string;
  aktivitas: string;
  visibleToUser?: boolean;
  conn?: any;
};

export async function logActivity({
  pengajuanId,
  userId = null,
  status,
  aktivitas,
  visibleToUser = true,
  conn,
}: ActivityParams) {

  const executor = conn ?? db;

  await executor.query(
    `
    INSERT INTO surat_activity_logs
    (
      pengajuan_id,
      user_id,
      status,
      aktivitas,
      visible_to_user
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      pengajuanId,
      userId,
      status,
      aktivitas,
      visibleToUser ? 1 : 0,
    ]
  );
}