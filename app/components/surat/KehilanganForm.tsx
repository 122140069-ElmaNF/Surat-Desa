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

export default function KehilanganForm({
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
    status_perkawinan: "",
    jenis_kelamin: "",
    kewarganegaraan: "",
    pekerjaan: "",
    alamat: "",
    dusun: "",
    rt: "",
    rw: "",
    barang_hilang: "",
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

      status_perkawinan:
        initialData.status_perkawinan ?? "",

      jenis_kelamin:
        initialData.jenis_kelamin ?? "",

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

      barang_hilang:
        initialData.barang_hilang ?? "",
    });
  }, [mode, initialData]);

  // =========================================
  // LOOKUP NIK
  // =========================================

  useEffect(() => {
    // Lookup hanya dilakukan saat create
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

        const res = await fetch(
          `/api/pengajuan/kehilangan?nik=${form.nik}`
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

            kewarganegaraan:
              data.kewarganegaraan ??
              "",

            barang_hilang:
              prev.barang_hilang,
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

    // ===============================
    // KHUSUS NIK
    // ===============================

    if (name === "nik") {
      const nikValue =
        value
          .replace(/\D/g, "")
          .slice(0, 16);

      setForm((prev) => ({
        ...prev,

        nik: nikValue,

        // Jika NIK berubah pada mode create,
        // kosongkan kembali data identitas.
        ...(mode === "create"
          ? {
              nama: "",
              tempat_lahir: "",
              tanggal_lahir: "",
              agama: "",
              status_perkawinan: "",
              jenis_kelamin: "",
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

    if (!form.status_perkawinan) {
      newErrors.status_perkawinan =
        "Pilih status perkawinan.";
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

    if (!form.barang_hilang.trim()) {
      newErrors.barang_hilang =
        "Barang yang hilang wajib diisi.";
    }

    // Upload KTP hanya saat create
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
      Object.keys(newErrors)
        .length === 0
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
      "status_perkawinan",
      form.status_perkawinan
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
      "barang_hilang",
      form.barang_hilang
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

    try {
      const url =
        mode === "edit"
          ? `/api/pengajuan/kehilangan/${initialData.id}`
          : "/api/pengajuan/kehilangan";

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

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="pengajuan-page">

      {/* ===============================
          HERO
      =============================== */}

      <section className="pengajuan-hero">
        <div className="pengajuan-hero-content">

          <h1>
            {mode === "create"
              ? "Surat Keterangan Kehilangan"
              : "Perbaiki Pengajuan Surat Kehilangan"}
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

          {/* ===============================
              ALASAN PENOLAKAN
          =============================== */}

          {mode === "edit" && (
            <div
              className="reject-alert"
              style={{
                background:
                  "#fff7ed",
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

            {/* ===============================
                NIK
            =============================== */}

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
                      "Data penduduk ditemukan dan telah diisi otomatis."
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

            {/* ===============================
                NAMA
            =============================== */}

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

            {/* ===============================
                TTL
            =============================== */}

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

            {/* ===============================
                AGAMA
            =============================== */}

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

            {/* ===============================
                STATUS PERKAWINAN
            =============================== */}

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

            {/* ===============================
                JENIS KELAMIN
            =============================== */}

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

            {/* ===============================
                KEWARGANEGARAAN
            =============================== */}

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

            {/* ===============================
                PEKERJAAN
            =============================== */}

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

            {/* ===============================
                ALAMAT
            =============================== */}

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

            {/* ===============================
                DUSUN / RT / RW
            =============================== */}

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

            {/* ===============================
                BARANG HILANG
            =============================== */}

            <InputField
              label="Barang yang Hilang"
              name="barang_hilang"
              value={
                form.barang_hilang
              }
              onChange={handleChange}
              placeholder="Contoh : KTP, Kartu Keluarga, SIM C"
              textarea
            />

            {errors.barang_hilang && (
              <p className="form-error">
                {
                  errors.barang_hilang
                }
              </p>
            )}

            {/* ===============================
                FILE KTP
            =============================== */}

            <FileUploadField
              label={role === "admin" ? "Upload KTP (Opsional)" : "Upload KTP"}
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

            {/* ===============================
                SUBMIT
            =============================== */}

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