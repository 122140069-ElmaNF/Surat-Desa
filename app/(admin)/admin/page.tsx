import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";

type StatRow = RowDataPacket & {
  total_surat: number;
  surat_hari_ini: number;
  pending: number;
  selesai: number;
};

type SuratTerbaruRow = RowDataPacket & {
  id: number;
  kode_tracking: string;
  nama: string | null;
  nama_surat: string | null;
  status: string;
  created_at: string;
};

export default async function AdminDashboardPage() {
  const [rows] = await db.query<StatRow[]>(
    `SELECT
      COUNT(*) AS total_surat,
      SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS surat_hari_ini,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS selesai
    FROM pengajuan_surat`
  );

  const data = rows[0];

  const [suratTerbaru] = await db.query<SuratTerbaruRow[]>(
    `SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      ps.created_at,
      js.nama_surat,
      (
        SELECT dp.value
        FROM detail_pengajuan dp
        JOIN field_surat fs ON fs.id = dp.field_id
        WHERE dp.pengajuan_id = ps.id
          AND fs.nama_field = 'nama'
        LIMIT 1
      ) AS nama
    FROM pengajuan_surat ps
    LEFT JOIN jenis_surat js ON js.id = ps.jenis_surat_id
    ORDER BY ps.created_at DESC
    LIMIT 3`
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#111827" }}>
            Dashboard Admin
          </h1>
          <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
            Ringkasan pengajuan surat desa.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/admin/buat-surat">
            <button
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#16a34a",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Buat Surat
            </button>
          </Link>
          <Link href="/admin/surat">
            <button
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#2563eb",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Lihat Surat Masuk
            </button>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard title="Total Surat" value={data.total_surat || 0} />
        <StatCard title="Surat Hari Ini" value={data.surat_hari_ini || 0} />
        <StatCard title="Pending" value={data.pending || 0} />
        <StatCard title="Selesai" value={data.selesai || 0} />
      </div>

      <section style={{ marginTop: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "14px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: "#111827" }}>
              Surat Masuk Terbaru
            </h2>
            <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
              3 pengajuan terbaru yang masuk ke sistem.
            </p>
          </div>

          <Link href="/admin/surat">
            <button
              style={{
                padding: "9px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#111827",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Lihat Semua
            </button>
          </Link>
        </div>

        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflowX: "auto",
            boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "760px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <TableHead>Kode Tracking</TableHead>
                <TableHead>Nama Pemohon</TableHead>
                <TableHead>Jenis Surat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </tr>
            </thead>
            <tbody>
              {suratTerbaru.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "22px",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    Belum ada surat masuk.
                  </td>
                </tr>
              ) : (
                suratTerbaru.map((surat) => (
                  <tr key={surat.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <TableCell>{surat.kode_tracking}</TableCell>
                    <TableCell>{surat.nama || "-"}</TableCell>
                    <TableCell>{surat.nama_surat || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={surat.status} />
                    </TableCell>
                    <TableCell>{formatTanggal(surat.created_at)}</TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "22px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: 600 }}>
        {title}
      </div>
      <div
        style={{
          marginTop: "12px",
          color: "#111827",
          fontSize: "34px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: "14px",
        textAlign: "left",
        color: "#374151",
        fontSize: "14px",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "14px", color: "#111827" }}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const isSelesai = status === "selesai";
  const isMenungguTandaTangan = status === "menunggu tanda tangan";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "999px",
        backgroundColor: isSelesai
          ? "#dcfce7"
          : isMenungguTandaTangan
            ? "#dbeafe"
            : "#fef3c7",
        color: isSelesai
          ? "#166534"
          : isMenungguTandaTangan
            ? "#1e40af"
            : "#92400e",
        fontSize: "13px",
        fontWeight: 700,
      }}
    >
      {status}
    </span>
  );
}

function formatTanggal(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
