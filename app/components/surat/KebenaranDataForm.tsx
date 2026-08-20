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

export default function KebenaranDataForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {

  const [form, setForm] = useState({
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    nik: "",
    jenis_kelamin: "",
    status_perkawinan: "",
    alamat: "",
    no_hp: "",
    nomor_porsi: "",
    bin_binti: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [fileKk, setFileKk] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  // ==========================
  // LOAD DATA EDIT
  // ==========================

  useEffect(() => {

    if (
      mode !== "edit" ||
      !initialData
    ) {
      return;
    }

    const ttl =
      initialData.ttl?.split(",") ?? [];

    setForm({

      nama:
        initialData.nama ?? "",

      tempat_lahir:
        ttl[0]?.trim() ?? "",

      tanggal_lahir:
        ttl[1]?.trim() ?? "",

      nik:
        initialData.nik ?? "",

      jenis_kelamin:
        initialData.jenis_kelamin ?? "",

      status_perkawinan:
        initialData.status_perkawinan ?? "",

      alamat:
        initialData.alamat ?? "",

      no_hp:
        initialData.no_hp ?? "",

      nomor_porsi:
        initialData.nomor_porsi ?? "",

      bin_binti:
        initialData.bin_binti ?? "",

    });

  }, [mode, initialData]);

  // ==========================
  // HANDLE INPUT
  // ==========================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) {

    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));

  }

  // ==========================
  // VALIDASI
  // ==========================

  function validateForm() {

    const newErrors:
      Record<string, string> = {};

    if (!form.nama.trim()) {
      newErrors.nama =
        "Nama wajib diisi.";
    }

    if (!form.tempat_lahir.trim()) {
      newErrors.tempat_lahir =
        "Tempat lahir wajib diisi.";
    }

    if (!form.tanggal_lahir) {
      newErrors.tanggal_lahir =
        "Tanggal lahir wajib diisi.";
    }

    if (!form.nik.trim()) {
      newErrors.nik =
        "NIK wajib diisi.";
    } else if (
      !/^\d{16}$/.test(form.nik)
    ) {
      newErrors.nik =
        "NIK harus terdiri dari 16 digit.";
    }

    if (!form.jenis_kelamin) {
      newErrors.jenis_kelamin =
        "Pilih jenis kelamin.";
    }

    if (!form.status_perkawinan) {
      newErrors.status_perkawinan =
        "Pilih status perkawinan.";
    }

    if (!form.alamat.trim()) {
      newErrors.alamat =
        "Alamat wajib diisi.";
    }

    if (!form.no_hp.trim()) {
      newErrors.no_hp =
        "Nomor HP wajib diisi.";
    }

    if (!form.nomor_porsi.trim()) {
      newErrors.nomor_porsi =
        "Nomor porsi wajib diisi.";
    }

    if (!form.bin_binti.trim()) {
      newErrors.bin_binti =
        "Bin / Binti wajib diisi.";
    }

    if (
      mode === "create" &&
      !fileKtp
    ) {
      newErrors.file_ktp =
        "Silakan upload KTP.";
    }

    if (
      mode === "create" &&
      !fileKk
    ) {
      newErrors.file_kk =
        "Silakan upload KK.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );

  }

    // ==========================
  // HANDLE SUBMIT
  // ==========================

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData =
      new FormData();

    formData.append(
      "nama",
      form.nama
    );

    formData.append(
      "ttl",
      `${form.tempat_lahir}, ${form.tanggal_lahir}`
    );

    formData.append(
      "nik",
      form.nik
    );

    formData.append(
      "jenis_kelamin",
      form.jenis_kelamin
    );

    formData.append(
      "status_perkawinan",
      form.status_perkawinan
    );

    formData.append(
      "alamat",
      form.alamat
    );

    formData.append(
      "no_hp",
      form.no_hp
    );

    formData.append(
      "nomor_porsi",
      form.nomor_porsi
    );

    formData.append(
      "bin_binti",
      form.bin_binti
    );

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

    if (fileKk) {
      formData.append(
        "file_kk",
        fileKk
      );
    }

    if (
      role === "admin" &&
      onSubmit
    ) {
      await onSubmit(formData);
      return;
    }

    try {

      const url =
        mode === "edit"
          ? `/api/pengajuan/kebenaran-data/${initialData.id}`
          : "/api/pengajuan/kebenaran-data";

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
      setFileKk(null);

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

  // ==========================
  // RENDER
  // ==========================

  return (
    <div className="pengajuan-page">

      <section className="pengajuan-hero">

        <div className="pengajuan-hero-content">

          <h1>
            {mode === "create"
              ? "Surat Keterangan Kebenaran Data"
              : "Perbaiki Pengajuan Surat Keterangan Kebenaran Data"}
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

            <InputField
              label="Nama Lengkap"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
            />

            {errors.nama && (
              <p className="form-error">
                {errors.nama}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir"
                value={form.tempat_lahir}
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir"
                type="date"
                value={form.tanggal_lahir}
                onChange={handleChange}
              />

            </div>

            {errors.tempat_lahir && (
              <p className="form-error">
                {errors.tempat_lahir}
              </p>
            )}

            {errors.tanggal_lahir && (
              <p className="form-error">
                {errors.tanggal_lahir}
              </p>
            )}

            <InputField
              label="NIK"
              name="nik"
              value={form.nik}
              onChange={handleChange}
              placeholder="Masukkan NIK"
            />

            {errors.nik && (
              <p className="form-error">
                {errors.nik}
              </p>
            )}

            <SelectField
              label="Jenis Kelamin"
              name="jenis_kelamin"
              value={form.jenis_kelamin}
              onChange={handleChange}
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
            />

            {errors.jenis_kelamin && (
              <p className="form-error">
                {errors.jenis_kelamin}
              </p>
            )}

            <SelectField
              label="Status Perkawinan"
              name="status_perkawinan"
              value={form.status_perkawinan}
              onChange={handleChange}
              options={[
                "Belum Kawin",
                "Kawin",
                "Cerai Hidup",
                "Cerai Mati",
              ]}
            />

            {errors.status_perkawinan && (
              <p className="form-error">
                {errors.status_perkawinan}
              </p>
            )}

            <InputField
              label="Alamat"
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap"
              textarea
            />

            {errors.alamat && (
              <p className="form-error">
                {errors.alamat}
              </p>
            )}

                        <InputField
              label="Nomor HP"
              name="no_hp"
              value={form.no_hp}
              onChange={handleChange}
              placeholder="Masukkan nomor HP"
            />

            {errors.no_hp && (
              <p className="form-error">
                {errors.no_hp}
              </p>
            )}

            <InputField
              label="Nomor Porsi"
              name="nomor_porsi"
              value={form.nomor_porsi}
              onChange={handleChange}
              placeholder="Masukkan nomor porsi"
            />

            {errors.nomor_porsi && (
              <p className="form-error">
                {errors.nomor_porsi}
              </p>
            )}

            <InputField
              label="Bin / Binti"
              name="bin_binti"
              value={form.bin_binti}
              onChange={handleChange}
              placeholder="Masukkan nama Bin / Binti"
            />

            {errors.bin_binti && (
              <p className="form-error">
                {errors.bin_binti}
              </p>
            )}

            <FileUploadField
              label="Upload KTP"
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
                File KTP saat ini :
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

            <FileUploadField
              label="Upload KK"
              accept="image/jpeg,image/png"
              onChange={(file: File | null) =>
                setFileKk(file)
              }
            />

            {mode === "edit" &&
              initialData?.dokumen?.file_kk && (

              <div
                style={{
                  marginTop: 8,
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                File KK saat ini :
                <a
                  href={`/uploads/kk/${initialData.dokumen.file_kk}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginLeft: 8,
                  }}
                >
                  Lihat KK
                </a>
              </div>

            )}

            {errors.file_kk && (
              <p className="form-error">
                {errors.file_kk}
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