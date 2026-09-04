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

export default function TidakMampuForm({
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
    agama: "",
    jenis_kelamin: "",
    status_perkawinan: "",
    pekerjaan: "",
    alamat: "",
    dusun: "",
    rt: "",
    rw: "",
    kewarganegaraan: "",
    keperluan: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [pendudukDitemukan, setPendudukDitemukan] =
    useState(false);

  const [lookupMessage, setLookupMessage] =
    useState("");

  // =========================================
  // LOAD DATA SAAT MODE EDIT
  // =========================================

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

      status_perkawinan:
        initialData.status_perkawinan ?? "",

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

      kewarganegaraan:
        initialData.kewarganegaraan ?? "",

      keperluan:
        initialData.keperluan ?? "",
    });

  }, [mode, initialData]);

  // =========================================
  // LOOKUP NIK
  // =========================================

  useEffect(() => {
    // Saat edit, data sudah berasal dari initialData
    if (mode === "edit") {
      return;
    }

    const nik = form.nik.trim();

    // Belum 16 digit
    if (nik.length !== 16) {
      setPendudukDitemukan(false);
      setLookupMessage("");
      return;
    }

    // NIK tidak valid
    if (!/^\d{16}$/.test(nik)) {
      setPendudukDitemukan(false);
      setLookupMessage("");
      return;
    }

    async function lookupPenduduk() {
      try {
        const res = await fetch(
          `/api/pengajuan/tidak-mampu?nik=${nik}`
        );

        const json = await res.json();

        if (
          json.success &&
          json.found
        ) {
          const data = json.data;

          const ttl =
            data.ttl?.split(",") ?? [];

          setForm((prev) => ({
            ...prev,

            nik:
              data.nik ?? nik,

            nama:
              data.nama ?? "",

            tempat_lahir:
              ttl[0]?.trim() ?? "",

            tanggal_lahir:
              ttl[1]?.trim() ?? "",

            agama:
              data.agama ?? "",

            jenis_kelamin:
              data.jenis_kelamin ?? "",

            status_perkawinan:
              data.status_perkawinan ?? "",

            pekerjaan:
              data.pekerjaan ?? "",

            alamat:
              data.alamat ?? "",

            dusun:
              data.dusun ?? "",

            rt:
              data.rt ?? "",

            rw:
              data.rw ?? "",

            kewarganegaraan:
              data.kewarganegaraan ?? "",
          }));

          setPendudukDitemukan(true);

          setLookupMessage(
            "Data penduduk ditemukan dan telah diisi otomatis."
          );

        } else {
          setPendudukDitemukan(false);

          setLookupMessage(
            "Data penduduk belum terdaftar. Silakan lengkapi data penduduk."
          );

          // Bersihkan data identitas lama
          setForm((prev) => ({
            ...prev,

            nama: "",
            tempat_lahir: "",
            tanggal_lahir: "",
            agama: "",
            jenis_kelamin: "",
            status_perkawinan: "",
            pekerjaan: "",
            alamat: "",
            dusun: "",
            rt: "",
            rw: "",
            kewarganegaraan: "",
          }));
        }

      } catch (error) {
        console.error(
          "ERROR LOOKUP PENDUDUK:",
          error
        );

        setPendudukDitemukan(false);

        setLookupMessage(
          "Gagal mengambil data penduduk."
        );
      }
    }

    lookupPenduduk();

  }, [form.nik, mode]);

  // =========================================
  // HANDLE INPUT
  // =========================================

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

    // =======================================
    // JIKA NIK DIUBAH
    // =======================================

    if (name === "nik") {
      setPendudukDitemukan(false);
      setLookupMessage("");

      // Saat NIK berubah, data identitas lama
      // dikosongkan supaya tidak tertukar
      setForm((prev) => ({
        ...prev,

        nik: value,

        nama: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        agama: "",
        jenis_kelamin: "",
        status_perkawinan: "",
        pekerjaan: "",
        alamat: "",
        dusun: "",
        rt: "",
        rw: "",
        kewarganegaraan: "",
      }));

      setErrors((prev) => ({
        ...prev,
        nik: "",
      }));

      return;
    }

    // =======================================
    // INPUT BIASA
    // =======================================

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hapus error ketika field diperbaiki
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  // =========================================
  // VALIDASI
  // =========================================

  function validateForm() {
    const newErrors:
      Record<string, string> = {};

    if (!form.nik.trim()) {
      newErrors.nik =
        "NIK wajib diisi.";
    } else if (
      !/^\d{16}$/.test(form.nik)
    ) {
      newErrors.nik =
        "NIK harus terdiri dari 16 digit.";
    }

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

    if (!form.agama) {
      newErrors.agama =
        "Pilih agama.";
    }

    if (!form.jenis_kelamin) {
      newErrors.jenis_kelamin =
        "Pilih jenis kelamin.";
    }

    if (!form.status_perkawinan) {
      newErrors.status_perkawinan =
        "Pilih status perkawinan.";
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

    if (!form.kewarganegaraan.trim()) {
      newErrors.kewarganegaraan =
        "Kewarganegaraan wajib diisi.";
    }

    if (!form.keperluan.trim()) {
      newErrors.keperluan =
        "Keperluan wajib diisi.";
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

  // =========================================
  // HANDLE SUBMIT
  // =========================================

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
      "agama",
      form.agama
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
      "kewarganegaraan",
      form.kewarganegaraan
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

    // =========================================
    // ADMIN
    // =========================================

    if (
      role === "admin" &&
      onSubmit
    ) {
      await onSubmit(formData);
      return;
    }

    // =========================================
    // USER
    // =========================================

    try {
      const url =
        mode === "edit"
          ? `/api/pengajuan/tidak-mampu/${initialData.id}`
          : "/api/pengajuan/tidak-mampu";

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

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="pengajuan-page">

      <section className="pengajuan-hero">

        <div className="pengajuan-hero-content">

          <h1>
            {mode === "create"
              ? "Surat Keterangan Tidak Mampu"
              : "Perbaiki Pengajuan Surat Keterangan Tidak Mampu"}
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

          {/* ================================= */}
          {/* ALASAN PENOLAKAN */}
          {/* ================================= */}

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

            {/* ================================= */}
            {/* NIK */}
            {/* ================================= */}

            <InputField
              label="NIK"
              name="nik"
              value={form.nik}
              onChange={handleChange}
              placeholder="Masukkan NIK"
              error={errors.nik}
            />

            {lookupMessage && (
              <p
                style={{
                  marginTop: -10,
                  marginBottom: 16,
                  fontSize: 13,
                  color: pendudukDitemukan
                    ? "#16a34a"
                    : "#6b7280",
                }}
              >
                {lookupMessage}
              </p>
            )}

            {/* ================================= */}
            {/* DATA PENDUDUK */}
            {/* ================================= */}

            <InputField
              label="Nama Lengkap"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              error={errors.nama}
            />

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir"
                value={form.tempat_lahir}
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
                error={errors.tempat_lahir}
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir"
                type="date"
                value={form.tanggal_lahir}
                onChange={handleChange}
                error={errors.tanggal_lahir}
              />

            </div>

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
              error={errors.agama}
            />

            <SelectField
              label="Jenis Kelamin"
              name="jenis_kelamin"
              value={form.jenis_kelamin}
              onChange={handleChange}
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
              error={errors.jenis_kelamin}
            />

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
              error={errors.status_perkawinan}
            />

            <InputField
              label="Pekerjaan"
              name="pekerjaan"
              value={form.pekerjaan}
              onChange={handleChange}
              placeholder="Masukkan pekerjaan"
              error={errors.pekerjaan}
            />

            <InputField
              label="Alamat"
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap"
              textarea
              error={errors.alamat}
            />

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Dusun"
                name="dusun"
                value={form.dusun}
                onChange={handleChange}
                placeholder="Masukkan dusun"
                error={errors.dusun}
              />

              <InputField
                label="RT"
                name="rt"
                value={form.rt}
                onChange={handleChange}
                placeholder="Masukkan RT"
                error={errors.rt}
              />

            </div>

            <InputField
              label="RW"
              name="rw"
              value={form.rw}
              onChange={handleChange}
              placeholder="Masukkan RW"
              error={errors.rw}
            />

            <InputField
              label="Kewarganegaraan"
              name="kewarganegaraan"
              value={form.kewarganegaraan}
              onChange={handleChange}
              placeholder="Contoh: WNI"
              error={errors.kewarganegaraan}
            />

            {/* ================================= */}
            {/* DATA KHUSUS SKTM */}
            {/* ================================= */}

            <InputField
              label="Keperluan"
              name="keperluan"
              value={form.keperluan}
              onChange={handleChange}
              placeholder="Contoh: Pengaktifan BPJS Gratis"
              textarea
              error={errors.keperluan}
            />

            {/* ================================= */}
            {/* FILE KTP */}
            {/* ================================= */}

            <FileUploadField
              label={role === "admin" ? "Upload KTP (Opsional)" : "Upload KTP"}
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

            {/* ================================= */}
            {/* SUBMIT */}
            {/* ================================= */}

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