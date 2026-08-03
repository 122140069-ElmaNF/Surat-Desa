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

export default function BedaNamaIdentitasForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {

  console.log(initialData);

  const [form, setForm] = useState({

    // ======================
    // IDENTITAS LAMA
    // ======================

    nama_lama: "",
    tempat_lahir_lama: "",
    tanggal_lahir_lama: "",
    nik_lama: "",
    jenis_kelamin_lama: "",
    pekerjaan_lama: "",
    alamat_lama: "",

    // ======================
    // IDENTITAS BARU
    // ======================

    nama_baru: "",
    tempat_lahir_baru: "",
    tanggal_lahir_baru: "",
    nik_baru: "",
    jenis_kelamin_baru: "",
    pekerjaan_baru: "",
    alamat_baru: "",

    // ======================
    // KETERANGAN
    // ======================

    isi_keterangan: "",

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

    const ttlLama =
      initialData.ttl_lama?.split(",") ?? [];

    const ttlBaru =
      initialData.ttl_baru?.split(",") ?? [];

    setForm({

      // ======================
      // IDENTITAS LAMA
      // ======================

      nama_lama:
        initialData.nama_lama ?? "",

      tempat_lahir_lama:
        ttlLama[0]?.trim() ?? "",

      tanggal_lahir_lama:
        ttlLama[1]?.trim() ?? "",

      nik_lama:
        initialData.nik_lama ?? "",

      jenis_kelamin_lama:
        initialData.jenis_kelamin_lama ?? "",

      pekerjaan_lama:
        initialData.pekerjaan_lama ?? "",

      alamat_lama:
        initialData.alamat_lama ?? "",

      // ======================
      // IDENTITAS BARU
      // ======================

      nama_baru:
        initialData.nama_baru ?? "",

      tempat_lahir_baru:
        ttlBaru[0]?.trim() ?? "",

      tanggal_lahir_baru:
        ttlBaru[1]?.trim() ?? "",

      nik_baru:
        initialData.nik_baru ?? "",

      jenis_kelamin_baru:
        initialData.jenis_kelamin_baru ?? "",

      pekerjaan_baru:
        initialData.pekerjaan_baru ?? "",

      alamat_baru:
        initialData.alamat_baru ?? "",

      // ======================
      // KETERANGAN
      // ======================

      isi_keterangan:
        initialData.isi_keterangan ?? "",

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

    // ======================
    // IDENTITAS LAMA
    // ======================

    if (!form.nama_lama.trim()) {
      newErrors.nama_lama =
        "Nama lama wajib diisi.";
    }

    if (!form.tempat_lahir_lama.trim()) {

      newErrors.tempat_lahir_lama =
        "Tempat lahir wajib diisi.";

    }

    if (!form.tanggal_lahir_lama) {

      newErrors.tanggal_lahir_lama =
        "Tanggal lahir wajib diisi.";

    }

    if (!form.nik_lama.trim()) {

      newErrors.nik_lama =
        "NIK wajib diisi.";

    } else if (
      !/^\d{16}$/.test(
        form.nik_lama
      )
    ) {

      newErrors.nik_lama =
        "NIK harus terdiri dari 16 digit.";

    }

    if (!form.jenis_kelamin_lama) {

      newErrors.jenis_kelamin_lama =
        "Pilih jenis kelamin.";

    }

    if (!form.pekerjaan_lama.trim()) {

      newErrors.pekerjaan_lama =
        "Pekerjaan wajib diisi.";

    }

    if (!form.alamat_lama.trim()) {

      newErrors.alamat_lama =
        "Alamat wajib diisi.";

    }

    // ======================
    // IDENTITAS BARU
    // ======================

    if (!form.nama_baru.trim()) {

      newErrors.nama_baru =
        "Nama baru wajib diisi.";

    }

    if (!form.tempat_lahir_baru.trim()) {

      newErrors.tempat_lahir_baru =
        "Tempat lahir wajib diisi.";

    }

    if (!form.tanggal_lahir_baru) {

      newErrors.tanggal_lahir_baru =
        "Tanggal lahir wajib diisi.";

    }

    if (!form.nik_baru.trim()) {

      newErrors.nik_baru =
        "NIK wajib diisi.";

    } else if (
      !/^\d{16}$/.test(
        form.nik_baru
      )
    ) {

      newErrors.nik_baru =
        "NIK harus terdiri dari 16 digit.";

    }

    if (!form.jenis_kelamin_baru) {

      newErrors.jenis_kelamin_baru =
        "Pilih jenis kelamin.";

    }

    if (!form.pekerjaan_baru.trim()) {

      newErrors.pekerjaan_baru =
        "Pekerjaan wajib diisi.";

    }

    if (!form.alamat_baru.trim()) {

      newErrors.alamat_baru =
        "Alamat wajib diisi.";

    }

    // ======================
    // KETERANGAN
    // ======================

    if (!form.isi_keterangan.trim()) {

      newErrors.isi_keterangan =
        "Keterangan wajib diisi.";

    }

    // Upload KTP hanya wajib saat create

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
    // HANDLE SUBMIT

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (!validateForm())
      return;

    const formData =
      new FormData();

    // ======================
    // IDENTITAS LAMA
    // ======================

    formData.append(
      "nama_lama",
      form.nama_lama
    );

    formData.append(
      "ttl_lama",
      `${form.tempat_lahir_lama}, ${form.tanggal_lahir_lama}`
    );

    formData.append(
      "nik_lama",
      form.nik_lama
    );

    formData.append(
      "jenis_kelamin_lama",
      form.jenis_kelamin_lama
    );

    formData.append(
      "pekerjaan_lama",
      form.pekerjaan_lama
    );

    formData.append(
      "alamat_lama",
      form.alamat_lama
    );

    // ======================
    // IDENTITAS BARU
    // ======================

    formData.append(
      "nama_baru",
      form.nama_baru
    );

    formData.append(
      "ttl_baru",
      `${form.tempat_lahir_baru}, ${form.tanggal_lahir_baru}`
    );

    formData.append(
      "nik_baru",
      form.nik_baru
    );

    formData.append(
      "jenis_kelamin_baru",
      form.jenis_kelamin_baru
    );

    formData.append(
      "pekerjaan_baru",
      form.pekerjaan_baru
    );

    formData.append(
      "alamat_baru",
      form.alamat_baru
    );

    // ======================
    // KETERANGAN
    // ======================

    formData.append(
      "isi_keterangan",
      form.isi_keterangan
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
          ? `/api/pengajuan/beda-nama-identitas/${initialData.id}`
          : "/api/pengajuan/beda-nama-identitas";

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
    // RENDER

  return (
    <div className="pengajuan-page">

      <section className="pengajuan-hero">

        <div className="pengajuan-hero-content">

          <h1>
            {mode === "create"
              ? "Surat Keterangan Beda Nama dan Identitas"
              : "Perbaiki Pengajuan Surat Keterangan Beda Nama dan Identitas"}
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

            <h3 className="mb-4 font-semibold text-lg">
              Identitas Lama
            </h3>

            <InputField
              label="Nama"
              name="nama_lama"
              value={form.nama_lama}
              onChange={handleChange}
              placeholder="Masukkan nama lama"
            />

            {errors.nama_lama && (
              <p className="form-error">
                {errors.nama_lama}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir_lama"
                value={form.tempat_lahir_lama}
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir_lama"
                type="date"
                value={form.tanggal_lahir_lama}
                onChange={handleChange}
              />

            </div>

            {errors.tanggal_lahir_lama && (
              <p className="form-error">
                {errors.tanggal_lahir_lama}
              </p>
            )}

            <InputField
              label="NIK"
              name="nik_lama"
              value={form.nik_lama}
              onChange={handleChange}
              placeholder="Masukkan NIK"
            />

            {errors.nik_lama && (
              <p className="form-error">
                {errors.nik_lama}
              </p>
            )}

            <SelectField
              label="Jenis Kelamin"
              name="jenis_kelamin_lama"
              value={form.jenis_kelamin_lama}
              onChange={handleChange}
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
            />

            {errors.jenis_kelamin_lama && (
              <p className="form-error">
                {errors.jenis_kelamin_lama}
              </p>
            )}

            <InputField
              label="Pekerjaan"
              name="pekerjaan_lama"
              value={form.pekerjaan_lama}
              onChange={handleChange}
              placeholder="Masukkan pekerjaan"
            />

            {errors.pekerjaan_lama && (
              <p className="form-error">
                {errors.pekerjaan_lama}
              </p>
            )}

            <InputField
              label="Alamat"
              name="alamat_lama"
              value={form.alamat_lama}
              onChange={handleChange}
              placeholder="Masukkan alamat"
              textarea
            />

            {errors.alamat_lama && (
              <p className="form-error">
                {errors.alamat_lama}
              </p>
            )}
                        <hr className="my-8" />

            <h3 className="mb-4 font-semibold text-lg">
              Identitas Baru
            </h3>

            <InputField
              label="Nama"
              name="nama_baru"
              value={form.nama_baru}
              onChange={handleChange}
              placeholder="Masukkan nama baru"
            />

            {errors.nama_baru && (
              <p className="form-error">
                {errors.nama_baru}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir_baru"
                value={form.tempat_lahir_baru}
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir_baru"
                type="date"
                value={form.tanggal_lahir_baru}
                onChange={handleChange}
              />

            </div>

            {errors.tanggal_lahir_baru && (
              <p className="form-error">
                {errors.tanggal_lahir_baru}
              </p>
            )}

            <InputField
              label="NIK"
              name="nik_baru"
              value={form.nik_baru}
              onChange={handleChange}
              placeholder="Masukkan NIK"
            />

            {errors.nik_baru && (
              <p className="form-error">
                {errors.nik_baru}
              </p>
            )}

            <SelectField
              label="Jenis Kelamin"
              name="jenis_kelamin_baru"
              value={form.jenis_kelamin_baru}
              onChange={handleChange}
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
            />

            {errors.jenis_kelamin_baru && (
              <p className="form-error">
                {errors.jenis_kelamin_baru}
              </p>
            )}

            <InputField
              label="Pekerjaan"
              name="pekerjaan_baru"
              value={form.pekerjaan_baru}
              onChange={handleChange}
              placeholder="Masukkan pekerjaan"
            />

            {errors.pekerjaan_baru && (
              <p className="form-error">
                {errors.pekerjaan_baru}
              </p>
            )}

            <InputField
              label="Alamat"
              name="alamat_baru"
              value={form.alamat_baru}
              onChange={handleChange}
              placeholder="Masukkan alamat"
              textarea
            />

            {errors.alamat_baru && (
              <p className="form-error">
                {errors.alamat_baru}
              </p>
            )}

            <hr className="my-8" />

            <InputField
              label="Keterangan"
              name="isi_keterangan"
              value={form.isi_keterangan}
              onChange={handleChange}
              placeholder="Masukkan keterangan (contoh: nama yang di KTP tidak sama dengan yang di KK)"
              textarea
            />

            {errors.isi_keterangan && (
              <p className="form-error">
                {errors.isi_keterangan}
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