"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import InputField from "@/app/components/form/InputField";
import SelectField from "@/app/components/form/SelectField";
import FileUploadField from "@/app/components/form/FileUploadField";
import SubmitButton from "@/app/components/form/SubmitButton";

type Props = {
  mode: "create" | "edit";
  initialData?: any;
  submitLabel?: string;
  role?: "user" | "admin";
  onSubmit?: (formData: FormData) => Promise<void>;
};

type LookupStatus =
  | ""
  | "loading"
  | "found"
  | "not-found";

function parseTTL(ttl: string | null | undefined) {
  if (!ttl) {
    return {
      tempat: "",
      tanggal: "",
    };
  }

  const parts = String(ttl).split(",");

  return {
    tempat: parts[0]?.trim() ?? "",
    tanggal: parts.slice(1).join(",").trim() ?? "",
  };
}

export default function PenghasilanForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    // =====================================================
    // KEPALA KELUARGA
    // =====================================================

    nama_kepala_keluarga: "",
    tempat_lahir_kepala: "",
    tanggal_lahir_kepala: "",
    nik_kepala_keluarga: "",
    jenis_kelamin_kepala_keluarga: "",
    kewarganegaraan_kepala_keluarga: "",
    agama_kepala_keluarga: "",
    status_perkawinan_kepala_keluarga: "",
    pekerjaan_kepala_keluarga: "",
    alamat_kepala_keluarga: "",
    dusun_kepala_keluarga: "",
    rt_kepala_keluarga: "",
    rw_kepala_keluarga: "",

    // =====================================================
    // ANAK
    // =====================================================

    nama_anak: "",
    tempat_lahir_anak: "",
    tanggal_lahir_anak: "",
    nik_anak: "",
    jenis_kelamin_anak: "",
    kewarganegaraan_anak: "",
    agama_anak: "",
    status_perkawinan_anak: "",
    pekerjaan_anak: "",
    alamat_anak: "",
    dusun_anak: "",
    rt_anak: "",
    rw_anak: "",

    // =====================================================
    // PENGHASILAN
    // =====================================================

    penghasilan: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [lookupKepala, setLookupKepala] =
    useState<LookupStatus>("");

  const [lookupAnak, setLookupAnak] =
    useState<LookupStatus>("");

  // =====================================================
  // LOAD DATA EDIT
  // =====================================================

  useEffect(() => {
    if (
      mode !== "edit" ||
      !initialData
    ) {
      return;
    }

    const ttlKepala =
      parseTTL(
        initialData.ttl_kepala_keluarga ??
          initialData.ttl
      );

    const ttlAnak =
      parseTTL(
        initialData.ttl_anak
      );

    setForm({
      // Kepala Keluarga
      nama_kepala_keluarga:
        initialData.nama_kepala_keluarga ??
        initialData.nama ??
        "",

      tempat_lahir_kepala:
        ttlKepala.tempat,

      tanggal_lahir_kepala:
        ttlKepala.tanggal,

      nik_kepala_keluarga:
        initialData.nik_kepala_keluarga ??
        "",

      jenis_kelamin_kepala_keluarga:
        initialData.jenis_kelamin_kepala_keluarga ??
        initialData.jenis_kelamin ??
        "",

      kewarganegaraan_kepala_keluarga:
        initialData.kewarganegaraan_kepala_keluarga ??
        initialData.kewarganegaraan ??
        "",

      agama_kepala_keluarga:
        initialData.agama_kepala_keluarga ??
        initialData.agama ??
        "",

      status_perkawinan_kepala_keluarga:
        initialData.status_perkawinan_kepala_keluarga ??
        initialData.status_perkawinan ??
        "",

      pekerjaan_kepala_keluarga:
        initialData.pekerjaan_kepala_keluarga ??
        initialData.pekerjaan ??
        "",

      alamat_kepala_keluarga:
        initialData.alamat_kepala_keluarga ??
        initialData.alamat ??
        "",

      dusun_kepala_keluarga:
        initialData.dusun_kepala_keluarga ??
        initialData.dusun ??
        "",

      rt_kepala_keluarga:
        initialData.rt_kepala_keluarga ??
        initialData.rt ??
        "",

      rw_kepala_keluarga:
        initialData.rw_kepala_keluarga ??
        initialData.rw ??
        "",

      // Anak
      nama_anak:
        initialData.nama_anak ??
        "",

      tempat_lahir_anak:
        ttlAnak.tempat,

      tanggal_lahir_anak:
        ttlAnak.tanggal,

      nik_anak:
        initialData.nik_anak ??
        "",

      jenis_kelamin_anak:
        initialData.jenis_kelamin_anak ??
        "",

      kewarganegaraan_anak:
        initialData.kewarganegaraan_anak ??
        "",

      agama_anak:
        initialData.agama_anak ??
        "",

      status_perkawinan_anak:
        initialData.status_perkawinan_anak ??
        "",

      pekerjaan_anak:
        initialData.pekerjaan_anak ??
        "",

      alamat_anak:
        initialData.alamat_anak ??
        "",

      dusun_anak:
        initialData.dusun_anak ??
        "",

      rt_anak:
        initialData.rt_anak ??
        "",

      rw_anak:
        initialData.rw_anak ??
        "",

      // Penghasilan
      penghasilan:
        initialData.penghasilan ??
        "",
    });
  }, [mode, initialData]);

