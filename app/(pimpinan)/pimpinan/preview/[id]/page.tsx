"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import SuratPaper from "@/app/components/surat/SuratPaper";
import DomisiliTemplate from "@/app/components/surat/templates/DomisiliTemplate";

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

  const [loading, setLoading] =
    useState<"acc" | "tolak" | null>(null);

  const params = useParams();
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const isPrint =
    searchParams?.get("print") !== null;

  const id = params.id;

  useEffect(() => {
    if (!id) return;

    fetch(`/api/generate/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.hasil);
        setUseKop(res.use_kop);
        setStatus(res.status || "");
        setProfil(res.profil ?? null);
        setTanggalSurat(
          res.tanggalSurat ?? ""
        );
      });
  }, [id]);

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

      if (!res.ok) {
        alert(
          "Gagal memproses surat."
        );
        return;
      }

      if (action === "acc") {
        setStatus("selesai");
        router.refresh();
      } else {
        router.push("/pimpinan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(null);
    }
  }

  function handlePrint() {
    window.print();
  }

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

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
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

            <button
              onClick={() =>
                updatePersetujuan(
                  "acc"
                )
              }
              disabled={
                loading !==
                  null ||
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

            <button
              onClick={() =>
                updatePersetujuan(
                  "tolak"
                )
              }
              disabled={
                loading !==
                  null ||
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

      <SuratPaper>
        <DomisiliTemplate
          content={data}
          useKop={useKop}
          status={status}
          profil={profil}
          tanggalSurat={
            tanggalSurat
          }
        />
      </SuratPaper>
    </div>
  );
}

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