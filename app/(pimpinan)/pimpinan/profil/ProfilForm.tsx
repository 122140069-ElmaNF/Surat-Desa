"use client";

import { useState } from "react";

type Props = {
  jabatan?: string;
  nama_kepala_desa?: string;
  tanda_tangan?: string | null;
};

export default function ProfilForm({
  jabatan,
  nama_kepala_desa,
  tanda_tangan,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const formData = new FormData(
        e.currentTarget
      );

      const res = await fetch(
        "/api/pimpinan/profil",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Gagal menyimpan profil."
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
    <form
      onSubmit={handleSubmit}
    >
      {/* Jabatan */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <label
          style={labelStyle}
        >
          Jabatan
        </label>

        <input
          type="text"
          name="jabatan"
          defaultValue={
            jabatan || ""
          }
          placeholder="Masukkan jabatan"
          style={inputStyle}
          required
        />
      </div>

      {/* Nama Kepala Desa */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <label
          style={labelStyle}
        >
          Nama Kepala Desa
        </label>

        <input
          type="text"
          name="nama_kepala_desa"
          defaultValue={
            nama_kepala_desa ||
            ""
          }
          placeholder="Masukkan nama kepala desa"
          style={inputStyle}
          required
        />
      </div>

      {/* Preview TTD */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <label
          style={labelStyle}
        >
          Tanda Tangan Saat Ini
        </label>

        {tanda_tangan ? (
          <img
            src={tanda_tangan}
            alt="Tanda tangan"
            style={{
              maxWidth:
                "250px",
              maxHeight:
                "120px",
              objectFit:
                "contain",
              border:
                "1px solid #e5e7eb",
              borderRadius:
                "10px",
              padding: "10px",
              background:
                "white",
            }}
          />
        ) : (
          <div
            style={{
              padding:
                "14px",
              border:
                "1px dashed #d1d5db",
              borderRadius:
                "10px",
              color:
                "#6b7280",
            }}
          >
            Belum ada tanda
            tangan.
          </div>
        )}
      </div>

      {/* Upload TTD */}
      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <label
          style={labelStyle}
        >
          Upload Tanda Tangan
          Baru
        </label>

        <input
          type="file"
          name="tanda_tangan"
          accept="image/*"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding:
            "12px 22px",
          border: "none",
          borderRadius:
            "10px",
          background:
            loading
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
          : "Simpan Profil"}
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

const inputStyle = {
  width: "100%",
  padding: "12px",
  border:
    "1px solid #d1d5db",
  borderRadius: "10px",
  outline: "none",
};