// =====================================================
// LOOKUP KEPALA KELUARGA
// =====================================================

useEffect(() => {
  const nik =
    form.nik_kepala_keluarga.trim();

  // NIK kosong / belum 16 digit
  if (!/^\d{16}$/.test(nik)) {
    setLookupKepala("");

    setForm((prev) => ({
      ...prev,

      nama_kepala_keluarga: "",
      tempat_lahir_kepala: "",
      tanggal_lahir_kepala: "",
      jenis_kelamin_kepala_keluarga: "",
      kewarganegaraan_kepala_keluarga: "",
      agama_kepala_keluarga: "",
      status_perkawinan_kepala_keluarga: "",
      pekerjaan_kepala_keluarga: "",
      alamat_kepala_keluarga: "",
      dusun_kepala_keluarga: "",
      rt_kepala_keluarga: "",
      rw_kepala_keluarga: "",
    }));

    return;
  }

  let cancelled = false;

  async function lookup() {
    setLookupKepala("loading");

    try {
      const res = await fetch(
        `/api/pengajuan/penghasilan?nik=${encodeURIComponent(nik)}`
      );

      const json = await res.json();

      if (cancelled) {
        return;
      }

      // Data tidak ditemukan
      if (!json.success || !json.found) {
        setLookupKepala("not-found");

        setForm((prev) => ({
          ...prev,

          nama_kepala_keluarga: "",
          tempat_lahir_kepala: "",
          tanggal_lahir_kepala: "",
          jenis_kelamin_kepala_keluarga: "",
          kewarganegaraan_kepala_keluarga: "",
          agama_kepala_keluarga: "",
          status_perkawinan_kepala_keluarga: "",
          pekerjaan_kepala_keluarga: "",
          alamat_kepala_keluarga: "",
          dusun_kepala_keluarga: "",
          rt_kepala_keluarga: "",
          rw_kepala_keluarga: "",
        }));

        return;
      }

      const data = json.data;

      const ttl =
        parseTTL(data.ttl);

      setForm((prev) => ({
        ...prev,

        nama_kepala_keluarga:
          data.nama ?? "",

        tempat_lahir_kepala:
          ttl.tempat,

        tanggal_lahir_kepala:
          ttl.tanggal,

        jenis_kelamin_kepala_keluarga:
          data.jenis_kelamin ?? "",

        kewarganegaraan_kepala_keluarga:
          data.kewarganegaraan ?? "",

        agama_kepala_keluarga:
          data.agama ?? "",

        status_perkawinan_kepala_keluarga:
          data.status_perkawinan ?? "",

        pekerjaan_kepala_keluarga:
          data.pekerjaan ?? "",

        alamat_kepala_keluarga:
          data.alamat ?? "",

        dusun_kepala_keluarga:
          data.dusun ?? "",

        rt_kepala_keluarga:
          data.rt ?? "",

        rw_kepala_keluarga:
          data.rw ?? "",
      }));

      setLookupKepala("found");

    } catch (error) {
      console.error(
        "Lookup kepala keluarga error:",
        error
      );

      if (!cancelled) {
        setLookupKepala("not-found");

        setForm((prev) => ({
          ...prev,

          nama_kepala_keluarga: "",
          tempat_lahir_kepala: "",
          tanggal_lahir_kepala: "",
          jenis_kelamin_kepala_keluarga: "",
          kewarganegaraan_kepala_keluarga: "",
          agama_kepala_keluarga: "",
          status_perkawinan_kepala_keluarga: "",
          pekerjaan_kepala_keluarga: "",
          alamat_kepala_keluarga: "",
          dusun_kepala_keluarga: "",
          rt_kepala_keluarga: "",
          rw_kepala_keluarga: "",
        }));
      }
    }
  }

  lookup();

  return () => {
    cancelled = true;
  };
}, [form.nik_kepala_keluarga]);

