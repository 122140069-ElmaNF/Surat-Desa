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

export default function ListrikForm({
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
    status_perkawinan: "",
    pekerjaan: "",
    alamat: "",
    dusun: "",
    rt: "",
    rw: "",
    idpel: "",
    jenis_meteran: "",
    keperluan: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  useEffect(() => {
    if (
      mode !== "edit" ||
      !initialData
    )
      return;

    const ttl =
      initialData.ttl?.split(",") ?? [];

    setForm({
      nama: initialData.nama ?? "",
      tempat_lahir:
        ttl[0]?.trim() ?? "",
      tanggal_lahir:
        ttl[1]?.trim() ?? "",
      nik: initialData.nik ?? "",
      status_perkawinan:
        initialData.status_perkawinan ??
        "",
      pekerjaan:
        initialData.pekerjaan ?? "",
      alamat:
        initialData.alamat ?? "",
      dusun:
        initialData.dusun ?? "",
      rt: initialData.rt ?? "",
      rw: initialData.rw ?? "",
      idpel:
        initialData.idpel ?? "",
      jenis_meteran:
        initialData.jenis_meteran ??
        "",
      keperluan:
        initialData.keperluan ??
        "",
    });
  }, [mode, initialData]);

  function handleChange(
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) {
    const { name, value } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hapus error ketika user mulai mengetik
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function validateForm() {
    const newErrors: Record<
      string,
      string
    > = {};

    if (!form.nama.trim())
      newErrors.nama =
        "Nama lengkap wajib diisi.";

    if (
      !form.tempat_lahir.trim()
    )
      newErrors.tempat_lahir =
        "Tempat lahir wajib diisi.";

    if (!form.tanggal_lahir)
      newErrors.tanggal_lahir =
        "Tanggal lahir wajib diisi.";

    if (
      !/^\d{16}$/.test(form.nik)
    )
      newErrors.nik =
        "NIK harus terdiri dari 16 digit.";

    if (!form.status_perkawinan)
      newErrors.status_perkawinan =
        "Status perkawinan wajib dipilih.";

    if (!form.pekerjaan.trim())
      newErrors.pekerjaan =
        "Pekerjaan wajib diisi.";

    if (!form.alamat.trim())
      newErrors.alamat =
        "Alamat wajib diisi.";

    if (!form.dusun.trim())
      newErrors.dusun =
        "Dusun wajib diisi.";

    if (!form.rt.trim())
      newErrors.rt =
        "RT wajib diisi.";

    if (!form.rw.trim())
      newErrors.rw =
        "RW wajib diisi.";

    if (!form.idpel.trim())
      newErrors.idpel =
        "ID Pelanggan PLN wajib diisi.";

    if (!form.jenis_meteran)
      newErrors.jenis_meteran =
        "Jenis meteran wajib dipilih.";

    if (!form.keperluan.trim())
      newErrors.keperluan =
        "Keperluan wajib diisi.";

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

  if (!validateForm()) return;

  const formData = new FormData();

  formData.append("nama", form.nama);

  formData.append(
    "ttl",
    `${form.tempat_lahir}, ${form.tanggal_lahir}`
  );

  formData.append("nik", form.nik);

  formData.append(
    "status_perkawinan",
    form.status_perkawinan
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

  formData.append(
    "idpel",
    form.idpel
  );

  formData.append(
    "jenis_meteran",
    form.jenis_meteran
  );

  formData.append(
    "keperluan",
    form.keperluan
  );

  if (fileKtp) {
    formData.append(
      "file_ktp",
      fileKtp
    );
  }

  // MODE ADMIN
  if (role === "admin" && onSubmit) {
    await onSubmit(formData);
    return;
  }

  try {
    const url =
      mode === "edit"
        ? `/api/pengajuan/listrik/${initialData.id}`
        : "/api/pengajuan/listrik";

    const method =
      mode === "edit"
        ? "PUT"
        : "POST";

    const res = await fetch(url, {
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

      window.location.href = `/tracking/${initialData.kode_tracking}`;
    } else {
      window.location.href = `/success/${json.kode_tracking}`;
    }
  } catch (err) {
    console.error(err);

    toast.error(
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
            ? "Surat Keterangan Listrik"
            : "Perbaiki Pengajuan Surat Listrik"}
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

        <form
          onSubmit={handleSubmit}
        >

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
              type="date"
              name="tanggal_lahir"
              value={
                form.tanggal_lahir
              }
              onChange={handleChange}
            />

          </div>

          {errors.tanggal_lahir && (
            <p className="form-error">
              {
                errors.tanggal_lahir
              }
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
            label="Status Perkawinan"
            name="status_perkawinan"
            value={
              form.status_perkawinan
            }
            onChange={handleChange}
            options={[
              "Belum Kawin",
              "Kawin",
              "Cerai Hidup",
              "Cerai Mati",
            ]}
          />

          {errors
            .status_perkawinan && (
            <p className="form-error">
              {
                errors.status_perkawinan
              }
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
              {
                errors.pekerjaan
              }
            </p>
          )}

          <InputField
            label="Alamat"
            textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            placeholder="Masukkan alamat lengkap"
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
            placeholder="Contoh : Dusun I"
          />

          {errors.dusun && (
            <p className="form-error">
              {errors.dusun}
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

          <InputField
            label="ID Pelanggan PLN"
            name="idpel"
            value={form.idpel}
            onChange={handleChange}
            placeholder="Masukkan ID Pelanggan PLN"
          />

          {errors.idpel && (
            <p className="form-error">
              {errors.idpel}
            </p>
          )}

          <SelectField
            label="Jenis Meteran"
            name="jenis_meteran"
            value={form.jenis_meteran}
            onChange={handleChange}
            options={[
              "Prabayar",
              "Pascabayar",
            ]}
          />

          {errors.jenis_meteran && (
            <p className="form-error">
              {errors.jenis_meteran}
            </p>
          )}

          <InputField
            label="Keperluan"
            name="keperluan"
            value={form.keperluan}
            onChange={handleChange}
            placeholder="Contoh: Pemasangan listrik baru"
          />

          {errors.keperluan && (
            <p className="form-error">
              {errors.keperluan}
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