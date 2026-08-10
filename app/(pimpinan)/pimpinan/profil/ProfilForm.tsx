"use client";

import { useState } from "react";

type Props = {
  nama: string;
  jabatan: string;
  periode?: string | null;
  tanda_tangan?: string | null;
};

export default function ProfilForm({
  nama,
  jabatan,
  periode,
  tanda_tangan,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const res = await fetch(
        "/api/pimpinan/profil",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Gagal menyimpan tanda tangan."
        );
      }

      alert(data.message);

      window.location.reload();
    } catch (error: any) {
      alert(
        error.message ||
          "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Jabatan */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <label style={labelStyle}>
          Jabatan
        </label>

        <div style={displayStyle}>
          {jabatan || "-"}
        </div>
      </div>

      {/* Periode Jabatan */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <label style={labelStyle}>
          Periode Jabatan
        </label>

        <div style={displayStyle}>
          {periode || "-"}
        </div>
      </div>

      {/* Nama Kepala Desa */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <label style={labelStyle}>
          Nama Kepala Desa
        </label>

        <div style={displayStyle}>
          {nama || "-"}
        </div>
      </div>

      {/* Tanda Tangan Saat Ini */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <label style={labelStyle}>
          Tanda Tangan Saat Ini
        </label>

        {tanda_tangan ? (
          <img
            src={tanda_tangan}
            alt="Tanda tangan Kepala Desa"
            style={{
              maxWidth: "250px",
              maxHeight: "120px",
              objectFit: "contain",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "10px",
              background: "white",
            }}
          />
        ) : (
          <div
            style={{
              padding: "14px",
              border: "1px dashed #d1d5db",
              borderRadius: "10px",
              color: "#6b7280",
            }}
          >
            Belum ada tanda tangan.
          </div>
        )}
      </div>

      {/* Upload TTD */}
      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <label style={labelStyle}>
          Upload Tanda Tangan Baru
        </label>

        <input
          type="file"
          name="tanda_tangan"
          accept="image/*"
        />
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px 22px",
          border: "none",
          borderRadius: "10px",
          background: loading
            ? "#93c5fd"
            : "#2563eb",
          color: "white",
          fontWeight: 600,
          cursor: loading
            ? "not-allowed"
            : "pointer",
        }}
      >
        {loading
          ? "Menyimpan..."
          : "Simpan Tanda Tangan"}
      </button>
    </form>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 600,
  color: "#374151",
};

const displayStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  backgroundColor: "#f9fafb",
  color: "#374151",
};