"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type SuratRow = {
  id: number;
  kode_tracking: string;
  nama: string | null;
  nama_surat: string | null;
  nama_admin: string | null;
  status: string;
  created_at: string;
};

export default function AdminSuratTable({
  surat,
}: {
  surat: SuratRow[];
}) {
  const router = useRouter();

  const [loadingId, setLoadingId] =
    useState<number | null>(null);

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const approveSurat = async (
    id: number
  ) => {
    setLoadingId(id);

    try {
      const res = await fetch(
        `/api/admin/surat/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status:
              "menunggu_persetujuan",
          }),
        }
      );

      if (!res.ok) {
        alert("Gagal approve surat");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "ERROR APPROVE:",
        error
      );
      alert("Terjadi kesalahan");
    } finally {
      setLoadingId(null);
    }
  };

  const hapusSurat = async (
    id: number
  ) => {
    const yakin = confirm(
      "Yakin ingin menghapus surat ini?"
    );

    if (!yakin) return;

    setDeleteId(id);

    try {
      const res = await fetch(
        `/api/admin/surat/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        alert("Gagal menghapus surat");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "ERROR DELETE:",
        error
      );
      alert("Terjadi kesalahan");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="responsive-table-wrap">
      <table
        className="responsive-table"
        style={{
          borderCollapse: "collapse",
          minWidth: "920px",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f9fafb",
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
                Belum ada surat masuk.
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
                <Td label="Kode Tracking">
                  {item.kode_tracking}
                </Td>

                <Td label="Nama Pemohon">
                  {item.nama || "-"}
                </Td>

                <Td label="Jenis Surat">
                  {item.nama_surat || "-"}
                </Td>

                <Td label="Status">
                  <span
                    style={{
                      display:
                        "inline-block",
                      padding: "5px 10px",
                      borderRadius:
                        "999px",
                      backgroundColor:
                        item.status === "selesai"
                          ? "#DCFCE7"
                          : item.status === "menunggu_persetujuan"
                          ? "#DBEAFE"
                          : item.status === "ditolak"
                          ? "#FEE2E2"
                          : item.status === "draft"
                          ? "#F3F4F6"
                          : "#FEF3C7",

                      color:
                        item.status === "selesai"
                          ? "#166534"
                          : item.status === "menunggu_persetujuan"
                          ? "#1E40AF"
                          : item.status === "ditolak"
                          ? "#B91C1C"
                          : item.status === "draft"
                          ? "#4B5563"
                          : "#92400E",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {item.status}
                  </span>
                </Td>

                <Td label="Tanggal">
                  <div>{formatTanggal(item.created_at)}</div>

                  {item.nama_admin && (
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginTop: "4px",
                      }}
                    >
                      oleh {item.nama_admin}
                    </div>
                  )}
                </Td>

                <Td label="Aksi">
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <ActionLink
                      href={`/admin/surat/${item.id}`}
                      label="Lihat"
                    />

                    {/* Edit hanya selain status selesai */}
                    {item.status !==
                      "selesai" && (
                      <ActionLink
                        href={`/admin/surat/${item.id}/edit`}
                        label="Edit"
                      />
                    )}

                    <ActionLink
                      href={`/admin/preview/${item.id}`}
                      label="Preview"
                    />

                    {/* Hapus hanya selain status selesai */}
                    {item.status !==
                      "selesai" && (
                      <button
                        onClick={() =>
                          hapusSurat(
                            item.id
                          )
                        }
                        disabled={
                          deleteId ===
                          item.id
                        }
                        style={{
                          padding:
                            "8px 10px",
                          border: "none",
                          borderRadius:
                            "5px",
                          backgroundColor:
                            "#dc2626",
                          color: "white",
                          cursor:
                            deleteId ===
                            item.id
                              ? "not-allowed"
                              : "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {deleteId ===
                        item.id
                          ? "..."
                          : "Hapus"}
                      </button>
                    )}
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
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}

function ActionLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link href={href}>
      <button
        style={{
          padding: "8px 10px",
          border:
            "1px solid #d1d5db",
          borderRadius: "5px",
          backgroundColor: "white",
          color: "#111827",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {label}
      </button>
    </Link>
  );
}

function formatTanggal(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}