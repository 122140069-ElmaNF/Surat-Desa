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

// ======================================================
// NORMALISASI TANGGAL UNTUK INPUT TYPE="DATE"
// ======================================================

function normalizeDateForInput(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const stringValue =
    String(value).trim();

  // ==========================================
  // YYYY-MM-DD
  // ==========================================

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      stringValue
    )
  ) {
    return stringValue;
  }

  // ==========================================
  // ISO Date
  // Contoh:
  // 2026-08-13T00:00:00.000Z
  // ==========================================

  const isoMatch =
    stringValue.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // ==========================================
  // FORMAT INDONESIA
  // Contoh:
  // 13 Agustus 2026
  // ==========================================

  const bulan: Record<
    string,
    string
  > = {
    januari: "01",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12",
  };

  const indoMatch =
    stringValue.match(
      /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
    );

  if (indoMatch) {
    const day =
      indoMatch[1].padStart(2, "0");

    const month =
      bulan[
        indoMatch[2].toLowerCase()
      ];

    const year =
      indoMatch[3];

    if (month) {
      return `${year}-${month}-${day}`;
    }
  }

  return "";
}

// ======================================================
// FORMAT TANGGAL INDONESIA
// Untuk preview surat
// ======================================================

function formatTanggalIndonesia(
  value: string
): string {
  if (!value) {
    return "";
  }

  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (match) {
    const [
      ,
      year,
      month,
      day,
    ] = match;

    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const monthIndex =
      Number(month) - 1;

    if (
      monthIndex >= 0 &&
      monthIndex < bulan.length
    ) {
      return `${day} ${
        bulan[monthIndex]
      } ${year}`;
    }
  }

  return value;
}

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

  // ======================================================
  // FORM DATA
  // ======================================================

  const [formData, setFormData] =
    useState(() => {
      const obj: Record<
        string,
        string
      > = {};

      detail.forEach((item) => {
        // ==========================================
        // KHUSUS TANGGAL KEMATIAN
        // Database tetap menggunakan "tanggal"
        // ==========================================

        if (
          pengajuan.kode_surat === "SKM" &&
          item.key === "tanggal"
        ) {
          obj[item.key] =
            normalizeDateForInput(
              item.value
            );

          return;
        }

        obj[item.key] = String(
          item.value ?? ""
        );
      });

      return obj;
    });

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  function handleChange(
    key: string,
    value: string
  ) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // ======================================================
  // SAVE
  // ======================================================

  async function handleSave() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/surat/${pengajuan.id}/data`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            table,
            fields: formData,
          }),
        }
      );

      const result =
        await res.json();

      if (result.success) {
        toast.success(
          "Data berhasil diperbarui."
        );
      } else {
        toast.error(
          result.message ??
            "Gagal memperbarui data."
        );
      }

    } catch (error) {
      console.error(error);

      toast.error(
        "Terjadi kesalahan server."
      );

    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // PREVIEW
  // ======================================================

  const previewContent = useMemo(() => {
    const shouldGenerate =
      ["draft", "pending"].includes(
        pengajuan.status
      );

    if (!shouldGenerate) {
      return content;
    }

    // ==========================================
    // COPY FORM DATA
    // ==========================================

    const previewFields: Record<
      string,
      string
    > = {
      ...formData,
    };

    // ==========================================
    // KHUSUS SURAT KEMATIAN
    //
    // Database:
    // tanggal
    //
    // Template:
    // {{tanggal_kematian}}
    //
    // Jadi kita buat alias untuk preview
    // tanpa mengubah nama kolom database.
    // ==========================================

    if (
      pengajuan.kode_surat === "SKM"
    ) {
      previewFields.tanggal_kematian =
        formatTanggalIndonesia(
          formData.tanggal ?? ""
        );
    }

    // ==========================================
    // SYSTEM FIELDS
    // ==========================================

    previewFields.nomor_surat =
      pengajuan.nomor_surat ?? "";

    previewFields.tanggal =
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
        : "";

    previewFields.nama_penandatangan =
      profil.nama_kepala_desa;

    previewFields.jabatan =
      profil.jabatan;

    return generateSurat(
      template,
      previewFields,
      {
        preserveSystemFields: true,
      }
    );

  }, [
    formData,
    template,
    content,
    pengajuan.status,
    pengajuan.kode_surat,
    pengajuan.nomor_surat,
    pengajuan.tanggal_surat,
    profil.nama_kepala_desa,
    profil.jabatan,
  ]);

  // ======================================================
  // RENDER
  // ======================================================

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

            // ==========================================
            // KHUSUS TANGGAL KEMATIAN
            // ==========================================

            const isTanggalKematian =
              pengajuan.kode_surat ===
                "SKM" &&
              item.key === "tanggal";

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

                {/* ======================================
                    TEXTAREA
                ====================================== */}

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

                ) : isTanggalKematian ? (

                  /* ====================================
                     DATE INPUT KHUSUS KEMATIAN
                  ==================================== */

                  <input
                    type="date"
                    value={
                      formData.tanggal ??
                      ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "tanggal",
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                    }}
                  />

                ) : (

                  /* ====================================
                     INPUT BIASA
                  ==================================== */

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