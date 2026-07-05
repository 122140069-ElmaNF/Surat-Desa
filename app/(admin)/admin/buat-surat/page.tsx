"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DomisiliForm from "@/app/components/surat/DomisiliForm";

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

  async function handleAdminSubmit(formData: FormData) {
    try {
      const res = await fetch(
        "/api/admin/buat-surat/domisili",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await res.json();

      console.log("RESULT =", result);
      console.log("ID =", result.pengajuan_id);

      if (!res.ok) {
        alert(result.message);
        return;
      }

      console.log("PENGAJUAN =", result.pengajuan_id);

      // Langsung buka halaman detail surat
      // agar modal approval otomatis muncul
      router.push(
        `/admin/surat/${result.pengajuan_id}?autoApproval=1`
      );

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server.");
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