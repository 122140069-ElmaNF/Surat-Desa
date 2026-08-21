"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import ActivityTimeline from "@/app/components/activity/ActivityTimeline";
import { Search, FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";

function TrackingContent() {
  const searchParams = useSearchParams();
  const kodeTracking = searchParams.get("kode");

  const [kode, setKode] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // CEK KODE TRACKING DARI URL
  // =========================================

  useEffect(() => {
    if (!kodeTracking) return;

    setKode(kodeTracking);
    setError("");

    const timer = setTimeout(() => {
      handleTracking(kodeTracking);
    }, 100);

    return () => clearTimeout(timer);
  }, [kodeTracking]);

  // =========================================
  // CEK STATUS TRACKING
  // =========================================

  async function handleTracking(
    kodeInput?: string
  ) {
    const kodeCari =
      kodeInput ?? kode;

    setError("");

    if (!kodeCari.trim()) {
      setError("Masukkan kode tracking.");
      setData(null);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/tracking/${kodeCari.trim()}`
      );

      const result = await res.json();

      if (res.ok) {
        setData(result.data);
        setError("");
      } else {
        setError(
          result.message ||
            "Data tidak ditemukan."
        );

        setData(null);
      }
    } catch (error) {
      console.error(error);

      setError(
        "Terjadi kesalahan. Silakan coba lagi."
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // FORMAT TANGGAL
  // =========================================

  const formatTanggalSingkat = (
    tanggal: string
  ) => {
    const hariSingkat = [
      "Min",
      "Sen",
      "Sel",
      "Rab",
      "Kam",
      "Jum",
      "Sab",
    ];

    const date = new Date(tanggal);

    const hari =
      hariSingkat[date.getDay()];

    const tanggalFormat =
      new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ).format(date);

    const jam =
      new Intl.DateTimeFormat(
        "id-ID",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      ).format(date);

    return `${hari}, ${tanggalFormat} • ${jam} WIB`;
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="tracking-page">

      {/* HERO */}

      <section className="tracking-hero">
        <div className="tracking-hero-content">

          <Search size={55} />

          <h1>
            Cek Status Pengajuan Surat
          </h1>

          <p>
            Masukkan kode tracking yang Anda
            peroleh setelah melakukan pengajuan
            surat.
          </p>

        </div>
      </section>

      {/* CONTENT */}

      <section className="tracking-content">
        <div className="tracking-card">

          <h2>
            Kode Tracking
          </h2>

          <input
            type="text"
            placeholder="Contoh: SD-240626-0001"
            value={kode}
            onChange={(e) => {
              setKode(e.target.value);
              setError("");
            }}
            className="tracking-input"
          />

          <div className="tracking-error-wrapper">
            {error && (
              <div className="tracking-error">

                <span className="tracking-error-icon">
                  ⚠
                </span>

                <span>
                  {error}
                </span>

              </div>
            )}
          </div>

          <button
            onClick={() =>
              handleTracking()
            }
            className="tracking-btn"
            disabled={loading}
          >
            {loading
              ? "Memeriksa..."
              : "Cek Status"}
          </button>

          {/* STATUS PENGAJUAN */}

          {data && (
            <div className="status-card">

              <div className="status-header">

                <FileText size={24} />

                <h3>
                  Status Pengajuan
                </h3>

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

                <div className="status-row">

                  <span className="status-label">
                    Jenis Surat
                  </span>

                  <span className="status-separator">
                    :
                  </span>

                  <span className="status-value">
                    {data.nama_surat}
                  </span>

                </div>

                <div className="status-row">

                  <span className="status-label">
                    Kode Tracking
                  </span>

                  <span className="status-separator">
                    :
                  </span>

                  <span className="status-value">
                    {data.kode_tracking}
                  </span>

                </div>

                <div className="status-row">

                  <span className="status-label">
                    Nama Pemohon
                  </span>

                  <span className="status-separator">
                    :
                  </span>

                  <span className="status-value">
                    {data.nama}
                  </span>

                </div>

                <div className="status-row">

                  <span className="status-label">
                    Waktu Pengajuan
                  </span>

                  <span className="status-separator">
                    :
                  </span>

                  <span className="status-value">
                    {formatTanggalSingkat(
                      data.created_at
                    )}
                  </span>

                </div>

              </div>

              {/* STATUS DITOLAK */}

              {data.status === "ditolak" && (
                <div className="tracking-reject-box">

                  <h4>
                    Alasan Penolakan
                  </h4>

                  <p>
                    {data.alasan_penolakan}
                  </p>

                  <button
                    className="tracking-btn"
                    onClick={() =>
                      window.location.href =
                        `/pengajuan/perbaiki/${data.id}`
                    }
                  >
                    Perbaiki Pengajuan
                  </button>

                </div>
              )}

              {/* STATUS SELESAI */}

              {data.status === "selesai" && (
                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "20px",
                    borderTop:
                      "1px solid #e5e7eb",
                  }}
                >

                  <button
                    className="tracking-btn"
                    onClick={() => {
                      window.location.href =
                        `/api/surat/${data.id}/download`;
                    }}
                  >
                    Download Surat PDF
                  </button>

                </div>
              )}

              {/* RIWAYAT AKTIVITAS */}

              {data.activities?.length > 0 && (
                <div
                  style={{
                    marginTop: "28px",
                  }}
                >

                  <ActivityTimeline
                    activities={
                      data.activities
                    }
                    showUserInfo={false}
                  />

                </div>
              )}

            </div>
          )}

        </div>
      </section>

    </div>
  );
}


// =========================================
// PAGE
// =========================================

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="tracking-page">
          <section className="tracking-content">
            <div className="tracking-card">
              Memuat halaman tracking...
            </div>
          </section>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}