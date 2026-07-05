import db from "@/lib/db";
import AdminDashboardStats from "./AdminDashboardStats";
import AdminSuratTerbaruTable from "./AdminSuratTerbaruTable";

export default async function AdminDashboardPage() {
  const [rows] = await db.query(`
    SELECT
      COUNT(*) AS total_surat,
      SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS surat_hari_ini,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS selesai
    FROM pengajuan_surat
  `);

  const data = (rows as any[])[0];

  const [suratTerbaru] = await db.query(`
    SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      ps.created_at,
      js.nama_surat,
      '-' AS nama
    FROM pengajuan_surat ps
    LEFT JOIN jenis_surat js
      ON js.id = ps.jenis_surat_id
    ORDER BY ps.created_at DESC
    LIMIT 3
  `);

  return (
    <div>
      <AdminDashboardStats data={data} />

      <AdminSuratTerbaruTable
        data={suratTerbaru as any[]}
      />
    </div>
  );
}