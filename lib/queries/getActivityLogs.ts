import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface ActivityLog extends RowDataPacket {
  id: number;
  status: string;
  aktivitas: string;
  visible_to_user: number;
  created_at: Date;
  nama: string | null;
  role: string | null;
}

export async function getActivityLogs(
  pengajuanId: number | string,
  publicOnly = false
) {
  let query = `
    SELECT
      sal.id,
      sal.status,
      sal.aktivitas,
      sal.visible_to_user,
      sal.created_at,
      u.nama,
      u.role
    FROM surat_activity_logs sal
    LEFT JOIN users u
      ON u.id = sal.user_id
    WHERE sal.pengajuan_id = ?
  `;

  if (publicOnly) {
    query += `
      AND sal.visible_to_user = 1
    `;
  }

  query += `
    ORDER BY sal.created_at ASC
  `;

  const [rows] = await db.query<ActivityLog[]>(
    query,
    [pengajuanId]
  );

  return rows;
}