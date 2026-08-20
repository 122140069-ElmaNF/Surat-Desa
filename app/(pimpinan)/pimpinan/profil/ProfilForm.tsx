"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  UserRound,
  BriefcaseBusiness,
  CalendarDays,
  PenLine,
  Upload,
  FileImage,
  Save,
} from "lucide-react";

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
  const [fileName, setFileName] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const form = e.currentTarget;
    const fileInput = fileInputRef.current;

    if (!fileInput?.files?.length) {
      toast.error(
        "Silakan pilih tanda tangan baru terlebih dahulu."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(form);

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

      toast.success(
        data.message ||
          "Tanda tangan Kepala Desa berhasil disimpan."
      );

      setTimeout(() => {
        window.location.reload();
      }, 800);

    } catch (error: any) {
      toast.error(
        error.message ||
          "Terjadi kesalahan saat menyimpan tanda tangan."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FILE CHANGE
  // =====================================================

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      setFileName("");
      return;
    }

    setFileName(file.name);
  }

  // =====================================================
  // OPEN FILE PICKER
  // =====================================================

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* =====================================================
          INFORMASI KEPALA DESA
      ====================================================== */}

      <section className="profile-section">

        <div className="profile-section-header">
          <div className="profile-section-icon">
            <UserRound size={21} />
          </div>

          <div>
            <h2>Informasi Kepala Desa</h2>

            <p>
              Informasi kepala desa yang sedang aktif
              digunakan dalam sistem.
            </p>
          </div>
        </div>

        <div className="profile-info-list">

          {/* JABATAN */}

          <div className="profile-info-item">
            <div className="profile-info-icon">
              <BriefcaseBusiness size={20} />
            </div>

            <div className="profile-info-content">
              <span>Jabatan</span>

              <strong>
                {jabatan || "-"}
              </strong>
            </div>
          </div>

          {/* PERIODE */}

          <div className="profile-info-item">

            <div className="profile-info-icon periode">
              <CalendarDays size={20} />
            </div>

            <div className="profile-info-content">
              <span>
                Periode Jabatan
              </span>

              <strong>
                {periode || "-"}
              </strong>
            </div>

          </div>

          {/* NAMA */}

          <div className="profile-info-item">

            <div className="profile-info-icon nama">
              <UserRound size={20} />
            </div>

            <div className="profile-info-content">

              <span>
                Nama Kepala Desa
              </span>

              <strong>
                {nama || "-"}
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          TANDA TANGAN
      ====================================================== */}
      <section className="profile-section signature-section">
        <div className="profile-section-header">
          <div className="profile-section-icon signature-icon">
            <PenLine size={21} />
          </div>
          <div>
            <h2>
              Tanda Tangan Kepala Desa
            </h2>
            <p>
              Kelola tanda tangan yang digunakan
              untuk pengesahan surat.
            </p>
          </div>
        </div>
        <div
          className="signature-grid"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "40px",
            width: "fit-content",
          }}
        >

          {/* =================================================
              TANDA TANGAN SAAT INI
          ================================================== */}
          <div className="signature-column">
            <label className="signature-label">
              Tanda Tangan Saat Ini
            </label>
            <div
              className="current-signature"
              style={{
                width: "180px",
                height: "180px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {tanda_tangan ? (
                <img
                  src={tanda_tangan}
                  alt="Tanda tangan Kepala Desa"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div
                  className="empty-signature"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "15px",
                  }}
                >
                  <PenLine size={32} />
                  <span>
                    Belum ada tanda tangan
                  </span>
                </div>
              )}
            </div>
            {tanda_tangan && (
              <p
                className="signature-status"
                style={{
                  marginTop: "10px",
                  fontSize: "13px",
                  color: "#16a34a",
                  fontWeight: 500,
                }}
              >
                ✓ Tanda tangan aktif
              </p>
            )}
          </div>
          {/* =================================================
              UPLOAD TANDA TANGAN BARU
          ================================================== */}
          <div className="signature-column">
            <label className="signature-label">
              Upload Tanda Tangan Baru
            </label>

            {/* INPUT FILE TERSEMBUNYI */}

            <input
              ref={fileInputRef}
              type="file"
              name="tanda_tangan"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              style={{
                display: "none",
              }}
            />

            {/* UPLOAD BOX */}
            <button
              type="button"
              className="upload-box"
              onClick={openFilePicker}
              disabled={loading}
              style={{
                width: "180px",
                height: "180px",
                padding: "20px",
                border:
                  "1.5px dashed #93c5fd",
                borderRadius: "12px",
                backgroundColor: "#f8fbff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                boxSizing: "border-box",
                textAlign: "center",
              }}
            >
              {fileName ? (
                <>
                  <div
                    className="upload-success-icon"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor:
                        "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#16a34a",
                    }}
                  >
                    <FileImage size={26} />
                  </div>
                  <strong
                    style={{
                      maxWidth: "140px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      color: "#1e3a8a",
                    }}
                    title={fileName}
                  >
                    {fileName}
                  </strong>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    Klik untuk mengganti file
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="upload-icon"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor:
                        "#dbeafe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563eb",
                    }}
                  >
                    <Upload size={26} />
                  </div>

                  <strong
                    style={{
                      fontSize: "13px",
                      color: "#1d4ed8",
                    }}
                  >
                    Klik untuk memilih file
                  </strong>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    PNG atau JPG
                  </span>

                  <small
                    style={{
                      fontSize: "10px",
                      color: "#94a3b8",
                      lineHeight: 1.4,
                    }}
                  >
                    Gunakan gambar tanda tangan
                    dengan kualitas yang jelas
                  </small>
                </>
              )}
            </button>

            {/* NOTE */}

            <div
              className="upload-note"
              style={{
                marginTop: "10px",
                width: "180px",
                boxSizing: "border-box",
                padding: "9px 10px",
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                display: "flex",
                gap: "7px",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "#2563eb",
                  lineHeight: 1.4,
                }}
              >
                ⓘ
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: "10px",
                  lineHeight: 1.5,
                  color: "#475569",
                }}
              >
                Gunakan gambar tanda tangan
                dengan latar belakang putih
                agar hasil pengesahan surat
                lebih jelas.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            BUTTON SIMPAN
        ================================================== */}
        <div
          className="signature-action"
          style={{
            marginTop: "28px",
          }}
        >
          <button
            type="submit"
            className="save-signature-btn"
            disabled={loading}
          >
            <Save size={18} />
            {loading
              ? "Menyimpan..."
              : "Simpan Tanda Tangan"}
          </button>
        </div>
      </section>

    </form>
  );
}