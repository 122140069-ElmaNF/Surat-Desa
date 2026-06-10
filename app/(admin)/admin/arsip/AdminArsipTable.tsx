import Link from "next/link";

export type ArsipSuratRow = {
  id: number;
  kode_tracking: string;
  nama: string | null;
  nama_surat: string | null;
  status: string;
  created_at: string;
};

export default function AdminArsipTable({ surat }: { surat: ArsipSuratRow[] }) {
  return (
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
          minWidth: "820px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
            <Th>Kode Tracking</Th>
            <Th>Nama Pemohon</Th>
            <Th>Jenis Surat</Th>
            <Th>Status</Th>
            <Th>Tanggal</Th>
            <Th>Aksi</Th>
          </tr>
        </thead>
        <tbody>
          {surat.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                Belum ada arsip surat selesai.
              </td>
            </tr>
          ) : (
            surat.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <Td>{item.kode_tracking}</Td>
                  <Td>{item.nama || "-"}</Td>
                  <Td>{item.nama_surat || "-"}</Td>
                  <Td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "5px 10px",
                        borderRadius: "999px",
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      {item.status}
                    </span>
                  </Td>
                  <Td>{formatTanggal(item.created_at)}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Link href={`/admin/preview/${item.id}?print=1`}>
                        <button
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "5px",
                            backgroundColor: "white",
                            color: "#111827",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Preview
                        </button>
                      </Link>
                    </div>
                  </Td>
                </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
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

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: "14px", color: "#111827", verticalAlign: "top" }}>
      {children}
    </td>
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
