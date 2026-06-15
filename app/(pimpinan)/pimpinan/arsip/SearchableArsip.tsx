"use client";

import { useState } from "react";
import PimpinanArsipTable, { ArsipSuratRow } from "./PimpinanArsipTable";

export default function SearchableArsip({
  initialRows,
}: {
  initialRows: ArsipSuratRow[];
}) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<ArsipSuratRow[]>(initialRows);
  const [loading, setLoading] = useState(false);
  const isSearching = q.trim() !== "" || loading;

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`/api/pimpinan/arsip?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
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
          marginBottom: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: "1 1 320px" }}>
          <label
            style={{
              fontSize: "13px",
              color: isSearching ? "#000" : "#374151",
              marginBottom: 6,
            }}
          >
            Cari Nama Pemohon atau Jenis Surat
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Masukkan nama pemohon atau jenis surat"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              color: isSearching ? "#000" : undefined,
            }}
          />
        </div>

        <div className="action-row" style={{ alignItems: "flex-end" }}>
          <button
            type="submit"
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              backgroundColor: "#111827",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
            disabled={loading}
          >
            {loading ? "Mencari..." : "Cari"}
          </button>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setRows(initialRows);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              backgroundColor: "white",
              color: "#111827",
              border: "1px solid #d1d5db",
              cursor: "pointer",
              fontWeight: 700,
            }}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>

      <PimpinanArsipTable surat={rows} />
    </div>
  );
}
