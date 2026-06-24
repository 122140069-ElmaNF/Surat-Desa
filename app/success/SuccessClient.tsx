"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  Copy,
  Search,
  FileText,
} from "lucide-react";

export default function SuccessClient({
  kode,
}: {
  kode: string;
}) {
  const router = useRouter();

  const copyKode = async () => {
    try {
      await navigator.clipboard.writeText(kode);
      alert("Kode tracking berhasil disalin.");
    } catch {
      alert("Gagal menyalin kode.");
    }
  };

  return (
    <div className="success-page">
      {/* HERO */}
      <section className="success-hero">
        <div className="success-hero-content">
          <div className="success-icon">
            <CheckCircle2 size={52} strokeWidth={2.5} />
          </div>

          <h1 className="success-title">
            Pengajuan Berhasil
          </h1>

          <p className="success-desc">
            Terima kasih. Pengajuan surat Anda telah berhasil
            dikirim.
          </p>

          <p className="success-desc">
            Simpan kode tracking berikut untuk memantau status
            pengajuan surat Anda.
          </p>
        </div>
      </section>

      {/* CARD */}
      <section className="success-content">
        <div className="success-card">
          <div className="tracking-icon">
            <FileText size={28} />
          </div>

          <h2>Kode Tracking Anda</h2>

          <div className="tracking-box">
            {kode}
          </div>

          <div className="success-actions">
            <button
              onClick={copyKode}
              className="primary-btn"
            >
              <Copy size={18} />
              <span>Salin Kode</span>
            </button>

            <button
              onClick={() =>
                router.push(
                  `/tracking?kode=${kode}`
                )
              }
              className="secondary-btn"
            >
              <Search size={18} />
              <span>Cek Status Surat</span>
            </button>
          </div>

          <div className="success-info">
            <div className="success-info-icon">
              <ShieldCheck size={28} />
            </div>

            <div>
              Simpan kode ini karena diperlukan untuk
              mengecek progres pengajuan surat dan
              mendownload dokumen.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}