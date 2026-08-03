"use client";

import { useEffect, useState } from "react";
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

export default function IzinKeramaianForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {

  console.log(initialData);

  const [form, setForm] = useState({
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    nik: "",
    agama: "",
    jenis_kelamin: "",
    kewarganegaraan: "",
    pekerjaan: "",
    alamat: "",
    jenis_kegiatan: "",
    tanggal_kegiatan: "",
    jam_kegiatan: "",
    acara: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  // ===============================
  // LOAD DATA SAAT EDIT
  // ===============================

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

      kewarganegaraan:
        initialData.kewarganegaraan ?? "",

      pekerjaan:
        initialData.pekerjaan ?? "",

      alamat:
        initialData.alamat ?? "",

      jenis_kegiatan:
        initialData.jenis_kegiatan ?? "",

      tanggal_kegiatan:
        initialData.tanggal_kegiatan ?? "",

      jam_kegiatan:
        initialData.jam_kegiatan ?? "",

      acara:
        initialData.acara ?? "",
    });

  }, [mode, initialData]);

  // ===============================
  // HANDLE INPUT
  // ===============================

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

  // ===============================
  // VALIDASI
  // ===============================

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

    if (!form.agama) {
      newErrors.agama =
        "Pilih agama.";
    }

    if (!form.jenis_kelamin) {
      newErrors.jenis_kelamin =
        "Pilih jenis kelamin.";
    }

    if (!form.kewarganegaraan.trim()) {
      newErrors.kewarganegaraan =
        "Kewarganegaraan wajib diisi.";
    }

    if (!form.pekerjaan.trim()) {
      newErrors.pekerjaan =
        "Pekerjaan wajib diisi.";
    }

    if (!form.alamat.trim()) {
      newErrors.alamat =
        "Alamat wajib diisi.";
    }

    if (!form.jenis_kegiatan.trim()) {
      newErrors.jenis_kegiatan =
        "Jenis kegiatan wajib diisi.";
    }

    if (!form.tanggal_kegiatan) {
      newErrors.tanggal_kegiatan =
        "Tanggal kegiatan wajib diisi.";
    }

    if (!form.jam_kegiatan) {
      newErrors.jam_kegiatan =
        "Jam kegiatan wajib diisi.";
    }

    if (!form.acara.trim()) {
      newErrors.acara =
        "Acara wajib diisi.";
    }

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
    // ===============================
  // HANDLE SUBMIT
  // ===============================

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
      "kewarganegaraan",
      form.kewarganegaraan
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
      "jenis_kegiatan",
      form.jenis_kegiatan
    );

    formData.append(
      "tanggal_kegiatan",
      form.tanggal_kegiatan
    );

    formData.append(
      "jam_kegiatan",
      form.jam_kegiatan
    );

    formData.append(
      "acara",
      form.acara
    );

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

    // ===============================
    // ADMIN
    // ===============================

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
          ? `/api/pengajuan/izin-keramaian/${initialData.id}`
          : "/api/pengajuan/izin-keramaian";

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

        alert(
          json.message ??
          "Gagal menyimpan."
        );

        return;

      }

      setErrors({});

      setFileKtp(null);

      if (mode === "edit") {

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
    // ===============================
  // RENDER
  // ===============================

  return (
    <div className="pengajuan-page">
      <section className="pengajuan-hero">
        <div className="pengajuan-hero-content">
          <h1>
            {mode === "create"
              ? "Surat Pengantar Izin Keramaian"
              : "Perbaiki Pengajuan Surat Izin Keramaian"}
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

            <SelectField
              label="Kewarganegaraan"
              name="kewarganegaraan"
              value={form.kewarganegaraan}
              onChange={handleChange}
              options={[
                "WNI",
                "WNA",
              ]}
            />

            {errors.kewarganegaraan && (
              <p className="form-error">
                {errors.kewarganegaraan}
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
              label="Jenis Kegiatan"
              name="jenis_kegiatan"
              value={form.jenis_kegiatan}
              onChange={handleChange}
              placeholder="Contoh : Orgen Tunggal"
            />

            {errors.jenis_kegiatan && (
              <p className="form-error">
                {errors.jenis_kegiatan}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tanggal Kegiatan"
                name="tanggal_kegiatan"
                type="date"
                value={form.tanggal_kegiatan}
                onChange={handleChange}
              />

              <InputField
                label="Jam Kegiatan"
                name="jam_kegiatan"
                type="time"
                value={form.jam_kegiatan}
                onChange={handleChange}
              />

            </div>

            {errors.tanggal_kegiatan && (
              <p className="form-error">
                {errors.tanggal_kegiatan}
              </p>
            )}

            {errors.jam_kegiatan && (
              <p className="form-error">
                {errors.jam_kegiatan}
              </p>
            )}

            <InputField
              label="Acara"
              name="acara"
              value={form.acara}
              onChange={handleChange}
              placeholder="Contoh : Pernikahan"
            />

            {errors.acara && (
              <p className="form-error">
                {errors.acara}
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