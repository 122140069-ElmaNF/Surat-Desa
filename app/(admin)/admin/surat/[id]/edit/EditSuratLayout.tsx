"use client";

import { useMemo, useState } from "react";
import SuratEditor from "./SuratEditor";
import { generateSurat } from "@/lib/surat/generateSurat";
import { toast } from "sonner";

type DetailItem = {
  key: string;
  label: string;
  value: any;
};

type Profil = {
  nama_kepala_desa: string;
  jabatan: string;
  tanda_tangan: string;
};

type Props = {
  pengajuan: any;
  detail: DetailItem[];
  table: string;
  template: string;
  content: string;
  profil: Profil;
};

export default function EditSuratLayout({
  pengajuan,
  detail,
  table,
  template,
  content,
  profil,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState(() => {
      const obj: Record<string, string> = {};

      detail.forEach((item) => {
        obj[item.key] = String(
          item.value ?? ""
        );
      });

      return obj;
    });

  function handleChange(
    key: string,
    value: string
  ) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSave() {
    try {
      setLoading(true);

      const res = await fetch(
  `/api/admin/surat/${pengajuan.id}/data`,
  {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      table,
      fields: formData,
    }),
  }
);

    const result = await res.json();

    if (result.success) {
    toast.success("Data berhasil diperbarui.");
    } else {
    toast.error(result.message);
    }
        } finally {
        setLoading(false);
        }
    }

  const previewContent = useMemo(() => {
    const shouldGenerate =
      ["draft", "pending"].includes(
        pengajuan.status
      );

    if (!shouldGenerate) {
      return content;
    }

    return generateSurat(
      template,
      {
        ...formData,

        nomor_surat:
          pengajuan.nomor_surat ?? "",

        tanggal:
          pengajuan.tanggal_surat
            ? new Date(
                pengajuan.tanggal_surat
              ).toLocaleDateString(
                "id-ID",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )
            : "",

        nama_penandatangan:
          profil.nama_kepala_desa,

        jabatan:
          profil.jabatan,
      },
      {
        preserveSystemFields: true,
      }
    );
  }, [
    formData,
    template,
    content,
    pengajuan.status,
    pengajuan.nomor_surat,
    pengajuan.tanggal_surat,
    profil.nama_kepala_desa,
    profil.jabatan,
  ]);

  return (
    <div className="edit-surat-layout">

      {/* ================= LEFT ================= */}

      <div className="edit-surat-sidebar">

        <div className="card">

          <h2
            style={{
              marginBottom: 20,
            }}
          >
            Data Pemohon
          </h2>

          {detail.map((item) => {
            const isLongText = [
              "alamat",
              "keperluan",
              "keterangan",
            ].includes(item.key);

            return (
              <div
                key={item.key}
                style={{
                  marginBottom: 18,
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </label>

                {isLongText ? (
                  <textarea
                    rows={3}
                    value={
                      formData[
                        item.key
                      ] ?? ""
                    }
                    onChange={(e) =>
                      handleChange(
                        item.key,
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      resize: "vertical",
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={
                      formData[
                        item.key
                      ] ?? ""
                    }
                    onChange={(e) =>
                      handleChange(
                        item.key,
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                    }}
                  />
                )}
              </div>
            );
          })}

          <button
            className="primary-btn"
            style={{
              width: "100%",
              marginTop: 12,
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>

        </div>

      </div>

      {/* ================= RIGHT ================= */}

      <div className="edit-surat-preview">

        <SuratEditor
          suratId={pengajuan.id}
          content={previewContent}
          useKop={Boolean(
            pengajuan.use_kop
          )}
          status={
            pengajuan.status
          }
          tanggalSurat={
            pengajuan.tanggal_surat
          }
          profil={profil}
          kodeSurat={
            pengajuan.kode_surat
          }
        />

      </div>

    </div>
  );
}