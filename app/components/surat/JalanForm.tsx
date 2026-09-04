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

export default function JalanForm({
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

  // =====================================================
  // STATUS PENCARIAN NIK
  // =====================================================

  const [mencariNik, setMencariNik] =
    useState(false);

  const [pendudukDitemukan, setPendudukDitemukan] =
    useState(false);

  const [pesanNik, setPesanNik] =
    useState("");

  // =====================================================
  // LOAD DATA SAAT MODE EDIT
  // =====================================================

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

  // =====================================================
  // CARI DATA PENDUDUK BERDASARKAN NIK
  // =====================================================

  useEffect(() => {
    if (mode === "edit") {
      return;
    }

    // NIK belum 16 digit
    if (!/^\d{16}$/.test(form.nik)) {
      setPendudukDitemukan(false);
      setPesanNik("");
      setMencariNik(false);

      return;
    }

    let aktif = true;

    async function cariPenduduk() {
      try {
        setMencariNik(true);
        setPesanNik("");

        const res = await fetch(
          `/api/pengajuan/jalan?nik=${form.nik}`
        );

        const json =
          await res.json();

        if (!aktif) {
          return;
        }

        // =================================================
        // RESPONSE ERROR
        // =================================================

        if (!json.success) {
          setPendudukDitemukan(false);

          setPesanNik(
            json.message ??
              "Gagal mencari data penduduk."
          );

          return;
        }

        // =================================================
        // NIK DITEMUKAN
        // =================================================

        if (
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
              data.nama ?? "",

            tempat_lahir:
              ttl[0]?.trim() ?? "",

            tanggal_lahir:
              ttl[1]?.trim() ?? "",

            agama:
              data.agama ?? "",

            jenis_kelamin:
              data.jenis_kelamin ??
              "",

            status_perkawinan:
              data.status_perkawinan ??
              "",

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
              data.kewarganegaraan ??
              "",
          }));

          setPendudukDitemukan(true);

          setPesanNik(
            "Data penduduk ditemukan dan telah diisi otomatis."
          );

          return;
        }

        // =================================================
        // NIK BELUM DITEMUKAN
        // =================================================

        setPendudukDitemukan(
          false
        );

        setPesanNik(
          "Silakan lengkapi data penduduk."
        );

        // Bersihkan data penduduk sebelumnya
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

      } catch (error) {
        console.error(
          "Gagal mencari data NIK:",
          error
        );

        if (aktif) {
          setPendudukDitemukan(
            false
          );

          setPesanNik(
            "Terjadi kesalahan saat mencari data penduduk."
          );
        }
      } finally {
        if (aktif) {
          setMencariNik(false);
        }
      }
    }

    cariPenduduk();

    return () => {
      aktif = false;
    };
  }, [form.nik, mode]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

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

    // ===================================================
    // JIKA NIK DIUBAH
    // ===================================================

    if (name === "nik") {
      setPendudukDitemukan(
        false
      );

      setPesanNik("");

      // Set NIK baru sekaligus
      // kosongkan data penduduk sebelumnya
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

    // ===================================================
    // INPUT SELAIN NIK
    // ===================================================

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hapus error field ketika
    // user mulai memperbaikinya
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  // =====================================================
  // VALIDASI FORM
  // =====================================================

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

    if (
      !form.tempat_lahir.trim()
    ) {
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

    if (
      !form.kewarganegaraan.trim()
    ) {
      newErrors.kewarganegaraan =
        "Kewarganegaraan wajib diisi.";
    }

    if (!form.keperluan.trim()) {
      newErrors.keperluan =
        "Keperluan wajib diisi.";
    }

    // Upload KTP hanya wajib
    // saat create
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

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData =
      new FormData();

    // =================================================
    // DATA PENDUDUK
    // =================================================

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

    // =================================================
    // DATA KHUSUS SURAT JALAN
    // =================================================

    formData.append(
      "keperluan",
      form.keperluan
    );

    // =================================================
    // FILE KTP
    // =================================================

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

    // =================================================
    // MODE ADMIN
    // =================================================

    if (
      role === "admin" &&
      onSubmit
    ) {
      await onSubmit(formData);
      return;
    }

    // =================================================
    // CREATE / EDIT
    // =================================================

    try {
      const url =
        mode === "edit"
          ? `/api/pengajuan/jalan/${initialData.id}`
          : "/api/pengajuan/jalan";

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
        toast.error(
          json.message ??
            "Gagal menyimpan."
        );

        return;
      }

      setErrors({});
      setFileKtp(null);

      // =================================================
      // EDIT / PERBAIKAN
      // =================================================

      if (mode === "edit") {
        toast.success(
          "Perbaikan berhasil dikirim."
        );

        window.location.href =
          `/tracking/${initialData.kode_tracking}`;
      }

      // =================================================
      // CREATE
      // =================================================

      else {
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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="pengajuan-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="pengajuan-hero">

        <div className="pengajuan-hero-content">

          <h1>
            {mode === "create"
              ? "Surat Keterangan Jalan"
              : "Perbaiki Pengajuan Surat Keterangan Jalan"}
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

          {/* =================================================
              ALASAN PENOLAKAN
          ================================================= */}

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
                  display:
                    "flex",
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
                      color:
                        "#9a3412",
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
                      color:
                        "#7c2d12",
                    }}
                  >
                    Alasan Penolakan :
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: "#444",
                      lineHeight:
                        1.7,
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

          <form
            onSubmit={
              handleSubmit
            }
          >

            {/* =================================================
                NIK
            ================================================= */}

            <InputField
              label="NIK"
              name="nik"
              value={form.nik}
              onChange={
                handleChange
              }
              placeholder="Masukkan NIK 16 digit"
              error={errors.nik}
            />

            {mencariNik && (
              <p
                style={{
                  marginTop:
                    "-12px",
                  marginBottom:
                    "16px",
                  fontSize: 14,
                  color:
                    "#6b7280",
                }}
              >
                Mencari data penduduk...
              </p>
            )}

            {!mencariNik &&
              pesanNik && (
                <p
                  style={{
                    marginTop:
                      "-12px",
                    marginBottom:
                      "16px",
                    fontSize: 14,
                    color:
                      pendudukDitemukan
                        ? "#16a34a"
                        : "#6b7280",
                  }}
                >
                  {pesanNik}
                </p>
              )}

            {/* =================================================
                NAMA
            ================================================= */}

            <InputField
              label="Nama Lengkap"
              name="nama"
              value={form.nama}
              onChange={
                handleChange
              }
              placeholder="Masukkan nama lengkap"
              error={errors.nama}
            />

            {/* =================================================
                TEMPAT & TANGGAL LAHIR
            ================================================= */}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="Tempat Lahir"
                name="tempat_lahir"
                value={
                  form.tempat_lahir
                }
                onChange={
                  handleChange
                }
                placeholder="Masukkan tempat lahir"
                error={
                  errors.tempat_lahir
                }
              />

              <InputField
                label="Tanggal Lahir"
                name="tanggal_lahir"
                type="date"
                value={
                  form.tanggal_lahir
                }
                onChange={
                  handleChange
                }
                error={
                  errors.tanggal_lahir
                }
              />

            </div>

            {/* =================================================
                AGAMA
            ================================================= */}

            <SelectField
              label="Agama"
              name="agama"
              value={form.agama}
              onChange={
                handleChange
              }
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

            {/* =================================================
                JENIS KELAMIN
            ================================================= */}

            <SelectField
              label="Jenis Kelamin"
              name="jenis_kelamin"
              value={
                form.jenis_kelamin
              }
              onChange={
                handleChange
              }
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
              error={
                errors.jenis_kelamin
              }
            />

            {/* =================================================
                STATUS PERKAWINAN
            ================================================= */}

            <SelectField
              label="Status Perkawinan"
              name="status_perkawinan"
              value={
                form.status_perkawinan
              }
              onChange={
                handleChange
              }
              options={[
                "Belum Kawin",
                "Kawin",
                "Cerai Hidup",
                "Cerai Mati",
              ]}
              error={
                errors.status_perkawinan
              }
            />

            {/* =================================================
                PEKERJAAN
            ================================================= */}

            <InputField
              label="Pekerjaan"
              name="pekerjaan"
              value={
                form.pekerjaan
              }
              onChange={
                handleChange
              }
              placeholder="Masukkan pekerjaan"
              error={
                errors.pekerjaan
              }
            />

            {/* =================================================
                ALAMAT
            ================================================= */}

            <InputField
              label="Alamat"
              name="alamat"
              value={form.alamat}
              onChange={
                handleChange
              }
              placeholder="Masukkan alamat lengkap"
              textarea
              error={
                errors.alamat
              }
            />

            {/* =================================================
                DUSUN
            ================================================= */}

            <InputField
              label="Dusun"
              name="dusun"
              value={form.dusun}
              onChange={
                handleChange
              }
              placeholder="Contoh: Dusun I"
              error={errors.dusun}
            />

            {/* =================================================
                RT & RW
            ================================================= */}

            <div className="grid grid-cols-2 gap-4">

              <InputField
                label="RT"
                name="rt"
                value={form.rt}
                onChange={
                  handleChange
                }
                placeholder="001"
                error={errors.rt}
              />

              <InputField
                label="RW"
                name="rw"
                value={form.rw}
                onChange={
                  handleChange
                }
                placeholder="002"
                error={errors.rw}
              />

            </div>

            {/* =================================================
                KEWARGANEGARAAN
            ================================================= */}

            <InputField
              label="Kewarganegaraan"
              name="kewarganegaraan"
              value={
                form.kewarganegaraan
              }
              onChange={
                handleChange
              }
              placeholder="Contoh: WNI"
              error={
                errors.kewarganegaraan
              }
            />

            {/* =================================================
                KEPERLUAN
            ================================================= */}

            <InputField
              label="Keperluan"
              name="keperluan"
              value={
                form.keperluan
              }
              onChange={
                handleChange
              }
              placeholder="Contoh: Bekerja di luar daerah"
              textarea
              error={
                errors.keperluan
              }
            />

            {/* =================================================
                UPLOAD KTP
            ================================================= */}

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
              initialData
                ?.dokumen
                ?.file_ktp && (
                <div
                  style={{
                    marginTop: 8,
                    marginBottom:
                      16,
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

            {/* =================================================
                SUBMIT
            ================================================= */}

            <SubmitButton>
              {submitLabel ??
                (role === "admin"
                  ? "Buat Surat"
                  : mode ===
                    "edit"
                  ? "Perbaiki Pengajuan"
                  : "Ajukan Surat")}
            </SubmitButton>

          </form>

        </div>

      </section>

    </div>
  );
}