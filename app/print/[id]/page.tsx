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

  const [kodeSurat, setKodeSurat] = useState("");
  const [content, setContent] = useState("");
  const [useKop, setUseKop] = useState(true);
  const [status, setStatus] = useState("");
  const [profil, setProfil] =
    useState<Profil | null>(null);

  const [tanggalSurat, setTanggalSurat] =
    useState("");

  const [loading, setLoading] =
    useState(true);

    useEffect(() => {
    document.title = `Surat-${id}`;
    }, [id]);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/generate/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setContent(res.hasil);
        setUseKop(res.use_kop);
        setStatus(res.status ?? "");
        setProfil(res.profil ?? null);
        setTanggalSurat(res.tanggalSurat ?? "");
        setKodeSurat(res.kodeSurat ?? "");

        setLoading(false);
      });
  }, [id]);

    useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
        window.print();

        window.onafterprint = () => {
        window.close();
        };

    }, 300);

    return () => clearTimeout(timer);

    }, [loading]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: 18,
        }}
      >
        Memuat surat...
      </div>
    );
  }

  return (
      <SuratPreview
        mode="print"
         kodeSurat={kodeSurat}
        content={content}
        useKop={useKop}
        status={status}
        profil={profil}
        tanggalSurat={tanggalSurat}
        />
  );
}