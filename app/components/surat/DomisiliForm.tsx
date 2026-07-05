"use client";

import { useEffect, useState } from "react";
import InputField from "@/app/components/form/InputField";
import SelectField from "@/app/components/form/SelectField";
import FileUploadField from "@/app/components/form/FileUploadField";
import SubmitButton from "@/app/components/form/SubmitButton";

type Props = {
  mode: "create" | "edit";
  initialData?: any;
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  role?: "user" | "admin";
};

export default function DomisiliForm({
  mode,
  initialData,
  onSubmit,
  submitLabel,
  role = "user",
}: Props) {

  console.log(initialData);

  const [form, setForm] = useState({
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    nik: "",
    agama: "",
    jenis_kelamin: "",
    pekerjaan: "",
    alamat: "",
    dusun: "",
    rt: "",
    rw: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);
  const [errors, setErrors] =
    useState<Record<string, string>>({});

  // LOAD DATA SAAT MODE EDIT
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
      agama:
        initialData.agama ?? "",
      jenis_kelamin:
        initialData.jenis_kelamin ?? "",
      pekerjaan:
        initialData.pekerjaan ?? "",
      alamat:
        initialData.alamat ?? "",
      dusun:
        initialData.dusun ?? "",
      rt:
        initialData.rt ?? "",
      rw:
        initialData.rw ?? "",
    });
  }, [mode, initialData]);

  // HANDLE INPUT
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

  // VALIDASI FORM
  function validateForm() {

    const newErrors:
      Record<string, string> = {};

    if (!form.nama.trim()) {
      newErrors.nama =
        "Nama wajib diisi."
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

    if (!form.agama) {
      newErrors.agama =
        "Pilih agama.";
    }

    if (!form.jenis_kelamin) {
      newErrors.jenis_kelamin =
        "Pilih jenis kelamin.";
    }

    if (!form.pekerjaan.trim()) {
      newErrors.pekerjaan =
        "Pekerjaan wajib diisi.";
    }

    if (!form.alamat.trim()) {
      newErrors.alamat =
        "Alamat wajib diisi.";
    }

    if (!form.dusun.trim()) {
      newErrors.dusun =
        "Dusun wajib diisi.";
    }

    if (!form.rt.trim()) {
      newErrors.rt =
        "RT wajib diisi.";
    }

    if (!form.rw.trim()) {
      newErrors.rw =
        "RW wajib diisi.";
    }

    // Upload KTP hanya wajib saat create
    if (mode === "create" && !fileKtp) {
      newErrors.file_ktp = "Silakan upload KTP.";
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors)
        .length === 0
    );
  }

  // HANDLE SUBMIT
  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();
    if (!validateForm())
      return;

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
      "agama",
      form.agama
    );

    formData.append(
      "jenis_kelamin",
      form.jenis_kelamin
    );

    formData.append(
      "pekerjaan",
      form.pekerjaan
    );

    formData.append(
      "alamat",
      form.alamat
    );

    formData.append(
      "dusun",
      form.dusun
    );

    formData.append(
      "rt",
      form.rt
    );

    formData.append(
      "rw",
      form.rw
    );

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

try {
  await onSubmit(formData);

  setErrors({});
  setFileKtp(null);
          } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan server.");
          }
        }

  // RENDER
  return (
    <div className="pengajuan-page">
      <section className="pengajuan-hero">
        <div className="pengajuan-hero-content">
          <h1>
            {mode === "create"
              ? "Surat Keterangan Domisili"
              : "Perbaiki Pengajuan Surat Domisili"}
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

          {/* ALASAN PENOLAKAN */}

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
  label="Agama"
  name="agama"
  value={form.agama}
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

{errors.agama && (
  <p className="form-error">
    {errors.agama}
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

<InputField
  label="Pekerjaan"
  name="pekerjaan"
  value={form.pekerjaan}
  onChange={handleChange}
  placeholder="Masukkan pekerjaan"
/>

{errors.pekerjaan && (
  <p className="form-error">
    {errors.pekerjaan}
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
  label="Dusun"
  name="dusun"
  value={form.dusun}
  onChange={handleChange}
  placeholder="Contoh: Dusun I"
/>

{errors.dusun && (
  <p className="form-error">
    {errors.dusun}
  </p>
)}

  <FileUploadField
    label="Upload KTP"
    accept="image/*,.pdf"
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

<div className="grid grid-cols-2 gap-4">

  <InputField
    label="RT"
    name="rt"
    value={form.rt}
    onChange={handleChange}
    placeholder="001"
  />
  <InputField
    label="RW"
    name="rw"
    value={form.rw}
    onChange={handleChange}
    placeholder="002"
  />
</div>

{errors.rt && (
  <p className="form-error">
    {errors.rt}
  </p>
)}

{errors.rw && (
  <p className="form-error">
    {errors.rw}
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