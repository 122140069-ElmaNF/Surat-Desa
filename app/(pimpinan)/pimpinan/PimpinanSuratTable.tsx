"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
    // =========================================
    // KONFIRMASI
    // =========================================

    const yakin =
      action === "acc"
        ? confirm(
            "ACC surat ini dan tampilkan tanda tangan?"
          )
        : confirm(
            "Tolak surat ini?"
          );

    if (!yakin) {
      return;
    }

    setLoading({
      id,
      action,
    });

    try {
      // =========================================
      // REQUEST KE API
      // =========================================

      const res = await fetch(
        `/api/pimpinan/surat/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      // =========================================
      // AMBIL RESPONSE JSON
      // =========================================

      const result = await res.json();

      // =========================================
      // JIKA GAGAL
      // TAMPILKAN PESAN DARI BACKEND
      // =========================================

      if (!res.ok) {
        toast.error(
          result.message ||
            "Gagal memproses surat."
        );

        return;
      }

      // =========================================
      // JIKA BERHASIL ACC
      // =========================================

      if (action === "acc") {
        toast.success(
          "Surat berhasil disetujui."
        );

        router.push(
          `/pimpinan/preview/${id}`
        );

        return;
      }

      // =========================================
      // JIKA BERHASIL TOLAK
      // =========================================

      toast.success(
        "Surat berhasil ditolak."
      );

      router.refresh();

    } catch (error) {
      console.error(
        "ERROR PERSETUJUAN:",
        error
      );

      toast.error(
        "Terjadi kesalahan saat memproses surat."
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="responsive-table-wrap">
      <table
        className="responsive-table"
        style={{
          minWidth: "900px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor:
                "#f9fafb",
            }}
          >
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
                Tidak ada surat yang
                menunggu persetujuan.
              </td>
            </tr>
          ) : (
            surat.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderTop:
                    "1px solid #e5e7eb",
                }}
              >
                {/* KODE TRACKING */}

                <Td label="Kode Tracking">
                  {item.kode_tracking}
                </Td>

                {/* NAMA PEMOHON */}

                <Td label="Nama Pemohon">
                  {item.nama || "-"}
                </Td>

                {/* JENIS SURAT */}

                <Td label="Jenis Surat">
                  {item.nama_surat || "-"}
                </Td>

                {/* STATUS */}

                <Td label="Status">
                  <span
                    style={{
                      display:
                        "inline-block",
                      padding:
                        "5px 10px",
                      borderRadius:
                        "999px",
                      backgroundColor:
                        "#dbeafe",
                      color:
                        "#1e40af",
                      fontSize:
                        "13px",
                      fontWeight: 700,
                    }}
                  >
                    {item.status}
                  </span>
                </Td>

                {/* TANGGAL */}

                <Td label="Tanggal">
                  {formatTanggal(
                    item.created_at
                  )}
                </Td>

                {/* AKSI */}

                <Td label="Aksi">
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    {/* PREVIEW */}

                    <Link
                      href={`/pimpinan/preview/${item.id}`}
                    >
                      <button
                        style={
                          outlineButtonStyle
                        }
                      >
                        Preview
                      </button>
                    </Link>

                    {/* ACC */}

                    <button
                      onClick={() =>
                        updatePersetujuan(
                          item.id,
                          "acc"
                        )
                      }
                      disabled={
                        loading?.id ===
                        item.id
                      }
                      style={{
                        ...actionButtonStyle,
                        backgroundColor:
                          "#16a34a",
                        cursor:
                          loading?.id ===
                          item.id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {loading?.id ===
                        item.id &&
                      loading.action ===
                        "acc"
                        ? "..."
                        : "ACC"}
                    </button>

                    {/* TOLAK */}

                    <button
                      onClick={() =>
                        updatePersetujuan(
                          item.id,
                          "tolak"
                        )
                      }
                      disabled={
                        loading?.id ===
                        item.id
                      }
                      style={{
                        ...actionButtonStyle,
                        backgroundColor:
                          "#dc2626",
                        cursor:
                          loading?.id ===
                          item.id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {loading?.id ===
                        item.id &&
                      loading.action ===
                        "tolak"
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

// =========================================
// TABLE HEADER
// =========================================

function Th({
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
        borderBottom:
          "1px solid #e5e7eb",
      }}
    >
      {children}
    </th>
  );
}

// =========================================
// TABLE DATA
// =========================================

function Td({
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
        verticalAlign:
          "top",
      }}
    >
      {children}
    </td>
  );
}

// =========================================
// STYLE
// =========================================

const outlineButtonStyle = {
  padding: "8px 10px",
  border:
    "1px solid #d1d5db",
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

// =========================================
// FORMAT TANGGAL
// =========================================

function formatTanggal(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
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