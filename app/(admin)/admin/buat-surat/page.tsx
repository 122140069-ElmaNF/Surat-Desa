"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DomisiliForm from "@/app/components/surat/DomisiliForm";
import ListrikForm from "@/app/components/surat/ListrikForm";
import JalanForm from "@/app/components/surat/JalanForm";
import UsahaForm from "@/app/components/surat/UsahaForm";
import KebenaranDataForm from "@/app/components/surat/KebenaranDataForm";


type JenisSurat = {
  id: number;
  nama_surat: string;
  kode_surat: string;
};

export default function AdminBuatSuratPage() {
  const router = useRouter();

  const [jenisSurat, setJenisSurat] = useState<JenisSurat[]>([]);
  const [selectedKode, setSelectedKode] = useState("");

  useEffect(() => {
    async function loadJenisSurat() {
      try {
        const res = await fetch("/api/jenis-surat");
        const result = await res.json();

        if (result.success) {
          setJenisSurat(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadJenisSurat();
  }, []);

  async function handleAdminSubmit(
    formData: FormData
  ) {
    try {

      const endpointMap: Record<
        string,
        string
      > = {
        SD: "domisili",
        SKJ: "jalan",
        SKL: "listrik",
        SKU: "usaha",
        SKKD: "kebenaran_data",
        SKPHS: "penghasilan",
      };

      const endpoint =
        endpointMap[selectedKode];

      const res = await fetch(
        `/api/admin/buat-surat/${endpoint}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result =
        await res.json();

      if (!res.ok) {
        alert(result.message);
        return;
      }

      router.push(
        `/admin/surat/${result.pengajuan_id}?autoApproval=1`
      );

    } catch (err) {

      console.error(err);

      alert(
        "Terjadi kesalahan server."
      );

    }
  }

  function renderForm() {

    switch (selectedKode) {

      case "SD":
        return (
          <DomisiliForm
            mode="create"
            role="admin"
            onSubmit={handleAdminSubmit}
          />
        );

      case "SKL":
        return (
          <ListrikForm
            mode="create"
            role="admin"
            onSubmit={handleAdminSubmit}
          />
        );

      case "SKJ":
        return (
          <JalanForm
            mode="create"
            role="admin"
            onSubmit={handleAdminSubmit}
          />
        );

      case "SKU":
        return (
          <UsahaForm
            mode="create"
            role="admin"
            onSubmit={handleAdminSubmit}
          />
        );

      case "SKKD":
        return (
          <KebenaranDataForm
            mode="create"
            role="admin"
            onSubmit={handleAdminSubmit}
          />
        );

        case "SKPHS":
        return (
          <KebenaranDataForm
            mode="create"
            role="admin"
            onSubmit={handleAdminSubmit}
          />
        );

      default:
        return null;

    }

  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">
          Buat Surat
        </h1>

        <p className="page-subtitle">
          Pilih jenis surat yang akan dibuat.
        </p>
      </div>

      <div className="card">
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Jenis Surat
        </label>

        <select
          className="input-control"
          value={selectedKode}
          onChange={(e) =>
            setSelectedKode(e.target.value)
          }
        >
          <option value="">
            Pilih Jenis Surat
          </option>

          {jenisSurat.map((item) => (
            <option
              key={item.id}
              value={item.kode_surat}
            >
              {item.nama_surat}
            </option>
          ))}
        </select>
      </div>

      {renderForm()}
    </>
  );
}