// =====================================================
// LOOKUP ANAK
// =====================================================

useEffect(() => {
  const nik =
    form.nik_anak.trim();

  // Jika NIK kosong / belum 16 digit,
  // kosongkan seluruh data anak
  if (!/^\d{16}$/.test(nik)) {
    setLookupAnak("");

    setForm((prev) => ({
      ...prev,

      nama_anak: "",
      tempat_lahir_anak: "",
      tanggal_lahir_anak: "",
      jenis_kelamin_anak: "",
      kewarganegaraan_anak: "",
      agama_anak: "",
      status_perkawinan_anak: "",
      pekerjaan_anak: "",
      alamat_anak: "",
      dusun_anak: "",
      rt_anak: "",
      rw_anak: "",
    }));

    return;
  }

  let cancelled = false;

  async function lookup() {
    setLookupAnak("loading");

    try {
      const res = await fetch(
        `/api/pengajuan/penghasilan?nik=${encodeURIComponent(nik)}`
      );

      const json = await res.json();

      if (cancelled) {
        return;
      }

      // Jika data tidak ditemukan,
      // kosongkan data anak
      if (!json.success || !json.found) {
        setLookupAnak("not-found");

        setForm((prev) => ({
          ...prev,

          nama_anak: "",
          tempat_lahir_anak: "",
          tanggal_lahir_anak: "",
          jenis_kelamin_anak: "",
          kewarganegaraan_anak: "",
          agama_anak: "",
          status_perkawinan_anak: "",
          pekerjaan_anak: "",
          alamat_anak: "",
          dusun_anak: "",
          rt_anak: "",
          rw_anak: "",
        }));

        return;
      }

      const data = json.data;

      const ttl =
        parseTTL(data.ttl);

      setForm((prev) => ({
        ...prev,

        nama_anak:
          data.nama ?? "",

        tempat_lahir_anak:
          ttl.tempat,

        tanggal_lahir_anak:
          ttl.tanggal,

        jenis_kelamin_anak:
          data.jenis_kelamin ?? "",

        kewarganegaraan_anak:
          data.kewarganegaraan ?? "",

        agama_anak:
          data.agama ?? "",

        status_perkawinan_anak:
          data.status_perkawinan ?? "",

        pekerjaan_anak:
          data.pekerjaan ?? "",

        alamat_anak:
          data.alamat ?? "",

        dusun_anak:
          data.dusun ?? "",

        rt_anak:
          data.rt ?? "",

        rw_anak:
          data.rw ?? "",
      }));

      setLookupAnak("found");

    } catch (error) {
      console.error(
        "Lookup anak error:",
        error
      );

      if (!cancelled) {
        setLookupAnak("not-found");

        setForm((prev) => ({
          ...prev,

          nama_anak: "",
          tempat_lahir_anak: "",
          tanggal_lahir_anak: "",
          jenis_kelamin_anak: "",
          kewarganegaraan_anak: "",
          agama_anak: "",
          status_perkawinan_anak: "",
          pekerjaan_anak: "",
          alamat_anak: "",
          dusun_anak: "",
          rt_anak: "",
          rw_anak: "",
        }));
      }
    }
  }

  lookup();

  return () => {
    cancelled = true;
  };

}, [form.nik_anak]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[name];

        return updated;
      });
    }
  }

  // =====================================================
  // VALIDASI
  // =====================================================

  function validateForm() {
    const newErrors:
      Record<string, string> = {};

    Object.entries(form).forEach(
      ([key, value]) => {
        if (!String(value).trim()) {
          newErrors[key] =
            "Field ini wajib diisi.";
        }
      }
    );

    if (
      !/^\d{16}$/.test(
        form.nik_kepala_keluarga
      )
    ) {
      newErrors.nik_kepala_keluarga =
        "NIK harus terdiri dari 16 digit.";
    }

    if (
      !/^\d{16}$/.test(
        form.nik_anak
      )
    ) {
      newErrors.nik_anak =
        "NIK harus terdiri dari 16 digit.";
    }

    if (
      mode === "create" &&
      role !== "admin" &&
      !fileKtp
    ) {
      newErrors.file_ktp =
        "Silakan upload KTP.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  }

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData =
      new FormData();

    // =====================================================
    // KEPALA KELUARGA
    // =====================================================

    formData.append(
      "nama_kepala_keluarga",
      form.nama_kepala_keluarga
    );

    formData.append(
      "ttl_kepala_keluarga",
      `${form.tempat_lahir_kepala}, ${form.tanggal_lahir_kepala}`
    );

    formData.append(
      "nik_kepala_keluarga",
      form.nik_kepala_keluarga
    );

    formData.append(
      "jenis_kelamin_kepala_keluarga",
      form.jenis_kelamin_kepala_keluarga
    );

    formData.append(
      "kewarganegaraan_kepala_keluarga",
      form.kewarganegaraan_kepala_keluarga
    );

    formData.append(
      "agama_kepala_keluarga",
      form.agama_kepala_keluarga
    );

    formData.append(
      "status_perkawinan_kepala_keluarga",
      form.status_perkawinan_kepala_keluarga
    );

    formData.append(
      "pekerjaan_kepala_keluarga",
      form.pekerjaan_kepala_keluarga
    );

    formData.append(
      "alamat_kepala_keluarga",
      form.alamat_kepala_keluarga
    );

    formData.append(
      "dusun_kepala_keluarga",
      form.dusun_kepala_keluarga
    );

    formData.append(
      "rt_kepala_keluarga",
      form.rt_kepala_keluarga
    );

    formData.append(
      "rw_kepala_keluarga",
      form.rw_kepala_keluarga
    );

    // =====================================================
    // ANAK
    // =====================================================

    formData.append(
      "nama_anak",
      form.nama_anak
    );

    formData.append(
      "ttl_anak",
      `${form.tempat_lahir_anak}, ${form.tanggal_lahir_anak}`
    );

    formData.append(
      "nik_anak",
      form.nik_anak
    );

    formData.append(
      "jenis_kelamin_anak",
      form.jenis_kelamin_anak
    );

    formData.append(
      "kewarganegaraan_anak",
      form.kewarganegaraan_anak
    );

    formData.append(
      "agama_anak",
      form.agama_anak
    );

    formData.append(
      "status_perkawinan_anak",
      form.status_perkawinan_anak
    );

    formData.append(
      "pekerjaan_anak",
      form.pekerjaan_anak
    );

    formData.append(
      "alamat_anak",
      form.alamat_anak
    );

    formData.append(
      "dusun_anak",
      form.dusun_anak
    );

    formData.append(
      "rt_anak",
      form.rt_anak
    );

    formData.append(
      "rw_anak",
      form.rw_anak
    );

    // =====================================================
    // PENGHASILAN
    // =====================================================

    formData.append(
      "penghasilan",
      form.penghasilan
    );

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

    // =====================================================
    // ADMIN
    // =====================================================

    if (
      role === "admin" &&
      onSubmit
    ) {
      await onSubmit(formData);
      return;
    }

    // =====================================================
    // USER
    // =====================================================

    try {
      const url =
        mode === "edit"
          ? `/api/pengajuan/penghasilan/${initialData.id}`
          : "/api/pengajuan/penghasilan";

      const method =
        mode === "edit"
          ? "PUT"
          : "POST";

      const res =
        await fetch(url, {
          method,
          body: formData,
        });

      const json =
        await res.json();

      if (!json.success) {
        toast.error(
          json.message ??
            "Gagal menyimpan."
        );

        return;
      }

      setErrors({});
      setFileKtp(null);

      if (mode === "edit") {
        toast.success(
          "Perbaikan berhasil dikirim."
        );

        window.location.href =
          `/tracking/${initialData.kode_tracking}`;
      } else {
        window.location.href =
          `/success/${json.kode_tracking}`;
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Terjadi kesalahan server."
      );
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="pengajuan-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="pengajuan-hero">

        <div className="pengajuan-hero-content">

          <h1>
            {mode === "create"
              ? "Surat Keterangan Penghasilan"
              : "Perbaiki Pengajuan Surat Keterangan Penghasilan"}
          </h1>

          <p>
            {mode === "create"
              ? "Lengkapi data di bawah ini dengan benar sebelum mengajukan surat."
              : "Perbaiki data sesuai catatan Admin kemudian kirim kembali."}
          </p>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="pengajuan-content">

        <div className="pengajuan-card">

          {/* =================================================
              PENOLAKAN
          ================================================= */}

          {mode === "edit" && (
            <div
              className="reject-alert"
              style={{
                background: "#fff7ed",
                border: "1px solid #fdba74",
                borderLeft: "6px solid #f97316",
                borderRadius: 12,
                padding: 18,
                marginBottom: 24,
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >

                <div
                  style={{
                    fontSize: 26,
                  }}
                >
                  ⚠️
                </div>

                <div>

                  <h3
                    style={{
                      margin: 0,
                      color: "#9a3412",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    Pengajuan Ditolak
                  </h3>

                  <p
                    style={{
                      margin: "10px 0 4px",
                      fontWeight: 600,
                      color: "#7c2d12",
                    }}
                  >
                    Alasan Penolakan :
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: "#444",
                      lineHeight: 1.7,
                    }}
                  >
                    {initialData.alasan_penolakan}
                  </p>

                </div>

              </div>

            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* =================================================
                DATA KEPALA KELUARGA
            ================================================= */}

            <h3 className="form-section-title">
              Data Kepala Keluarga
            </h3>

            <InputField
              label="NIK"
              name="nik_kepala_keluarga"
              value={form.nik_kepala_keluarga}
              onChange={handleChange}
              placeholder="Masukkan NIK kepala keluarga"
            />

            {lookupKepala === "loading" && (
              <p
                style={{
                  color: "#666",
                  fontSize: 14,
                  marginTop: -10,
                  marginBottom: 16,
                }}
              >
                Mencari data penduduk...
              </p>
            )}

            {lookupKepala === "found" && (
              <p
                style={{
                  color: "#15803d",
                  fontSize: 14,
                  marginTop: -10,
                  marginBottom: 16,
                }}
              >
                Data penduduk ditemukan dan telah diisi otomatis.
              </p>
            )}

            {lookupKepala === "not-found" && (
              <p
                style={{
                  color: "#666",
                  fontSize: 14,
                  marginTop: -10,
                  marginBottom: 16,
                }}
              >
                Silakan lengkapi data penduduk.
              </p>
            )}

            {errors.nik_kepala_keluarga && (
              <p className="form-error">
                {errors.nik_kepala_keluarga}
              </p>
            )}

            <InputField
              label="Nama Kepala Keluarga"
              name="nama_kepala_keluarga"
              value={form.nama_kepala_keluarga}
              onChange={handleChange}
              placeholder="Masukkan nama kepala keluarga"
            />

            {errors.nama_kepala_keluarga && (
              <p className="form-error">
                {errors.nama_kepala_keluarga}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir_kepala"
                value={form.tempat_lahir_kepala}
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir_kepala"
                type="date"
                value={form.tanggal_lahir_kepala}
                onChange={handleChange}
              />

            </div>

            {errors.tempat_lahir_kepala && (
              <p className="form-error">
                {errors.tempat_lahir_kepala}
              </p>
            )}

            {errors.tanggal_lahir_kepala && (
              <p className="form-error">
                {errors.tanggal_lahir_kepala}
              </p>
            )}

            <SelectField
              label="Jenis Kelamin"
              name="jenis_kelamin_kepala_keluarga"
              value={form.jenis_kelamin_kepala_keluarga}
              onChange={handleChange}
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
            />

            {errors.jenis_kelamin_kepala_keluarga && (
              <p className="form-error">
                {errors.jenis_kelamin_kepala_keluarga}
              </p>
            )}

            <SelectField
              label="Kewarganegaraan"
              name="kewarganegaraan_kepala_keluarga"
              value={form.kewarganegaraan_kepala_keluarga}
              onChange={handleChange}
              options={[
                "WNI",
                "WNA",
              ]}
            />

            {errors.kewarganegaraan_kepala_keluarga && (
              <p className="form-error">
                {errors.kewarganegaraan_kepala_keluarga}
              </p>
            )}

            <SelectField
              label="Agama"
              name="agama_kepala_keluarga"
              value={form.agama_kepala_keluarga}
              onChange={handleChange}
              options={[
                "Islam",
                "Kristen",
                "Katolik",
                "Hindu",
                "Buddha",
                "Konghucu",
              ]}
            />

            {errors.agama_kepala_keluarga && (
              <p className="form-error">
                {errors.agama_kepala_keluarga}
              </p>
            )}

            <SelectField
              label="Status Perkawinan"
              name="status_perkawinan_kepala_keluarga"
              value={form.status_perkawinan_kepala_keluarga}
              onChange={handleChange}
              options={[
                "Belum Kawin",
                "Kawin",
                "Cerai Hidup",
                "Cerai Mati",
              ]}
            />

            {errors.status_perkawinan_kepala_keluarga && (
              <p className="form-error">
                {errors.status_perkawinan_kepala_keluarga}
              </p>
            )}

            <InputField
              label="Pekerjaan"
              name="pekerjaan_kepala_keluarga"
              value={form.pekerjaan_kepala_keluarga}
              onChange={handleChange}
              placeholder="Masukkan pekerjaan"
            />

            {errors.pekerjaan_kepala_keluarga && (
              <p className="form-error">
                {errors.pekerjaan_kepala_keluarga}
              </p>
            )}

            <InputField
              label="Alamat"
              name="alamat_kepala_keluarga"
              value={form.alamat_kepala_keluarga}
              onChange={handleChange}
              placeholder="Masukkan alamat"
              textarea
            />

            {errors.alamat_kepala_keluarga && (
              <p className="form-error">
                {errors.alamat_kepala_keluarga}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4">

              <InputField
                label="Dusun"
                name="dusun_kepala_keluarga"
                value={form.dusun_kepala_keluarga}
                onChange={handleChange}
                placeholder="Dusun"
              />

              <InputField
                label="RT"
                name="rt_kepala_keluarga"
                value={form.rt_kepala_keluarga}
                onChange={handleChange}
                placeholder="RT"
              />

              <InputField
                label="RW"
                name="rw_kepala_keluarga"
                value={form.rw_kepala_keluarga}
                onChange={handleChange}
                placeholder="RW"
              />

            </div>

            {errors.dusun_kepala_keluarga && (
              <p className="form-error">
                {errors.dusun_kepala_keluarga}
              </p>
            )}

            {errors.rt_kepala_keluarga && (
              <p className="form-error">
                {errors.rt_kepala_keluarga}
              </p>
            )}

            {errors.rw_kepala_keluarga && (
              <p className="form-error">
                {errors.rw_kepala_keluarga}
              </p>
            )}

            {/* =================================================
                DATA ANAK
            ================================================= */}

            <h3 className="form-section-title">
              Data Anak
            </h3>

            <InputField
              label="NIK"
              name="nik_anak"
              value={form.nik_anak}
              onChange={handleChange}
              placeholder="Masukkan NIK anak"
            />

            {lookupAnak === "loading" && (
              <p
                style={{
                  color: "#666",
                  fontSize: 14,
                  marginTop: -10,
                  marginBottom: 16,
                }}
              >
                Mencari data penduduk...
              </p>
            )}

            {lookupAnak === "found" && (
              <p
                style={{
                  color: "#15803d",
                  fontSize: 14,
                  marginTop: -10,
                  marginBottom: 16,
                }}
              >
                Data penduduk ditemukan dan telah diisi otomatis.
              </p>
            )}

            {lookupAnak === "not-found" && (
              <p
                style={{
                  color: "#666",
                  fontSize: 14,
                  marginTop: -10,
                  marginBottom: 16,
                }}
              >
                Silakan lengkapi data penduduk.
              </p>
            )}

            {errors.nik_anak && (
              <p className="form-error">
                {errors.nik_anak}
              </p>
            )}

            <InputField
              label="Nama Anak"
              name="nama_anak"
              value={form.nama_anak}
              onChange={handleChange}
              placeholder="Masukkan nama anak"
            />

            {errors.nama_anak && (
              <p className="form-error">
                {errors.nama_anak}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir_anak"
                value={form.tempat_lahir_anak}
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir_anak"
                type="date"
                value={form.tanggal_lahir_anak}
                onChange={handleChange}
              />

            </div>

            {errors.tempat_lahir_anak && (
              <p className="form-error">
                {errors.tempat_lahir_anak}
              </p>
            )}

            {errors.tanggal_lahir_anak && (
              <p className="form-error">
                {errors.tanggal_lahir_anak}
              </p>
            )}

            <SelectField
              label="Jenis Kelamin"
              name="jenis_kelamin_anak"
              value={form.jenis_kelamin_anak}
              onChange={handleChange}
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
            />

            {errors.jenis_kelamin_anak && (
              <p className="form-error">
                {errors.jenis_kelamin_anak}
              </p>
            )}

            <SelectField
              label="Kewarganegaraan"
              name="kewarganegaraan_anak"
              value={form.kewarganegaraan_anak}
              onChange={handleChange}
              options={[
                "WNI",
                "WNA",
              ]}
            />

            {errors.kewarganegaraan_anak && (
              <p className="form-error">
                {errors.kewarganegaraan_anak}
              </p>
            )}

            <SelectField
              label="Agama"
              name="agama_anak"
              value={form.agama_anak}
              onChange={handleChange}
              options={[
                "Islam",
                "Kristen",
                "Katolik",
                "Hindu",
                "Buddha",
                "Konghucu",
              ]}
            />

            {errors.agama_anak && (
              <p className="form-error">
                {errors.agama_anak}
              </p>
            )}

            <SelectField
              label="Status Perkawinan"
              name="status_perkawinan_anak"
              value={form.status_perkawinan_anak}
              onChange={handleChange}
              options={[
                "Belum Kawin",
                "Kawin",
                "Cerai Hidup",
                "Cerai Mati",
              ]}
            />

            {errors.status_perkawinan_anak && (
              <p className="form-error">
                {errors.status_perkawinan_anak}
              </p>
            )}

            <InputField
              label="Pekerjaan"
              name="pekerjaan_anak"
              value={form.pekerjaan_anak}
              onChange={handleChange}
              placeholder="Masukkan pekerjaan"
            />

            {errors.pekerjaan_anak && (
              <p className="form-error">
                {errors.pekerjaan_anak}
              </p>
            )}

            <InputField
              label="Alamat"
              name="alamat_anak"
              value={form.alamat_anak}
              onChange={handleChange}
              placeholder="Masukkan alamat"
              textarea
            />

            {errors.alamat_anak && (
              <p className="form-error">
                {errors.alamat_anak}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4">

              <InputField
                label="Dusun"
                name="dusun_anak"
                value={form.dusun_anak}
                onChange={handleChange}
                placeholder="Dusun"
              />

              <InputField
                label="RT"
                name="rt_anak"
                value={form.rt_anak}
                onChange={handleChange}
                placeholder="RT"
              />

              <InputField
                label="RW"
                name="rw_anak"
                value={form.rw_anak}
                onChange={handleChange}
                placeholder="RW"
              />

            </div>

            {errors.dusun_anak && (
              <p className="form-error">
                {errors.dusun_anak}
              </p>
            )}

            {errors.rt_anak && (
              <p className="form-error">
                {errors.rt_anak}
              </p>
            )}

            {errors.rw_anak && (
              <p className="form-error">
                {errors.rw_anak}
              </p>
            )}

            {/* =================================================
                DATA PENGHASILAN
            ================================================= */}

            <h3 className="form-section-title">
              Data Penghasilan
            </h3>

            <InputField
              label="Penghasilan Per Bulan"
              name="penghasilan"
              value={form.penghasilan}
              onChange={handleChange}
              placeholder="Contoh : 2000000"
            />

            {errors.penghasilan && (
              <p className="form-error">
                {errors.penghasilan}
              </p>
            )}

            {/* =================================================
                FILE KTP
            ================================================= */}

            <FileUploadField
              label={role === "admin" ? "Upload KTP (Opsional)" : "Upload KTP"}
              accept="image/jpeg,image/png"
              onChange={(file: File | null) =>
                setFileKtp(file)
              }
            />

            {mode === "edit" &&
              initialData?.file_ktp && (
                <div
                  style={{
                    marginTop: 8,
                    marginBottom: 16,
                    fontSize: 14,
                  }}
                >
                  File KTP saat ini :

                  <a
                    href={`/uploads/ktp/${initialData.file_ktp}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      marginLeft: 8,
                    }}
                  >
                    Lihat KTP
                  </a>
                </div>
              )}

            {errors.file_ktp && (
              <p className="form-error">
                {errors.file_ktp}
              </p>
            )}

            {/* =================================================
                SUBMIT
            ================================================= */}

            <SubmitButton>
              {submitLabel ??
                (role === "admin"
                  ? "Buat Surat"
                  : mode === "edit"
                  ? "Perbaiki Pengajuan"
                  : "Ajukan Surat")}
            </SubmitButton>

          </form>

        </div>

      </section>

    </div>
  );
}