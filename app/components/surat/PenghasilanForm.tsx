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

export default function PenghasilanForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {

  const [form, setForm] = useState({

    // Kepala Keluarga
    nama_kepala_keluarga: "",
    tempat_lahir_kepala: "",
    tanggal_lahir_kepala: "",
    nik_kepala_keluarga: "",
    jenis_kelamin_kepala_keluarga: "",
    kewarganegaraan_kepala_keluarga: "",
    agama_kepala_keluarga: "",
    pekerjaan_kepala_keluarga: "",
    alamat_kepala_keluarga: "",

    // Anak
    nama_anak: "",
    tempat_lahir_anak: "",
    tanggal_lahir_anak: "",
    nik_anak: "",
    jenis_kelamin_anak: "",
    kewarganegaraan_anak: "",
    agama_anak: "",
    pekerjaan_anak: "",
    alamat_anak: "",

    // Penghasilan
    penghasilan: "",

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

    const ttlKepala =
      initialData.ttl_kepala_keluarga?.split(",") ?? [];

    const ttlAnak =
      initialData.ttl_anak?.split(",") ?? [];

    setForm({

      nama_kepala_keluarga:
        initialData.nama_kepala_keluarga ?? "",

      tempat_lahir_kepala:
        ttlKepala[0]?.trim() ?? "",

      tanggal_lahir_kepala:
        ttlKepala[1]?.trim() ?? "",

      nik_kepala_keluarga:
        initialData.nik_kepala_keluarga ?? "",

      jenis_kelamin_kepala_keluarga:
        initialData.jenis_kelamin_kepala_keluarga ?? "",

      kewarganegaraan_kepala_keluarga:
        initialData.kewarganegaraan_kepala_keluarga ?? "",

      agama_kepala_keluarga:
        initialData.agama_kepala_keluarga ?? "",

      pekerjaan_kepala_keluarga:
        initialData.pekerjaan_kepala_keluarga ?? "",

      alamat_kepala_keluarga:
        initialData.alamat_kepala_keluarga ?? "",

      nama_anak:
        initialData.nama_anak ?? "",

      tempat_lahir_anak:
        ttlAnak[0]?.trim() ?? "",

      tanggal_lahir_anak:
        ttlAnak[1]?.trim() ?? "",

      nik_anak:
        initialData.nik_anak ?? "",

      jenis_kelamin_anak:
        initialData.jenis_kelamin_anak ?? "",

      kewarganegaraan_anak:
        initialData.kewarganegaraan_anak ?? "",

      agama_anak:
        initialData.agama_anak ?? "",

      pekerjaan_anak:
        initialData.pekerjaan_anak ?? "",

      alamat_anak:
        initialData.alamat_anak ?? "",

      penghasilan:
        initialData.penghasilan ?? "",

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
      [e.target.name]: e.target.value,
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
      !/^\d{16}$/.test(form.nik_kepala_keluarga)
    ) {
      newErrors.nik_kepala_keluarga =
        "NIK harus terdiri dari 16 digit.";
    }

    if (
      !/^\d{16}$/.test(form.nik_anak)
    ) {
      newErrors.nik_anak =
        "NIK harus terdiri dari 16 digit.";
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
    // Kepala Keluarga
    // ==========================

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
      "pekerjaan_kepala_keluarga",
      form.pekerjaan_kepala_keluarga
    );

    formData.append(
      "alamat_kepala_keluarga",
      form.alamat_kepala_keluarga
    );

    // ==========================
    // Anak
    // ==========================

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
      "pekerjaan_anak",
      form.pekerjaan_anak
    );

    formData.append(
      "alamat_anak",
      form.alamat_anak
    );

    // ==========================
    // Penghasilan
    // ==========================

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

  // ==========================
  // RENDER
  // ==========================

  return (

    <div className="pengajuan-page">

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
                DATA KEPALA KELUARGA
            ========================== */}

            <h3 className="form-section-title">
              Data Kepala Keluarga
            </h3>

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

            <InputField
              label="NIK"
              name="nik_kepala_keluarga"
              value={form.nik_kepala_keluarga}
              onChange={handleChange}
              placeholder="Masukkan NIK"
            />

            {errors.nik_kepala_keluarga && (
              <p className="form-error">
                {errors.nik_kepala_keluarga}
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

                        {/* ==========================
                DATA ANAK
            ========================== */}

            <h3 className="form-section-title">
              Data Anak
            </h3>

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

            <InputField
              label="NIK"
              name="nik_anak"
              value={form.nik_anak}
              onChange={handleChange}
              placeholder="Masukkan NIK"
            />

            {errors.nik_anak && (
              <p className="form-error">
                {errors.nik_anak}
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
                        {/* ==========================
                DATA PENGHASILAN
            ========================== */}

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

            <FileUploadField
              label="Upload KTP"
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