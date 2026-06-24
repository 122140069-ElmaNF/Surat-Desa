"use client";

import { useState } from "react";
import { Search, FileText, User, Calendar } from "lucide-react";

export default function TrackingPage() {
  const [kode, setKode] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTracking = async () => {
    if (!kode) {
      alert("Masukkan kode tracking.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/tracking/${kode}`);
      const result = await res.json();

      if (res.ok) {
        setData(result.data);
      } else {
        alert(result.message || "Data tidak ditemukan.");
        setData(null);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
      setData(null);
    }

    setLoading(false);
  };

  return (
    <div className="tracking-page">
      {/* HERO */}
      <section className="tracking-hero">
        <div className="tracking-hero-content">
          <Search size={55} />

          <h1>Cek Status Pengajuan Surat</h1>

          <p>
            Masukkan kode tracking yang Anda
            peroleh setelah melakukan pengajuan surat.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="tracking-content">
        <div className="tracking-card">
          <h2>Kode Tracking</h2>

          <input
            type="text"
            placeholder="Contoh: SD-240626-0001"
            value={kode}
            onChange={(e) =>
              setKode(e.target.value)
            }
            className="tracking-input"
          />

          <button
            onClick={handleTracking}
            className="tracking-btn"
          >
            {loading
              ? "Memeriksa..."
              : "Cek Status"}
          </button>

          {data && (
            <div className="status-card">
              <div className="status-header">
                <FileText size={24} />
                <h3>Status Pengajuan</h3>
              </div>

              <div
                className={`status-badge ${
                  data.status === "selesai"
                    ? "status-selesai"
                    : data.status === "ditolak"
                    ? "status-ditolak"
                    : "status-pending"
                }`}
              >
                {data.status}
              </div>

              <div className="status-info">
                <p>
                  <strong>Jenis Surat :</strong>{" "}
                  {data.nama_surat}
                </p>

                <p>
                  <strong>Kode Tracking :</strong>{" "}
                  {data.kode_tracking}
                </p>

                <p>
                  <strong>Nama Pemohon :</strong>{" "}
                  {data.nama}
                </p>

                <p>
                  <strong>Tanggal Pengajuan :</strong>{" "}
                  {new Date(
                    data.created_at
                  ).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}