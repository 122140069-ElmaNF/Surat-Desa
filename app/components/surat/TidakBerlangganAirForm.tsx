"use client";

import { useEffect, useState } from "react";
import InputField from "@/app/components/form/InputField";
import FileUploadField from "@/app/components/form/FileUploadField";
import SubmitButton from "@/app/components/form/SubmitButton";

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

  console.log(initialData);

  const [form, setForm] = useState({

    // ======================
    // DATA ORANG TUA / WALI
    // ======================

    nama_pertama: "",
    tempat_lahir_pertama: "",
    tanggal_lahir_pertama: "",
    nik_pertama: "",
    status_perkawinan_pertama: "",
    pekerjaan_pertama: "",
    alamat_pertama: "",

    // ======================
    // DATA CALON MAHASISWA
    // ======================

    nama_kedua: "",
    tempat_lahir_kedua: "",
    tanggal_lahir_kedua: "",
    nik_kedua: "",
    prodi_kedua: "",
    alamat_kedua: "",

  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  // ======================
  // LOAD DATA SAAT EDIT
  // ======================

  useEffect(() => {

    if (
      mode !== "edit" ||
      !initialData
    ) {
      return;
    }

    const ttlPertama =
      initialData.ttl_pertama?.split(",") ?? [];

    const ttlKedua =
      initialData.ttl_kedua?.split(",") ?? [];

    setForm({

      // ======================
      // DATA ORANG TUA / WALI
      // ======================

      nama_pertama:
        initialData.nama_pertama ?? "",

      tempat_lahir_pertama:
        ttlPertama[0]?.trim() ?? "",

      tanggal_lahir_pertama:
        ttlPertama[1]?.trim() ?? "",

      nik_pertama:
        initialData.nik_pertama ?? "",

      status_perkawinan_pertama:
        initialData.status_perkawinan_pertama ?? "",

      pekerjaan_pertama:
        initialData.pekerjaan_pertama ?? "",

      alamat_pertama:
        initialData.alamat_pertama ?? "",

      // ======================
      // DATA CALON MAHASISWA
      // ======================

      nama_kedua:
        initialData.nama_kedua ?? "",

      tempat_lahir_kedua:
        ttlKedua[0]?.trim() ?? "",

      tanggal_lahir_kedua:
        ttlKedua[1]?.trim() ?? "",

      nik_kedua:
        initialData.nik_kedua ?? "",

      prodi_kedua:
        initialData.prodi_kedua ?? "",

      alamat_kedua:
        initialData.alamat_kedua ?? "",

    });

  }, [mode, initialData]);

  // ======================
  // HANDLE INPUT
  // ======================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) {

    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));

  }
    // ======================
  // VALIDASI FORM
  // ======================

  function validateForm() {

    const newErrors:
      Record<string, string> = {};

    // ======================
    // DATA ORANG TUA / WALI
    // ======================

    if (!form.nama_pertama.trim()) {
      newErrors.nama_pertama =
        "Nama wajib diisi.";
    }

    if (!form.tempat_lahir_pertama.trim()) {
      newErrors.tempat_lahir_pertama =
        "Tempat lahir wajib diisi.";
    }

    if (!form.tanggal_lahir_pertama) {
      newErrors.tanggal_lahir_pertama =
        "Tanggal lahir wajib diisi.";
    }

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

    if (
      !form.status_perkawinan_pertama.trim()
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

    // ======================
    // DATA CALON MAHASISWA
    // ======================

    if (!form.nama_kedua.trim()) {
      newErrors.nama_kedua =
        "Nama wajib diisi.";
    }

    if (!form.tempat_lahir_kedua.trim()) {
      newErrors.tempat_lahir_kedua =
        "Tempat lahir wajib diisi.";
    }

    if (!form.tanggal_lahir_kedua) {
      newErrors.tanggal_lahir_kedua =
        "Tanggal lahir wajib diisi.";
    }

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

    if (!form.prodi_kedua.trim()) {
      newErrors.prodi_kedua =
        "Program studi wajib diisi.";
    }

    if (!form.alamat_kedua.trim()) {
      newErrors.alamat_kedua =
        "Alamat wajib diisi.";
    }

    // ======================
    // FILE KTP
    // ======================

    if (
      mode === "create" &&
      !fileKtp
    ) {
      newErrors.file_ktp =
        "Silakan upload KTP.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );

  }
    // ======================
  // HANDLE SUBMIT
  // ======================

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (!validateForm())
      return;

    const formData =
      new FormData();

    // ======================
    // DATA ORANG TUA / WALI
    // ======================

    formData.append(
      "nama_pertama",
      form.nama_pertama
    );

    formData.append(
      "ttl_pertama",
      `${form.tempat_lahir_pertama}, ${form.tanggal_lahir_pertama}`
    );

    formData.append(
      "nik_pertama",
      form.nik_pertama
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

    // ======================
    // DATA CALON MAHASISWA
    // ======================

    formData.append(
      "nama_kedua",
      form.nama_kedua
    );

    formData.append(
      "ttl_kedua",
      `${form.tempat_lahir_kedua}, ${form.tanggal_lahir_kedua}`
    );

    formData.append(
      "nik_kedua",
      form.nik_kedua
    );

    formData.append(
      "prodi_kedua",
      form.prodi_kedua
    );

    formData.append(
      "alamat_kedua",
      form.alamat_kedua
    );

    if (fileKtp) {

      formData.append(
        "file_ktp",
        fileKtp
      );

    }

    if (
      role === "admin" &&
      onSubmit
    ) {

      await onSubmit(
        formData
      );

      return;

    }

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

        alert(
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

        alert(
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

      alert(
        "Terjadi kesalahan server."
      );

    }

  }
    // ======================
  // RENDER
  // ======================

  return (
    <div className="pengajuan-page">

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

          {mode === "edit" && (

            <div className="reject-alert">

              <h3>
                Pengajuan Ditolak
              </h3>

              <p>
                <strong>
                  Alasan Penolakan :
                </strong>
              </p>

              <p>
                {initialData.alasan_penolakan}
              </p>

            </div>

          )}

          <form onSubmit={handleSubmit}>

            {/* ====================== */}
            {/* DATA ORANG TUA / WALI */}
            {/* ====================== */}

            <h3 className="mb-4 font-semibold text-lg">
              Data Orang Tua / Wali
            </h3>

            <InputField
              label="Nama Lengkap"
              name="nama_pertama"
              value={form.nama_pertama}
              onChange={handleChange}
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
                value={form.tempat_lahir_pertama}
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir_pertama"
                type="date"
                value={form.tanggal_lahir_pertama}
                onChange={handleChange}
              />

            </div>

            {errors.tanggal_lahir_pertama && (
              <p className="form-error">
                {errors.tanggal_lahir_pertama}
              </p>
            )}

            <InputField
              label="NIK"
              name="nik_pertama"
              value={form.nik_pertama}
              onChange={handleChange}
              placeholder="Masukkan NIK"
            />

            {errors.nik_pertama && (
              <p className="form-error">
                {errors.nik_pertama}
              </p>
            )}

            <InputField
              label="Status Perkawinan"
              name="status_perkawinan_pertama"
              value={form.status_perkawinan_pertama}
              onChange={handleChange}
              placeholder="Contoh : Kawin"
            />

            {errors.status_perkawinan_pertama && (
              <p className="form-error">
                {errors.status_perkawinan_pertama}
              </p>
            )}

            <InputField
              label="Pekerjaan"
              name="pekerjaan_pertama"
              value={form.pekerjaan_pertama}
              onChange={handleChange}
              placeholder="Masukkan pekerjaan"
            />

            {errors.pekerjaan_pertama && (
              <p className="form-error">
                {errors.pekerjaan_pertama}
              </p>
            )}

            <InputField
              label="Alamat"
              name="alamat_pertama"
              value={form.alamat_pertama}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap"
              textarea
            />

            {errors.alamat_pertama && (
              <p className="form-error">
                {errors.alamat_pertama}
              </p>
            )}

            <hr className="my-8" />

            {/* ====================== */}
            {/* DATA CALON MAHASISWA */}
            {/* ====================== */}

            <h3 className="mb-4 font-semibold text-lg">
              Data Calon Mahasiswa
            </h3>

            <InputField
              label="Nama Lengkap"
              name="nama_kedua"
              value={form.nama_kedua}
              onChange={handleChange}
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
                value={form.tempat_lahir_kedua}
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir_kedua"
                type="date"
                value={form.tanggal_lahir_kedua}
                onChange={handleChange}
              />

            </div>

            {errors.tanggal_lahir_kedua && (
              <p className="form-error">
                {errors.tanggal_lahir_kedua}
              </p>
            )}

            <InputField
              label="NIK"
              name="nik_kedua"
              value={form.nik_kedua}
              onChange={handleChange}
              placeholder="Masukkan NIK"
            />

            {errors.nik_kedua && (
              <p className="form-error">
                {errors.nik_kedua}
              </p>
            )}

            <InputField
              label="Program Studi"
              name="prodi_kedua"
              value={form.prodi_kedua}
              onChange={handleChange}
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
              value={form.alamat_kedua}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap"
              textarea
            />

            {errors.alamat_kedua && (
              <p className="form-error">
                {errors.alamat_kedua}
              </p>
            )}

            <hr className="my-8" />

            <FileUploadField
              label="Upload KTP Orang Tua / Wali"
              accept="image/jpeg,image/png"
              onChange={(file: File | null) =>
                setFileKtp(file)
              }
            />

            {mode === "edit" &&
              initialData?.dokumen?.file_ktp && (

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