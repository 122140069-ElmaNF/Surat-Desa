"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function TolakSuratPage() {
  const router = useRouter();

  const { id } = useParams<{
    id: string;
  }>();

  const [alasan, setAlasan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!alasan.trim()) {
      toast.warning("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/surat/${id}/tolak`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alasan,
          }),
        }
      );

      const result = await res.json();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Surat berhasil ditolak.");

      router.push("/admin/surat");
    } catch (err) {
      console.error(err);

      toast.error("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            Tolak Surat
          </h1>

          <p className="page-subtitle">
            Berikan alasan penolakan pengajuan surat.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}

      <div className="breadcrumb">
        <span>Detail Surat</span>
        <span>›</span>
        <strong>Tolak Surat</strong>
      </div>

      {/* Card */}

      <section className="card">

        <div className="form-group">

          <label className="form-label">
            Keterangan Penolakan
          </label>

          <textarea
            className="reject-textarea"
            placeholder="Tuliskan alasan mengapa surat ditolak..."
            value={alasan}
            rows={6}
            maxLength={500}
            onChange={(e) =>
              setAlasan(e.target.value)
            }
          />

          <small className="helper-text">
            Jelaskan alasan penolakan agar pemohon
            mengetahui apa yang perlu diperbaiki.
          </small>

        </div>

        <div className="form-action">

          <Link href={`/admin/surat/${id}`}>

            <button
              type="button"
              className="secondary-btn"
              disabled={loading}
            >
              Batal
            </button>

          </Link>

          <button
            type="button"
            className="danger-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Mengirim..."
              : "Kirim Penolakan"}
          </button>

        </div>

      </section>

    </div>
  );
}