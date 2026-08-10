"use client";

import { useState } from "react";
import PimpinanArsipTable, {
  ArsipSuratRow,
} from "./PimpinanArsipTable";

export default function SearchableArsip({
  initialRows,
}: {
  initialRows: ArsipSuratRow[];
}) {
  const [q, setQ] = useState("");
  const [rows, setRows] =
    useState<ArsipSuratRow[]>(initialRows);

  const [loading, setLoading] =
    useState(false);

  const isSearching =
    q.trim() !== "" || loading;

  async function handleSearch(
    e?: React.FormEvent
  ) {
    e?.preventDefault();

    setLoading(true);

    try {
      const params =
        new URLSearchParams();

      if (q.trim()) {
        params.set(
          "q",
          q.trim()
        );
      }

      const res = await fetch(
        `/api/pimpinan/arsip?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error(
          "Gagal mengambil data"
        );
      }

      const data =
        await res.json();

      setRows(data);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        {/* =========================
            SEARCH
        ========================= */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "450px",
            maxWidth: "100%",
          }}
        >
          <label
            style={{
              fontSize: "13px",
              color: isSearching
                ? "#000"
                : "#374151",
              marginBottom: "6px",
              fontWeight: 500,
            }}
          >
            Cari Nama Pemohon, Jenis Surat,
            atau Kepala Desa
          </label>

          <input
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
            placeholder="Masukkan nama pemohon, jenis surat, atau kepala desa"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border:
                "1px solid #d1d5db",
              outline: "none",
              fontSize: "14px",
              color: isSearching
                ? "#000"
                : undefined,
            }}
          />
        </div>

        {/* =========================
            BUTTON
        ========================= */}

        <div
          className="action-row"
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor:
                "#2563eb",
              color: "white",
              border: "none",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 700,
              transition: "0.2s",
            }}
          >
            {loading
              ? "Mencari..."
              : "Cari"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setQ("");
              setRows(initialRows);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor:
                "white",
              color: "#111827",
              border:
                "1px solid #d1d5db",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 700,
            }}
          >
            Reset
          </button>
        </div>
      </form>

      <PimpinanArsipTable
        surat={rows}
      />
    </div>
  );
}