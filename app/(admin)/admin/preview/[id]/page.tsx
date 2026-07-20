"use client";

import { useEffect, useState } from "react";
import SuratPreview from "@/app/components/surat/SuratPreview";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

type Profil = {
  nama_kepala_desa: string;
  jabatan: string;
  tanda_tangan: string;
};

export default function AdminPreviewPage() {
  const [data, setData] = useState("");
  const [useKop, setUseKop] = useState(true);
  const [status, setStatus] = useState("");
  const [profil, setProfil] = useState<Profil | null>(null);
  const [tanggalSurat, setTanggalSurat] = useState("");
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

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
        setTanggalSurat(res.tanggalSurat || "");
      });
  }, [id]);

  function handlePrint() {
    window.open(
      `/print/${id}`,
      "_blank"
    );
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
            margin: "0 auto 24px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() =>
              router.push("/admin")
            }
            style={outlineButtonStyle}
          >
            Kembali
          </button>

          <button
            onClick={handlePrint}
            style={actionButtonStyle}
          >
            Print
          </button>
        </div>
      )}

        <SuratPreview
        mode="preview"
          content={data}
          useKop={useKop}
          status={status}
          profil={profil}
          tanggalSurat={tanggalSurat}
        />

    </div>
  );
}

const outlineButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const actionButtonStyle: React.CSSProperties = {
  padding: "10px 18px",
  border: "none",
  borderRadius: 8,
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};