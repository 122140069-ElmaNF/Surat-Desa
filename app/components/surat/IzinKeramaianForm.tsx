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

export default function IzinKeramaianForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    nik: "",
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    agama: "",
    jenis_kelamin: "",
    status_perkawinan: "",
    kewarganegaraan: "",
    pekerjaan: "",
    alamat: "",
    dusun: "",
    rt: "",
    rw: "",

    jenis_kegiatan: "",
    tanggal_kegiatan: "",
    jam_kegiatan: "",
    acara: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [loadingNik, setLoadingNik] =
    useState(false);

  const [lookupMessage, setLookupMessage] =
    useState("");

  // =========================================
  // FORMAT TANGGAL UNTUK INPUT DATE
  // =========================================

  function formatDateInput(
    value: any
  ): string {
    if (!value) {
      return "";
    }

    // Jika value merupakan Date object
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return "";
      }

      const year =
        value.getFullYear();

      const month =
        String(
          value.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          value.getDate()
        ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const dateString =
      String(value).trim();

    if (!dateString) {
      return "";
    }

    // =====================================
    // FORMAT: YYYY-MM-DD
    // =====================================

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        dateString
      )
    ) {
      return dateString;
    }

    // =====================================
    // FORMAT: YYYY-MM-DDTHH:mm:ss...
    // =====================================

    if (
      /^\d{4}-\d{2}-\d{2}T/.test(
        dateString
      )
    ) {
      return dateString
        .split("T")[0];
    }

    // =====================================
    // FORMAT: DD/MM/YYYY
    // =====================================

    const slashMatch =
      dateString.match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
      );

    if (slashMatch) {
      const [, day, month, year] =
        slashMatch;

      return `${year}-${month}-${day}`;
    }

    // =====================================
    // FORMAT: DD-MM-YYYY
    // =====================================

    const dashMatch =
      dateString.match(
        /^(\d{2})-(\d{2})-(\d{4})$/
      );

    if (dashMatch) {
      const [, day, month, year] =
        dashMatch;

      return `${year}-${month}-${day}`;
    }

    // =====================================
    // FORMAT: DD.MM.YYYY
    // =====================================

    const dotMatch =
      dateString.match(
        /^(\d{2})\.(\d{2})\.(\d{4})$/
      );

    if (dotMatch) {
      const [, day, month, year] =
        dotMatch;

      return `${year}-${month}-${day}`;
    }

    // =====================================
    // FALLBACK DATE
    // =====================================

    const parsedDate =
      new Date(dateString);

    if (
      !isNaN(
        parsedDate.getTime()
      )
    ) {
      const year =
        parsedDate.getFullYear();

      const month =
        String(
          parsedDate.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          parsedDate.getDate()
        ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    return "";
  }

  // =========================================
  // LOAD DATA SAAT EDIT
  // =========================================

  useEffect(() => {
    if (
      mode !== "edit" ||
      !initialData
    ) {
      return;
    }

    console.log(
      "INITIAL DATA IZIN KERAMAIAN:",
      initialData
    );

    console.log(
      "TANGGAL KEGIATAN DARI API:",
      initialData.tanggal_kegiatan
    );

    console.log(
      "TANGGAL KEGIATAN SETELAH FORMAT:",
      formatDateInput(
        initialData.tanggal_kegiatan
      )
    );

    const ttl =
      initialData.ttl?.split(",") ?? [];

    setForm({
      nik:
        initialData.nik ?? "",

      nama:
        initialData.nama ?? "",

      tempat_lahir:
        ttl[0]?.trim() ?? "",

      tanggal_lahir:
        ttl[1]?.trim() ?? "",

      agama:
        initialData.agama ?? "",

      jenis_kelamin:
        initialData.jenis_kelamin ?? "",

      status_perkawinan:
        initialData.status_perkawinan ?? "",

      kewarganegaraan:
        initialData.kewarganegaraan ?? "",

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

      jenis_kegiatan:
        initialData.jenis_kegiatan ?? "",

      // =====================================
      // FIX TANGGAL KEGIATAN
      // =====================================

      tanggal_kegiatan:
        formatDateInput(
          initialData.tanggal_kegiatan
        ),

      jam_kegiatan:
        initialData.jam_kegiatan ?? "",

      acara:
        initialData.acara ?? "",
    });
  }, [mode, initialData]);

  // =========================================
  // LOOKUP NIK
  // =========================================

  useEffect(() => {
    // Lookup hanya saat create
    if (
      mode !== "create" ||
      form.nik.length !== 16
    ) {
      setLookupMessage("");
      return;
    }

    let cancelled = false;

    async function lookupNik() {
      try {
        setLoadingNik(true);
        setLookupMessage("");

        const res =
          await fetch(
            `/api/pengajuan/izin-keramaian?nik=${form.nik}`
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
            data.ttl?.split(",") ?? [];

          setForm((prev) => ({
            ...prev,

            nik:
              data.nik ??
              prev.nik,

            nama:
              data.nama ??
              "",

            tempat_lahir:
              ttl[0]?.trim() ??
              "",

            tanggal_lahir:
              ttl[1]?.trim() ??
              "",

            agama:
              data.agama ??
              "",

            jenis_kelamin:
              data.jenis_kelamin ??
              "",

            status_perkawinan:
              data.status_perkawinan ??
              "",

            kewarganegaraan:
              data.kewarganegaraan ??
              "",

            pekerjaan:
              data.pekerjaan ??
              "",

            alamat:
              data.alamat ??
              "",

            dusun:
              data.dusun ??
              "",

            rt:
              data.rt ??
              "",

            rw:
              data.rw ??
              "",

            // Jangan ubah data khusus surat
            jenis_kegiatan:
              prev.jenis_kegiatan,

            tanggal_kegiatan:
              prev.tanggal_kegiatan,

            jam_kegiatan:
              prev.jam_kegiatan,

            acara:
              prev.acara,
          }));

          setLookupMessage(
            "Data penduduk ditemukan dan telah diisi otomatis."
          );
        } else {
          setLookupMessage(
            "Silakan lengkapi data penduduk."
          );
        }
      } catch (error) {
        console.error(
          "Lookup NIK:",
          error
        );

        if (!cancelled) {
          setLookupMessage(
            "Gagal mencari data penduduk."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingNik(false);
        }
      }
    }

    lookupNik();

    return () => {
      cancelled = true;
    };
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
    // KHUSUS NIK
    // =======================================

    if (name === "nik") {
      const nikValue =
        value
          .replace(/\D/g, "")
          .slice(0, 16);

      setForm((prev) => ({
        ...prev,

        nik: nikValue,

        // Saat NIK berubah,
        // kosongkan data identitas.
        ...(mode === "create"
          ? {
              nama: "",
              tempat_lahir: "",
              tanggal_lahir: "",
              agama: "",
              jenis_kelamin: "",
              status_perkawinan: "",
              kewarganegaraan: "",
              pekerjaan: "",
              alamat: "",
              dusun: "",
              rt: "",
              rw: "",
            }
          : {}),
      }));

      setLookupMessage("");

      setErrors((prev) => ({
        ...prev,
        nik: "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  // =========================================
  // VALIDASI FORM
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

    // =======================================
    // DATA KHUSUS
    // =======================================

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

    // =======================================
    // FILE
    // =======================================

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

    // =======================================
    // DATA KEPENDUDUKAN
    // =======================================

    formData.append(
      "nik",
      form.nik
    );

    formData.append(
      "nama",
      form.nama
    );

    formData.append(
      "ttl",
      `${form.tempat_lahir}, ${form.tanggal_lahir}`
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

    // =======================================
    // DATA KHUSUS IZIN KERAMAIAN
    // =======================================

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

    // =======================================
    // FILE KTP
    // =======================================

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

    // =======================================
    // ADMIN
    // =======================================

    if (
      role === "admin" &&
      onSubmit
    ) {
      await onSubmit(formData);
      return;
    }

    // =======================================
    // USER
    // =======================================

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

      {/* =====================================
          HERO
      ===================================== */}

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

          {/* =================================
              ALASAN PENOLAKAN
          ================================= */}

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

          <form onSubmit={handleSubmit}>

            {/* =================================
                NIK
            ================================= */}

            <InputField
              label="NIK"
              name="nik"
              value={form.nik}
              onChange={handleChange}
              placeholder="Masukkan NIK 16 digit"
            />

            {loadingNik && (
              <p
                style={{
                  marginTop: -8,
                  marginBottom: 12,
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                Mencari data penduduk...
              </p>
            )}

            {lookupMessage && (
              <p
                style={{
                  marginTop: -8,
                  marginBottom: 12,
                  fontSize: 13,
                  color:
                    lookupMessage.startsWith(
                      "Data penduduk ditemukan"
                    )
                      ? "#16a34a"
                      : "#6b7280",
                }}
              >
                {lookupMessage}
              </p>
            )}

            {errors.nik && (
              <p className="form-error">
                {errors.nik}
              </p>
            )}

            {/* =================================
                NAMA
            ================================= */}

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

            {/* =================================
                TTL
            ================================= */}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir"
                value={
                  form.tempat_lahir
                }
                onChange={handleChange}
                placeholder="Masukkan tempat lahir"
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir"
                type="date"
                value={
                  form.tanggal_lahir
                }
                onChange={handleChange}
              />

            </div>

            {errors.tempat_lahir && (
              <p className="form-error">
                {
                  errors.tempat_lahir
                }
              </p>
            )}

            {errors.tanggal_lahir && (
              <p className="form-error">
                {
                  errors.tanggal_lahir
                }
              </p>
            )}

            {/* =================================
                AGAMA
            ================================= */}

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

            {/* =================================
                STATUS PERKAWINAN
            ================================= */}

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

            {errors.status_perkawinan && (
              <p className="form-error">
                {
                  errors.status_perkawinan
                }
              </p>
            )}

            {/* =================================
                JENIS KELAMIN
            ================================= */}

            <SelectField
              label="Jenis Kelamin"
              name="jenis_kelamin"
              value={
                form.jenis_kelamin
              }
              onChange={handleChange}
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
            />

            {errors.jenis_kelamin && (
              <p className="form-error">
                {
                  errors.jenis_kelamin
                }
              </p>
            )}

            {/* =================================
                KEWARGANEGARAAN
            ================================= */}

            <SelectField
              label="Kewarganegaraan"
              name="kewarganegaraan"
              value={
                form.kewarganegaraan
              }
              onChange={handleChange}
              options={[
                "WNI",
                "WNA",
              ]}
            />

            {errors.kewarganegaraan && (
              <p className="form-error">
                {
                  errors.kewarganegaraan
                }
              </p>
            )}

            {/* =================================
                PEKERJAAN
            ================================= */}

            <InputField
              label="Pekerjaan"
              name="pekerjaan"
              value={
                form.pekerjaan
              }
              onChange={handleChange}
              placeholder="Masukkan pekerjaan"
            />

            {errors.pekerjaan && (
              <p className="form-error">
                {errors.pekerjaan}
              </p>
            )}

            {/* =================================
                ALAMAT
            ================================= */}

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

            {/* =================================
                DUSUN / RT / RW
            ================================= */}

            <div className="grid grid-cols-3 gap-4">

              <InputField
                label="Dusun"
                name="dusun"
                value={form.dusun}
                onChange={handleChange}
                placeholder="Dusun"
              />

              <InputField
                label="RT"
                name="rt"
                value={form.rt}
                onChange={handleChange}
                placeholder="RT"
              />

              <InputField
                label="RW"
                name="rw"
                value={form.rw}
                onChange={handleChange}
                placeholder="RW"
              />

            </div>

            {errors.dusun && (
              <p className="form-error">
                {errors.dusun}
              </p>
            )}

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

            {/* =================================
                JENIS KEGIATAN
            ================================= */}

            <InputField
              label="Jenis Kegiatan"
              name="jenis_kegiatan"
              value={
                form.jenis_kegiatan
              }
              onChange={handleChange}
              placeholder="Contoh : Orgen Tunggal"
            />

            {errors.jenis_kegiatan && (
              <p className="form-error">
                {
                  errors.jenis_kegiatan
                }
              </p>
            )}

            {/* =================================
                TANGGAL & JAM
            ================================= */}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tanggal Kegiatan"
                name="tanggal_kegiatan"
                type="date"
                value={
                  form.tanggal_kegiatan
                }
                onChange={handleChange}
              />

              <InputField
                label="Jam Kegiatan"
                name="jam_kegiatan"
                type="time"
                value={
                  form.jam_kegiatan
                }
                onChange={handleChange}
              />

            </div>

            {errors.tanggal_kegiatan && (
              <p className="form-error">
                {
                  errors.tanggal_kegiatan
                }
              </p>
            )}

            {errors.jam_kegiatan && (
              <p className="form-error">
                {
                  errors.jam_kegiatan
                }
              </p>
            )}

            {/* =================================
                ACARA
            ================================= */}

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

            {/* =================================
                FILE KTP
            ================================= */}

            <FileUploadField
              label={
                role === "admin"
                  ? "Upload KTP (Opsional)"
                  : "Upload KTP"
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

            {/* =================================
                SUBMIT
            ================================= */}

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