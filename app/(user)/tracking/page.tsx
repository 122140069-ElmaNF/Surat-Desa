"use client";

import { useState } from "react";

type TrackingData = {
  kode_tracking: string;
  nama_surat: string | null;
  nama: string | null;
  status: string;
  created_at: string;
};

export default function TrackingPage() {
  const [kode, setKode] = useState("");
  const [data, setData] = useState<TrackingData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCari = async () => {
    const kodeTracking = kode.trim();

    if (!kodeTracking) {
      setData(null);
      setMessage("Masukkan kode tracking terlebih dahulu");
      return;
    }

    setLoading(true);
    setData(null);
    setMessage("");

    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(kodeTracking)}`);
      const result = await res.json();

      if (!res.ok) {
        setMessage("Data tidak ditemukan");
        return;
      }

      setData(result.data);
    } catch (error) {
      console.error("ERROR TRACKING:", error);
      setMessage("Terjadi kesalahan saat mencari data");
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (value: string) => {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "32px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            margin: "0 0 10px",
            color: "#111827",
            fontSize: "28px",
          }}
        >
          Tracking Surat
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            color: "#4b5563",
            lineHeight: "1.6",
          }}
        >
          Masukkan kode tracking untuk melihat status pengajuan surat Anda.
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Contoh: TRX-2026-0001"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCari();
              }
            }}
            style={{
              flex: 1,
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              color: "#111827",
              backgroundColor: "white",
              fontSize: "16px",
              outline: "none",
            }}
          />

          <button
            onClick={handleCari}
            disabled={loading}
            style={{
              padding: "12px 22px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: loading ? "#93c5fd" : "#2563eb",
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Mencari..." : "Cari"}
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "6px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}

        {data && (
          <div
            style={{
              marginTop: "24px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Hasil Tracking
            </div>

            <div style={{ padding: "18px" }}>
              <InfoRow label="Kode Tracking" value={data.kode_tracking} />
              <InfoRow label="Nama" value={data.nama || "-"} />
              <InfoRow label="Jenis Surat" value={data.nama_surat || "-"} />
              <InfoRow label="Status" value={data.status} />
              <InfoRow
                label="Tanggal Pengajuan"
                value={formatTanggal(data.created_at)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#111827", fontWeight: 600, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}
