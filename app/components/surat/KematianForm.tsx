"use client";

import { useEffect, useState } from "react";
import InputField from "@/app/components/form/InputField";
import FileUploadField from "@/app/components/form/FileUploadField";
import SelectField from "@/app/components/form/SelectField";
import SubmitButton from "@/app/components/form/SubmitButton";

type Props = {
  mode: "create" | "edit";
  initialData?: any;
  submitLabel?: string;
  role?: "user" | "admin";
  onSubmit?: (formData: FormData) => Promise<void>;
};

export default function KematianForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {

  const [form, setForm] = useState({

    nama: "",
    nik: "",
    jenis_kelamin: "",
    umur: "",
    agama: "",
    pekerjaan: "",
    alamat: "",

    hari: "",
    tanggal: "",
    jam: "",

    bertempat_di: "",
    penyebab: "",

    pelapor: "",
    hubungan_pelapor: "",

  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  useEffect(() => {

    if (
      mode !== "edit" ||
      !initialData
    ) {
      return;
    }

    setForm({

      nama:
        initialData.nama ?? "",

      nik:
        initialData.nik ?? "",

      jenis_kelamin:
        initialData.jenis_kelamin ?? "",

      umur:
        initialData.umur ?? "",

      agama:
        initialData.agama ?? "",

      pekerjaan:
        initialData.pekerjaan ?? "",

      alamat:
        initialData.alamat ?? "",

      hari:
        initialData.hari ?? "",

      tanggal:
        initialData.tanggal ?? "",

      jam:
        initialData.jam ?? "",

      bertempat_di:
        initialData.bertempat_di ?? "",

      penyebab:
        initialData.penyebab ?? "",

      pelapor:
        initialData.pelapor ?? "",

      hubungan_pelapor:
        initialData.hubungan_pelapor ?? "",

    });

  }, [mode, initialData]);

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

  function validateForm() {

    const newErrors:
      Record<string, string> = {};

    Object.entries(form).forEach(([key, value]) => {

      if (!String(value).trim()) {

        newErrors[key] =
          "Field ini wajib diisi.";

      }

    });

    if (
      !/^\d{16}$/.test(form.nik)
    ) {

      newErrors.nik =
        "NIK harus terdiri dari 16 digit.";
    }

    if (
      mode === "create" &&
      !fileKtp
    ) {

      newErrors.file_ktp =
        "Silakan upload KTP Almarhum/Almarhumah.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
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

    // ==========================
    // Data Jenazah
    // ==========================

    formData.append(
      "nama",
      form.nama
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
      "umur",
      form.umur
    );

    formData.append(
      "agama",
      form.agama
    );

    formData.append(
      "pekerjaan",
      form.pekerjaan
    );

    formData.append(
      "alamat",
      form.alamat
    );

    // ==========================
    // Data Kematian
    // ==========================

    formData.append(
      "hari",
      form.hari
    );

    formData.append(
      "tanggal",
      form.tanggal
    );

    formData.append(
      "jam",
      form.jam
    );

    formData.append(
      "bertempat_di",
      form.bertempat_di
    );

    formData.append(
      "penyebab",
      form.penyebab
    );

    // ==========================
    // Data Pelapor
    // ==========================

    formData.append(
      "pelapor",
      form.pelapor
    );

    formData.append(
      "hubungan_pelapor",
      form.hubungan_pelapor
    );

    if (fileKtp) {

      formData.append(
        "file_ktp",
        fileKtp
      );

    }

    // ==========================
    // ADMIN
    // ==========================

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
          ? `/api/pengajuan/kematian/${initialData.id}`
          : "/api/pengajuan/kematian";

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

  // ==========================
  // RENDER
  // ==========================

  return (

    <div className="pengajuan-page">

      <section className="pengajuan-hero">

        <div className="pengajuan-hero-content">

          <h1>

            {mode === "create"
              ? "Surat Keterangan Kematian"
              : "Perbaiki Pengajuan Surat Keterangan Kematian"}

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
                        {/* ==========================
                DATA JENAZAH
            ========================== */}

            <h3 className="form-section-title">
              Data Jenazah
            </h3>

            <InputField
              label="Nama"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan nama"
            />

            {errors.nama && (
              <p className="form-error">
                {errors.nama}
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

            <InputField
              label="Umur"
              name="umur"
              value={form.umur}
              onChange={handleChange}
              placeholder="Contoh : 55 Tahun"
            />

            {errors.umur && (
              <p className="form-error">
                {errors.umur}
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
                        {/* ==========================
                DATA KEMATIAN
            ========================== */}

            <h3 className="form-section-title">
              Data Kematian
            </h3>

            <InputField
              label="Hari"
              name="hari"
              value={form.hari}
              onChange={handleChange}
              placeholder="Contoh : Senin"
            />

            {errors.hari && (
              <p className="form-error">
                {errors.hari}
              </p>
            )}

            <InputField
              label="Tanggal"
              name="tanggal"
              type="date"
              value={form.tanggal}
              onChange={handleChange}
            />

            {errors.tanggal && (
              <p className="form-error">
                {errors.tanggal}
              </p>
            )}

            <InputField
              label="Jam"
              name="jam"
              type="time"
              value={form.jam}
              onChange={handleChange}
            />

            {errors.jam && (
              <p className="form-error">
                {errors.jam}
              </p>
            )}

            <InputField
              label="Bertempat di"
              name="bertempat_di"
              value={form.bertempat_di}
              onChange={handleChange}
              placeholder="Contoh : Rumah"
            />

            {errors.bertempat_di && (
              <p className="form-error">
                {errors.bertempat_di}
              </p>
            )}

            <InputField
              label="Penyebab Kematian"
              name="penyebab"
              value={form.penyebab}
              onChange={handleChange}
              placeholder="Contoh : Sakit"
            />

            {errors.penyebab && (
              <p className="form-error">
                {errors.penyebab}
              </p>
            )}
                        {/* ==========================
                DATA PELAPOR
            ========================== */}

            <h3 className="form-section-title">
              Data Pelapor
            </h3>

            <InputField
              label="Nama Pelapor"
              name="pelapor"
              value={form.pelapor}
              onChange={handleChange}
              placeholder="Masukkan nama pelapor"
            />

            {errors.pelapor && (
              <p className="form-error">
                {errors.pelapor}
              </p>
            )}

            <InputField
              label="Hubungan dengan Almarhum/Almarhumah"
              name="hubungan_pelapor"
              value={form.hubungan_pelapor}
              onChange={handleChange}
              placeholder="Contoh : Anak Kandung"
            />

            {errors.hubungan_pelapor && (
              <p className="form-error">
                {errors.hubungan_pelapor}
              </p>
            )}

            <FileUploadField
              label="Upload KTP Almarhum/Almarhumah"
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