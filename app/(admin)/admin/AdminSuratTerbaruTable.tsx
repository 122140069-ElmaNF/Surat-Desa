import Link from "next/link";

type Props = {
  data: any[];
};

export default function AdminSuratTerbaruTable({
  data,
}: Props) {
  return (
    <section style={{ marginTop: "28px" }}>
      <div
        className="page-header"
        style={{ marginBottom: "14px" }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              color: "#111827",
            }}
          >
            Surat Masuk Terbaru
          </h2>

          <p
            className="page-subtitle"
            style={{ marginTop: "6px" }}
          >
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

      <div className="responsive-table-wrap">
        <table
          className="responsive-table"
          style={{
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
            {data.length === 0 ? (
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
              data.map((surat) => (
                <tr
                  key={surat.id}
                  style={{
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <TableCell label="Kode Tracking">
                    {surat.kode_tracking}
                  </TableCell>

                  <TableCell label="Nama Pemohon">
                    {surat.nama || "-"}
                  </TableCell>

                  <TableCell label="Jenis Surat">
                    {surat.nama_surat || "-"}
                  </TableCell>

                  <TableCell label="Status">
                    <StatusBadge
                      status={surat.status}
                    />
                  </TableCell>

                  <TableCell label="Tanggal">
                    {formatTanggal(
                      surat.created_at
                    )}
                  </TableCell>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
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

function TableCell({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <td
      data-label={label}
      style={{
        padding: "14px",
        color: "#111827",
      }}
    >
      {children}
    </td>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const isSelesai =
    status === "selesai";

  const isMenunggu =
    status ===
    "menunggu tanda tangan";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "999px",
        backgroundColor: isSelesai
          ? "#dcfce7"
          : isMenunggu
          ? "#dbeafe"
          : "#fef3c7",
        color: isSelesai
          ? "#166534"
          : isMenunggu
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

function formatTanggal(
  value: string
) {
  return new Date(value).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}