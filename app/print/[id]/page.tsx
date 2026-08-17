"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import SuratPreview from "@/app/components/surat/SuratPreview";
import "@/app/styles/print.css";

type Profil = {
  nama_kepala_desa: string;
  jabatan: string;
  tanda_tangan: string;
};

export default function PrintSuratPage() {
  const params = useParams();

  const id = params.id;

  const [kodeSurat, setKodeSurat] =
    useState("");

  const [content, setContent] =
    useState("");

  const [useKop, setUseKop] =
    useState(true);

  const [status, setStatus] =
    useState("");

  const [profil, setProfil] =
    useState<Profil | null>(null);

  const [tanggalSurat, setTanggalSurat] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // =========================================
  // TITLE
  // =========================================

  useEffect(() => {
    if (!id) return;

    document.title = `Surat-${id}`;
  }, [id]);

  // =========================================
  // AMBIL DATA SURAT
  // =========================================

  useEffect(() => {
    if (!id) return;

    async function loadSurat() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/generate/${id}`,
          {
            cache: "no-store",
          }
        );

        const result =
          await res.json();

        if (!res.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil data surat."
          );
        }

        setContent(
          result.hasil ?? ""
        );

        setUseKop(
          Boolean(result.use_kop)
        );

        setStatus(
          result.status ?? ""
        );

        setProfil(
          result.profil ?? null
        );

        setTanggalSurat(
          result.tanggalSurat ?? ""
        );

        setKodeSurat(
          result.kodeSurat ?? ""
        );
      } catch (error) {
        console.error(
          "Gagal mengambil data surat:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadSurat();
  }, [id]);

  // =========================================
  // PRINT MANUAL
  // =========================================

  useEffect(() => {
    if (loading) return;

    const timer =
      setTimeout(() => {
        /*
         * Halaman ini juga bisa dibuka
         * langsung oleh browser untuk print.
         *
         * Puppeteer tidak masalah dengan
         * adanya window.print().
         */

        window.print();

        window.onafterprint = () => {
          window.close();
        };
      }, 300);

    return () =>
      clearTimeout(timer);
  }, [loading]);

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
          height: "100vh",
          fontSize: 18,
        }}
      >
        Memuat surat...
      </div>
    );
  }

  // =========================================
  // RENDER SURAT
  // =========================================

  return (
    <div
      data-pdf-ready="true"
      style={{
        background: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <SuratPreview
        mode="print"
        kodeSurat={kodeSurat}
        content={content}
        useKop={useKop}
        status={status}
        profil={profil}
        tanggalSurat={tanggalSurat}
      />
    </div>
  );
}