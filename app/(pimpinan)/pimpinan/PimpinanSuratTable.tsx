"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type SuratPersetujuanRow = {
  id: number;
  kode_tracking: string;
  nama: string | null;
  nama_surat: string | null;
  status: string;
  created_at: string;
};

export default function PimpinanSuratTable({
  surat,
}: {
  surat: SuratPersetujuanRow[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<{
    id: number;
    action: "acc" | "tolak";
  } | null>(null);

  const updatePersetujuan = async (
    id: number,
    action: "acc" | "tolak"
  ) => {
    const yakin =
      action === "acc"
        ? confirm("ACC surat ini dan tampilkan tanda tangan?")
        : confirm("Tolak surat ini?");

    if (!yakin) {
      return;
    }

    setLoading({ id, action });

    try {
      const res = await fetch(`/api/pimpinan/surat/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        alert("Gagal memproses surat");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("ERROR PERSETUJUAN:", error);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(null);
    }
  };

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
          minWidth: "900px",
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
                colSpan={6}
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                Tidak ada surat yang menunggu tanda tangan.
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
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
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
                    <Link href={`/pimpinan/preview/${item.id}`}>
                      <button style={outlineButtonStyle}>Preview</button>
                    </Link>
                    <button
                      onClick={() => updatePersetujuan(item.id, "acc")}
                      disabled={loading?.id === item.id}
                      style={{
                        ...actionButtonStyle,
                        backgroundColor: "#16a34a",
                        cursor:
                          loading?.id === item.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {loading?.id === item.id && loading.action === "acc"
                        ? "..."
                        : "ACC"}
                    </button>
                    <button
                      onClick={() => updatePersetujuan(item.id, "tolak")}
                      disabled={loading?.id === item.id}
                      style={{
                        ...actionButtonStyle,
                        backgroundColor: "#dc2626",
                        cursor:
                          loading?.id === item.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {loading?.id === item.id && loading.action === "tolak"
                        ? "..."
                        : "Tolak"}
                    </button>
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

const outlineButtonStyle = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "5px",
  backgroundColor: "white",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 600,
};

const actionButtonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "5px",
  color: "white",
  fontWeight: 700,
};

function formatTanggal(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
