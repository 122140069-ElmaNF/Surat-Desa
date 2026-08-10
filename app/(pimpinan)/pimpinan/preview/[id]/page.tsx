"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import SuratPreview from "@/app/components/surat/SuratPreview";

type Profil = {
  nama_kepala_desa: string;
  jabatan: string;
  tanda_tangan: string;
};

export default function PimpinanPreviewPage() {
  const [data, setData] = useState("");
  const [useKop, setUseKop] = useState(true);
  const [status, setStatus] = useState("");
  const [profil, setProfil] =
    useState<Profil | null>(null);
  const [tanggalSurat, setTanggalSurat] =
    useState("");
  const [kodeSurat, setKodeSurat] =
    useState("");

  const [loading, setLoading] =
    useState<"acc" | "tolak" | null>(null);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isPrint =
    searchParams?.get("print") !== null;

  const id = params.id;

  // =========================================
  // AMBIL DATA SURAT
  // =========================================

  useEffect(() => {
    if (!id) return;

    fetch(`/api/generate/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.hasil ?? "");
        setUseKop(Boolean(res.use_kop));
        setStatus(res.status ?? "");
        setProfil(res.profil ?? null);
        setTanggalSurat(
          res.tanggalSurat ?? ""
        );
        setKodeSurat(
          res.kodeSurat ?? ""
        );
      })
      .catch((error) => {
        console.error(
          "Gagal mengambil preview surat:",
          error
        );
      });
  }, [id]);

  // =========================================
  // ACC / TOLAK
  // =========================================

  async function updatePersetujuan(
    action: "acc" | "tolak"
  ) {
    const yakin =
      action === "acc"
        ? confirm(
            "ACC surat ini?"
          )
        : confirm(
            "Tolak surat ini?"
          );

    if (!yakin) return;

    setLoading(action);

    try {
      const res = await fetch(
        `/api/pimpinan/surat/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      const result =
        await res.json();

      if (!res.ok) {
        alert(
          result.message ||
            "Gagal memproses surat."
        );
        return;
      }

      if (action === "acc") {
        /*
         * Setelah ACC:
         * status menjadi selesai.
         *
         * Refresh agar API generate
         * mengambil snapshot TTD
         * yang baru disimpan.
         */
        setStatus("selesai");

        router.refresh();

        // Ambil ulang data preview
        const previewRes =
          await fetch(
            `/api/generate/${id}`,
            {
              cache: "no-store",
            }
          );

        const previewData =
          await previewRes.json();

        setData(
          previewData.hasil ?? ""
        );

        setUseKop(
          Boolean(
            previewData.use_kop
          )
        );

        setStatus(
          previewData.status ?? ""
        );

        setProfil(
          previewData.profil ??
            null
        );

        setTanggalSurat(
          previewData.tanggalSurat ??
            ""
        );

        setKodeSurat(
          previewData.kodeSurat ??
            ""
        );
      } else {
        router.push("/pimpinan");
      }
    } catch (err) {
      console.error(err);

      alert(
        "Terjadi kesalahan."
      );
    } finally {
      setLoading(null);
    }
  }

  // =========================================
  // PRINT
  // =========================================

  function handlePrint() {
    window.print();
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <div
      style={{
        background: "#e5e7eb",
        minHeight: "100vh",
        padding: "32px",
      }}
    >
      {!isPrint && (
        <div
          style={{
            maxWidth: "900px",
            margin:
              "0 auto 24px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >
          {/* KEMBALI */}

          <button
            onClick={() =>
              router.push(
                "/pimpinan"
              )
            }
            style={
              outlineButtonStyle
            }
          >
            Kembali
          </button>

          {/* ACTION */}

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            {/* PRINT */}

            {status ===
              "selesai" && (
              <button
                onClick={
                  handlePrint
                }
                style={{
                  ...actionButtonStyle,
                  background:
                    "#111827",
                }}
              >
                Print
              </button>
            )}

            {/* ACC */}

            <button
              onClick={() =>
                updatePersetujuan(
                  "acc"
                )
              }
              disabled={
                loading !== null ||
                status ===
                  "selesai"
              }
              style={{
                ...actionButtonStyle,
                background:
                  status ===
                  "selesai"
                    ? "#9ca3af"
                    : "#16a34a",
                cursor:
                  loading !== null ||
                  status ===
                    "selesai"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {status ===
              "selesai"
                ? "Sudah ACC"
                : loading ===
                  "acc"
                ? "Memproses..."
                : "ACC"}
            </button>

            {/* TOLAK */}

            <button
              onClick={() =>
                updatePersetujuan(
                  "tolak"
                )
              }
              disabled={
                loading !== null ||
                status ===
                  "selesai"
              }
              style={{
                ...actionButtonStyle,
                background:
                  status ===
                  "selesai"
                    ? "#9ca3af"
                    : "#dc2626",
                cursor:
                  loading !== null ||
                  status ===
                    "selesai"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading ===
              "tolak"
                ? "Memproses..."
                : "Tolak"}
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          PREVIEW SURAT
      ========================================= */}

      <SuratPreview
        mode="preview"
        kodeSurat={kodeSurat}
        content={data}
        useKop={useKop}
        status={status}
        profil={profil}
        tanggalSurat={tanggalSurat}
      />
    </div>
  );
}

// =========================================
// STYLE
// =========================================

const outlineButtonStyle: React.CSSProperties =
  {
    padding: "10px 16px",
    border:
      "1px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  };

const actionButtonStyle: React.CSSProperties =
  {
    padding: "10px 18px",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  };