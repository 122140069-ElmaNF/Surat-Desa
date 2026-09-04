"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import InputField from "@/app/components/form/InputField";
import FileUploadField from "@/app/components/form/FileUploadField";
import SubmitButton from "@/app/components/form/SubmitButton";
import SelectField from "../form/SelectField";

type Props = {
  mode: "create" | "edit";
  initialData?: any;
  submitLabel?: string;
  role?: "user" | "admin";
  onSubmit?: (formData: FormData) => Promise<void>;
};

export default function TidakBerlanggananAirForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    // =====================================================
    // DATA ORANG TUA / WALI
    // =====================================================

    nik_pertama: "",
    nama_pertama: "",
    tempat_lahir_pertama: "",
    tanggal_lahir_pertama: "",
    agama_pertama: "",
    jenis_kelamin_pertama: "",
    status_perkawinan_pertama: "",
    pekerjaan_pertama: "",
    alamat_pertama: "",
    dusun_pertama: "",
    rt_pertama: "",
    rw_pertama: "",
    kewarganegaraan_pertama: "",

    // =====================================================
    // DATA CALON MAHASISWA
    // =====================================================

    nik_kedua: "",
    nama_kedua: "",
    tempat_lahir_kedua: "",
    tanggal_lahir_kedua: "",
    prodi_kedua: "",
    alamat_kedua: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [lookupPertama, setLookupPertama] =
    useState("");

  const [lookupKedua, setLookupKedua] =
    useState("");

  // =====================================================
  // PARSE TTL
  // =====================================================

  function parseTTL(ttl: string) {
    if (!ttl) {
      return {
        tempat: "",
        tanggal: "",
      };
    }

    const parts =
      ttl.split(",");

    return {
      tempat:
        parts[0]?.trim() ?? "",
      tanggal:
        parts.slice(1)
          .join(",")
          .trim() ?? "",
    };
  }

  // =====================================================
  // LOAD DATA SAAT EDIT
  // =====================================================

  useEffect(() => {
    if (
      mode !== "edit" ||
      !initialData
    ) {
      return;
    }

    const ttlPertama =
      parseTTL(
        initialData.ttl_pertama ?? ""
      );

    const ttlKedua =
      parseTTL(
        initialData.ttl_kedua ?? ""
      );

    setForm({
      // ===================================================
      // ORANG TUA / WALI
      // ===================================================

      nik_pertama:
        initialData.nik_pertama ?? "",

      nama_pertama:
        initialData.nama_pertama ?? "",

      tempat_lahir_pertama:
        ttlPertama.tempat,

      tanggal_lahir_pertama:
        ttlPertama.tanggal,

      agama_pertama:
        initialData.agama_pertama ?? "",

      jenis_kelamin_pertama:
        initialData.jenis_kelamin_pertama ?? "",

      status_perkawinan_pertama:
        initialData.status_perkawinan_pertama ?? "",

      pekerjaan_pertama:
        initialData.pekerjaan_pertama ?? "",

      alamat_pertama:
        initialData.alamat_pertama ?? "",

      dusun_pertama:
        initialData.dusun_pertama ?? "",

      rt_pertama:
        initialData.rt_pertama ?? "",

      rw_pertama:
        initialData.rw_pertama ?? "",

      kewarganegaraan_pertama:
        initialData.kewarganegaraan_pertama ?? "",

      // ===================================================
      // CALON MAHASISWA
      // ===================================================

      nik_kedua:
        initialData.nik_kedua ?? "",

      nama_kedua:
        initialData.nama_kedua ?? "",

      tempat_lahir_kedua:
        ttlKedua.tempat,

      tanggal_lahir_kedua:
        ttlKedua.tanggal,

      prodi_kedua:
        initialData.prodi_kedua ?? "",

      alamat_kedua:
        initialData.alamat_kedua ?? "",
    });
  }, [mode, initialData]);

  // =====================================================
  // LOOKUP ORANG PERTAMA
  // =====================================================

  useEffect(() => {
    const nik =
      form.nik_pertama.trim();

    if (nik.length !== 16) {
      setLookupPertama("");

      if (nik.length === 0) {
        setForm((prev) => ({
          ...prev,

          nama_pertama: "",
          tempat_lahir_pertama: "",
          tanggal_lahir_pertama: "",
          agama_pertama: "",
          jenis_kelamin_pertama: "",
          status_perkawinan_pertama: "",
          pekerjaan_pertama: "",
          alamat_pertama: "",
          dusun_pertama: "",
          rt_pertama: "",
          rw_pertama: "",
          kewarganegaraan_pertama: "",
        }));
      }

      return;
    }

    let cancelled = false;

    async function lookup() {
      try {
        setLookupPertama(
          "Mencari data penduduk..."
        );

        const res =
          await fetch(
            `/api/pengajuan/tidak-berlanggan-air?nik=${nik}`
          );

        const json =
          await res.json();

        if (cancelled) {
          return;
        }

        if (
          json.success &&
          json.found &&
          json.data
        ) {
          const data =
            json.data;

          const ttl =
            parseTTL(
              data.ttl ?? ""
            );

          setForm((prev) => ({
            ...prev,

            nama_pertama:
              data.nama ?? "",

            tempat_lahir_pertama:
              ttl.tempat,

            tanggal_lahir_pertama:
              ttl.tanggal,

            agama_pertama:
              data.agama ?? "",

            jenis_kelamin_pertama:
              data.jenis_kelamin ?? "",

            status_perkawinan_pertama:
              data.status_perkawinan ?? "",

            pekerjaan_pertama:
              data.pekerjaan ?? "",

            alamat_pertama:
              data.alamat ?? "",

            dusun_pertama:
              data.dusun ?? "",

            rt_pertama:
              data.rt ?? "",

            rw_pertama:
              data.rw ?? "",

            kewarganegaraan_pertama:
              data.kewarganegaraan ?? "",
          }));

          setLookupPertama(
            "Data penduduk ditemukan dan telah diisi otomatis."
          );
        } else {
          setForm((prev) => ({
            ...prev,

            nama_pertama: "",
            tempat_lahir_pertama: "",
            tanggal_lahir_pertama: "",
            agama_pertama: "",
            jenis_kelamin_pertama: "",
            status_perkawinan_pertama: "",
            pekerjaan_pertama: "",
            alamat_pertama: "",
            dusun_pertama: "",
            rt_pertama: "",
            rw_pertama: "",
            kewarganegaraan_pertama: "",
          }));

          setLookupPertama(
            "Silakan lengkapi data penduduk."
          );
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setLookupPertama(
            "Gagal mencari data penduduk."
          );
        }
      }
    }

    lookup();

    return () => {
      cancelled = true;
    };
  }, [form.nik_pertama]);

  // =====================================================
  // LOOKUP ORANG KEDUA / CALON MAHASISWA
  // =====================================================

  useEffect(() => {
    const nik =
      form.nik_kedua.trim();

    if (nik.length !== 16) {
      setLookupKedua("");

      if (nik.length === 0) {
        setForm((prev) => ({
          ...prev,

          nama_kedua: "",
          tempat_lahir_kedua: "",
          tanggal_lahir_kedua: "",
          alamat_kedua: "",
        }));
      }

      return;
    }

    let cancelled = false;

    async function lookup() {
      try {
        setLookupKedua(
          "Mencari data penduduk..."
        );

        const res =
          await fetch(
            `/api/pengajuan/tidak-berlanggan-air?nik=${nik}`
          );

        const json =
          await res.json();

        if (cancelled) {
          return;
        }

        if (
          json.success &&
          json.found &&
          json.data
        ) {
          const data =
            json.data;

          const ttl =
            parseTTL(
              data.ttl ?? ""
            );

          setForm((prev) => ({
            ...prev,

            nama_kedua:
              data.nama ?? "",

            tempat_lahir_kedua:
              ttl.tempat,

            tanggal_lahir_kedua:
              ttl.tanggal,

            alamat_kedua:
              data.alamat ?? "",
          }));

          setLookupKedua(
            "Data penduduk ditemukan dan telah diisi otomatis."
          );
        } else {
          setForm((prev) => ({
            ...prev,

            nama_kedua: "",
            tempat_lahir_kedua: "",
            tanggal_lahir_kedua: "",
            alamat_kedua: "",
          }));

          setLookupKedua(
            "Silakan lengkapi data penduduk."
          );
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setLookupKedua(
            "Gagal mencari data penduduk."
          );
        }
      }
    }

    lookup();

    return () => {
      cancelled = true;
    };
  }, [form.nik_kedua]);

  // =====================================================
  // HANDLE INPUT
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

    if (
      name === "nik_pertama" ||
      name === "nik_kedua"
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  // =====================================================
  // VALIDASI FORM
  // =====================================================

  function validateForm() {
    const newErrors:
      Record<string, string> = {};

    // ===================================================
    // ORANG PERTAMA
    // ===================================================

    if (!form.nik_pertama.trim()) {
      newErrors.nik_pertama =
        "NIK wajib diisi.";
    } else if (
      !/^\d{16}$/.test(
        form.nik_pertama
      )
    ) {
      newErrors.nik_pertama =
        "NIK harus terdiri dari 16 digit.";
    }

    if (!form.nama_pertama.trim()) {
      newErrors.nama_pertama =
        "Nama wajib diisi.";
    }

    if (
      !form.tempat_lahir_pertama.trim()
    ) {
      newErrors.tempat_lahir_pertama =
        "Tempat lahir wajib diisi.";
    }

    if (
      !form.tanggal_lahir_pertama
    ) {
      newErrors.tanggal_lahir_pertama =
        "Tanggal lahir wajib diisi.";
    }

    if (!form.agama_pertama) {
      newErrors.agama_pertama =
        "Agama wajib diisi.";
    }

    if (!form.jenis_kelamin_pertama) {
      newErrors.jenis_kelamin_pertama =
        "Jenis kelamin wajib diisi.";
    }

    if (
      !form.status_perkawinan_pertama
    ) {
      newErrors.status_perkawinan_pertama =
        "Status perkawinan wajib diisi.";
    }

    if (
      !form.pekerjaan_pertama.trim()
    ) {
      newErrors.pekerjaan_pertama =
        "Pekerjaan wajib diisi.";
    }

    if (
      !form.alamat_pertama.trim()
    ) {
      newErrors.alamat_pertama =
        "Alamat wajib diisi.";
    }

    if (!form.dusun_pertama.trim()) {
      newErrors.dusun_pertama =
        "Dusun wajib diisi.";
    }

    if (!form.rt_pertama.trim()) {
      newErrors.rt_pertama =
        "RT wajib diisi.";
    }

    if (!form.rw_pertama.trim()) {
      newErrors.rw_pertama =
        "RW wajib diisi.";
    }

    if (
      !form.kewarganegaraan_pertama.trim()
    ) {
      newErrors.kewarganegaraan_pertama =
        "Kewarganegaraan wajib diisi.";
    }

    // ===================================================
    // CALON MAHASISWA
    // ===================================================

    if (!form.nik_kedua.trim()) {
      newErrors.nik_kedua =
        "NIK wajib diisi.";
    } else if (
      !/^\d{16}$/.test(
        form.nik_kedua
      )
    ) {
      newErrors.nik_kedua =
        "NIK harus terdiri dari 16 digit.";
    }

    if (!form.nama_kedua.trim()) {
      newErrors.nama_kedua =
        "Nama wajib diisi.";
    }

    if (
      !form.tempat_lahir_kedua.trim()
    ) {
      newErrors.tempat_lahir_kedua =
        "Tempat lahir wajib diisi.";
    }

    if (
      !form.tanggal_lahir_kedua
    ) {
      newErrors.tanggal_lahir_kedua =
        "Tanggal lahir wajib diisi.";
    }

    if (!form.prodi_kedua.trim()) {
      newErrors.prodi_kedua =
        "Program studi wajib diisi.";
    }

    if (!form.alamat_kedua.trim()) {
      newErrors.alamat_kedua =
        "Alamat wajib diisi.";
    }

    // ===================================================
    // FILE KTP
    // ===================================================

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

    // ===================================================
    // DATA ORANG PERTAMA
    // ===================================================

    formData.append(
      "nik_pertama",
      form.nik_pertama
    );

    formData.append(
      "nama_pertama",
      form.nama_pertama
    );

    formData.append(
      "ttl_pertama",
      `${form.tempat_lahir_pertama}, ${form.tanggal_lahir_pertama}`
    );

    formData.append(
      "agama_pertama",
      form.agama_pertama
    );

    formData.append(
      "jenis_kelamin_pertama",
      form.jenis_kelamin_pertama
    );

    formData.append(
      "status_perkawinan_pertama",
      form.status_perkawinan_pertama
    );

    formData.append(
      "pekerjaan_pertama",
      form.pekerjaan_pertama
    );

    formData.append(
      "alamat_pertama",
      form.alamat_pertama
    );

    formData.append(
      "dusun_pertama",
      form.dusun_pertama
    );

    formData.append(
      "rt_pertama",
      form.rt_pertama
    );

    formData.append(
      "rw_pertama",
      form.rw_pertama
    );

    formData.append(
      "kewarganegaraan_pertama",
      form.kewarganegaraan_pertama
    );

    // ===================================================
    // DATA CALON MAHASISWA
    // ===================================================

    formData.append(
      "nik_kedua",
      form.nik_kedua
    );

    formData.append(
      "nama_kedua",
      form.nama_kedua
    );

    formData.append(
      "ttl_kedua",
      `${form.tempat_lahir_kedua}, ${form.tanggal_lahir_kedua}`
    );

    formData.append(
      "prodi_kedua",
      form.prodi_kedua
    );

    formData.append(
      "alamat_kedua",
      form.alamat_kedua
    );

    // ===================================================
    // FILE KTP
    // ===================================================

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

    // ===================================================
    // ADMIN
    // ===================================================

    if (
      role === "admin" &&
      onSubmit
    ) {
      await onSubmit(
        formData
      );

      return;
    }

    // ===================================================
    // USER
    // ===================================================

    try {
      const url =
        mode === "edit"
          ? `/api/pengajuan/tidak-berlanggan-air/${initialData.id}`
          : "/api/pengajuan/tidak-berlanggan-air";

      const method =
        mode === "edit"
          ? "PUT"
          : "POST";

      const res =
        await fetch(
          url,
          {
            method,
            body: formData,
          }
        );

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

      if (
        mode === "edit"
      ) {
        toast.success(
          "Perbaikan berhasil dikirim."
        );

        window.location.href =
          `/tracking/${initialData.kode_tracking}`;
      } else {
        window.location.href =
          `/success/${json.kode_tracking}`;
      }
    } catch (error) {
      console.error(error);

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

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="pengajuan-hero">
        <div className="pengajuan-hero-content">

          <h1>
            {mode === "create"
              ? "Surat Keterangan Tidak Berlangganan Air PDAM dan Telepon"
              : "Perbaiki Pengajuan Surat Keterangan Tidak Berlangganan Air PDAM dan Telepon"}
          </h1>

          <p>
            {mode === "create"
              ? "Lengkapi data di bawah ini dengan benar sebelum mengajukan surat."
              : "Perbaiki data sesuai catatan Admin kemudian kirim kembali."}
          </p>

        </div>
      </section>

      <section className="pengajuan-content">

        <div className="pengajuan-card">

          {/* ================================================= */}
          {/* ALERT PENOLAKAN */}
          {/* ================================================= */}

          {mode === "edit" && (
            <div
              className="reject-alert"
              style={{
                background: "#fff7ed",
                border:
                  "1px solid #fdba74",
                borderLeft:
                  "6px solid #f97316",
                borderRadius: 12,
                padding: 18,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
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
                      margin:
                        "10px 0 4px",
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
                    {
                      initialData.alasan_penolakan
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
          >

            {/* ================================================= */}
            {/* DATA ORANG TUA / WALI */}
            {/* ================================================= */}

            <h3 className="mb-4 font-semibold text-lg">
              Data Orang Tua / Wali
            </h3>

            <InputField
              label="NIK"
              name="nik_pertama"
              value={
                form.nik_pertama
              }
              onChange={
                handleChange
              }
              placeholder="Masukkan NIK 16 digit"
            />

            {lookupPertama && (
              <p
                style={{
                  marginTop: -12,
                  marginBottom: 16,
                  fontSize: 14,
                  color:
                    lookupPertama.includes(
                      "ditemukan"
                    )
                      ? "#16a34a"
                      : "#6b7280",
                }}
              >
                {lookupPertama}
              </p>
            )}

            {errors.nik_pertama && (
              <p className="form-error">
                {errors.nik_pertama}
              </p>
            )}

            <InputField
              label="Nama Lengkap"
              name="nama_pertama"
              value={
                form.nama_pertama
              }
              onChange={
                handleChange
              }
              placeholder="Masukkan nama lengkap"
            />

            {errors.nama_pertama && (
              <p className="form-error">
                {errors.nama_pertama}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir_pertama"
                value={
                  form.tempat_lahir_pertama
                }
                onChange={
                  handleChange
                }
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir_pertama"
                type="date"
                value={
                  form.tanggal_lahir_pertama
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {errors.tempat_lahir_pertama && (
              <p className="form-error">
                {
                  errors.tempat_lahir_pertama
                }
              </p>
            )}

            {errors.tanggal_lahir_pertama && (
              <p className="form-error">
                {
                  errors.tanggal_lahir_pertama
                }
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">

              <SelectField
                label="Agama"
                name="agama_pertama"
                value={
                  form.agama_pertama
                }
                onChange={
                  handleChange
                }
                options={[
                  "Islam",
                  "Kristen",
                  "Katolik",
                  "Hindu",
                  "Buddha",
                  "Konghucu",
                ]}
              />

              <SelectField
                label="Jenis Kelamin"
                name="jenis_kelamin_pertama"
                value={
                  form.jenis_kelamin_pertama
                }
                onChange={
                  handleChange
                }
                options={[
                  "Laki-laki",
                  "Perempuan",
                ]}
              />

            </div>

            {errors.agama_pertama && (
              <p className="form-error">
                {errors.agama_pertama}
              </p>
            )}

            {errors.jenis_kelamin_pertama && (
              <p className="form-error">
                {
                  errors.jenis_kelamin_pertama
                }
              </p>
            )}

            <SelectField
              label="Status Perkawinan"
              name="status_perkawinan_pertama"
              value={
                form.status_perkawinan_pertama
              }
              onChange={
                handleChange
              }
              options={[
                "Belum Kawin",
                "Kawin",
                "Cerai Hidup",
                "Cerai Mati",
              ]}
            />

            {errors.status_perkawinan_pertama && (
              <p className="form-error">
                {
                  errors.status_perkawinan_pertama
                }
              </p>
            )}

            <InputField
              label="Pekerjaan"
              name="pekerjaan_pertama"
              value={
                form.pekerjaan_pertama
              }
              onChange={
                handleChange
              }
              placeholder="Masukkan pekerjaan"
            />

            {errors.pekerjaan_pertama && (
              <p className="form-error">
                {
                  errors.pekerjaan_pertama
                }
              </p>
            )}

            <InputField
              label="Alamat"
              name="alamat_pertama"
              value={
                form.alamat_pertama
              }
              onChange={
                handleChange
              }
              placeholder="Masukkan alamat lengkap"
              textarea
            />

            {errors.alamat_pertama && (
              <p className="form-error">
                {errors.alamat_pertama}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4">

              <InputField
                label="Dusun"
                name="dusun_pertama"
                value={
                  form.dusun_pertama
                }
                onChange={
                  handleChange
                }
                placeholder="Dusun"
              />

              <InputField
                label="RT"
                name="rt_pertama"
                value={
                  form.rt_pertama
                }
                onChange={
                  handleChange
                }
                placeholder="RT"
              />

              <InputField
                label="RW"
                name="rw_pertama"
                value={
                  form.rw_pertama
                }
                onChange={
                  handleChange
                }
                placeholder="RW"
              />

            </div>

            {errors.dusun_pertama && (
              <p className="form-error">
                {errors.dusun_pertama}
              </p>
            )}

            {errors.rt_pertama && (
              <p className="form-error">
                {errors.rt_pertama}
              </p>
            )}

            {errors.rw_pertama && (
              <p className="form-error">
                {errors.rw_pertama}
              </p>
            )}

            <InputField
              label="Kewarganegaraan"
              name="kewarganegaraan_pertama"
              value={
                form.kewarganegaraan_pertama
              }
              onChange={
                handleChange
              }
              placeholder="Contoh: WNI"
            />

            {errors.kewarganegaraan_pertama && (
              <p className="form-error">
                {
                  errors.kewarganegaraan_pertama
                }
              </p>
            )}

            <hr className="my-8" />

            {/* ================================================= */}
            {/* DATA CALON MAHASISWA */}
            {/* ================================================= */}

            <h3 className="mb-4 font-semibold text-lg">
              Data Calon Mahasiswa
            </h3>

            <InputField
              label="NIK"
              name="nik_kedua"
              value={
                form.nik_kedua
              }
              onChange={
                handleChange
              }
              placeholder="Masukkan NIK 16 digit"
            />

            {lookupKedua && (
              <p
                style={{
                  marginTop: -12,
                  marginBottom: 16,
                  fontSize: 14,
                  color:
                    lookupKedua.includes(
                      "ditemukan"
                    )
                      ? "#16a34a"
                      : "#6b7280",
                }}
              >
                {lookupKedua}
              </p>
            )}

            {errors.nik_kedua && (
              <p className="form-error">
                {errors.nik_kedua}
              </p>
            )}

            <InputField
              label="Nama Lengkap"
              name="nama_kedua"
              value={
                form.nama_kedua
              }
              onChange={
                handleChange
              }
              placeholder="Masukkan nama lengkap"
            />

            {errors.nama_kedua && (
              <p className="form-error">
                {errors.nama_kedua}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir_kedua"
                value={
                  form.tempat_lahir_kedua
                }
                onChange={
                  handleChange
                }
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir_kedua"
                type="date"
                value={
                  form.tanggal_lahir_kedua
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {errors.tempat_lahir_kedua && (
              <p className="form-error">
                {
                  errors.tempat_lahir_kedua
                }
              </p>
            )}

            {errors.tanggal_lahir_kedua && (
              <p className="form-error">
                {
                  errors.tanggal_lahir_kedua
                }
              </p>
            )}

            <InputField
              label="Program Studi"
              name="prodi_kedua"
              value={
                form.prodi_kedua
              }
              onChange={
                handleChange
              }
              placeholder="Masukkan program studi"
            />

            {errors.prodi_kedua && (
              <p className="form-error">
                {errors.prodi_kedua}
              </p>
            )}

            <InputField
              label="Alamat"
              name="alamat_kedua"
              value={
                form.alamat_kedua
              }
              onChange={
                handleChange
              }
              placeholder="Masukkan alamat lengkap"
              textarea
            />

            {errors.alamat_kedua && (
              <p className="form-error">
                {errors.alamat_kedua}
              </p>
            )}

            <hr className="my-8" />

            {/* ================================================= */}
            {/* FILE KTP */}
            {/* ================================================= */}

            <FileUploadField
              label={
                role === "admin"
                  ? "Upload KTP Orang Tua / Wali (Opsional)"
                  : "Upload KTP Orang Tua / Wali"
              }
              accept="image/jpeg,image/png"
              onChange={(
                file: File | null
              ) =>
                setFileKtp(file)
              }
            />

            {mode === "edit" &&
              initialData?.dokumen
                ?.file_ktp && (
                <div
                  style={{
                    marginTop: 8,
                    marginBottom: 16,
                    fontSize: 14,
                  }}
                >
                  File saat ini :
                  <a
                    href={`/uploads/ktp/${initialData.dokumen.file_ktp}`}
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

            {/* ================================================= */}
            {/* SUBMIT */}
            {/* ================================================= */}

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