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

export default function TafsiranHargaTanahForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    // ===========================
    // NIK
    // ===========================

    nik: "",

    // ===========================
    // Data Kependudukan
    // ===========================

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

    // ===========================
    // Data Tanah
    // ===========================

    nomor_sertifikat: "",
    luas_tanah: "",
    tahun_perolehan: "",
    asal_perolehan: "",
    letak_tanah: "",
    harga_taksiran: "",
  });

  const [fileKtp, setFileKtp] = useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [loadingNik, setLoadingNik] = useState(false);

  const [lookupMessage, setLookupMessage] =
    useState("");

  // ===========================
  // LOAD DATA SAAT EDIT
  // ===========================

  useEffect(() => {
    if (mode !== "edit" || !initialData) {
      return;
    }

    const ttl =
      initialData.ttl?.split(",") ?? [];

    setForm({
      nik: initialData.nik ?? "",

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

      nomor_sertifikat:
        initialData.nomor_sertifikat ?? "",

      luas_tanah:
        initialData.luas_tanah ?? "",

      tahun_perolehan:
        initialData.tahun_perolehan ?? "",

      asal_perolehan:
        initialData.asal_perolehan ?? "",

      letak_tanah:
        initialData.letak_tanah ?? "",

      harga_taksiran:
        initialData.harga_taksiran ?? "",
    });

    setLookupMessage("");
  }, [mode, initialData]);

  // ===========================
  // LOOKUP DATA NIK
  // ===========================

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    if (!/^\d{16}$/.test(form.nik)) {
      setLookupMessage("");
      setLoadingNik(false);
      return;
    }

    let cancelled = false;

    async function lookupNik() {
      try {
        setLoadingNik(true);
        setLookupMessage("");

        const res = await fetch(
          `/api/pengajuan/tafsiran-harga-tanah?nik=${encodeURIComponent(
            form.nik
          )}`
        );

        const json = await res.json();

        if (cancelled) return;

        if (json.success && json.data) {
          const data = json.data;

          const ttl =
            data.ttl?.split(",") ?? [];

          setForm((prev) => ({
            ...prev,

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
          "Gagal melakukan lookup NIK:",
          error
        );

        if (!cancelled) {
          setLookupMessage(
            "Silakan lengkapi data penduduk."
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

  // ===========================
  // HANDLE INPUT
  // ===========================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    if (name === "nik" && mode === "create") {
      setForm((prev) => ({
        ...prev,
        nik: value.replace(/\D/g, ""),
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
  }

  // ===========================
  // VALIDASI FORM
  // ===========================

  function validateForm() {
    const newErrors: Record<string, string> = {};

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

    if (!form.nomor_sertifikat.trim()) {
      newErrors.nomor_sertifikat =
        "Nomor sertifikat wajib diisi.";
    }

    if (!form.luas_tanah.trim()) {
      newErrors.luas_tanah =
        "Luas tanah wajib diisi.";
    }

    if (!form.tahun_perolehan.trim()) {
      newErrors.tahun_perolehan =
        "Tahun perolehan wajib diisi.";
    }

    if (!form.asal_perolehan.trim()) {
      newErrors.asal_perolehan =
        "Asal perolehan wajib diisi.";
    }

    if (!form.letak_tanah.trim()) {
      newErrors.letak_tanah =
        "Letak tanah wajib diisi.";
    }

    if (!form.harga_taksiran.trim()) {
      newErrors.harga_taksiran =
        "Harga taksiran wajib diisi.";
    }

    // Upload KTP hanya wajib saat create

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

  // ===========================
  // HANDLE SUBMIT
  // ===========================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();

    // ===========================
    // DATA KEPENDUDUKAN
    // ===========================

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

    // ===========================
    // DATA TANAH
    // ===========================

    formData.append(
      "nomor_sertifikat",
      form.nomor_sertifikat
    );

    formData.append(
      "luas_tanah",
      form.luas_tanah
    );

    formData.append(
      "tahun_perolehan",
      form.tahun_perolehan
    );

    formData.append(
      "asal_perolehan",
      form.asal_perolehan
    );

    formData.append(
      "letak_tanah",
      form.letak_tanah
    );

    formData.append(
      "harga_taksiran",
      form.harga_taksiran
    );

    // ===========================
    // FILE KTP
    // ===========================

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

    // ===========================
    // ADMIN
    // ===========================

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
          ? `/api/pengajuan/tafsiran-harga-tanah/${initialData.id}`
          : "/api/pengajuan/tafsiran-harga-tanah";

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

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className="pengajuan-page">
      <section className="pengajuan-hero">
        <div className="pengajuan-hero-content">
          <h1>
            {mode === "create"
              ? "Surat Keterangan Tafsiran Harga Tanah"
              : "Perbaiki Pengajuan Surat Tafsiran Harga Tanah"}
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

          {/* ===========================
              ALASAN PENOLAKAN
          =========================== */}

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

            {/* ===========================
                NIK
            =========================== */}

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
                  color: "#666",
                  fontSize: 14,
                  marginTop: 6,
                }}
              >
                Mencari data penduduk...
              </p>
            )}

            {!loadingNik &&
              lookupMessage && (
                <p
                  style={{
                    color:
                      lookupMessage.includes(
                        "ditemukan"
                      )
                        ? "#16a34a"
                        : "#666",
                    fontSize: 14,
                    marginTop: 6,
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

            {/* ===========================
                DATA PEMILIK
            =========================== */}

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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {errors.jenis_kelamin && (
              <p className="form-error">
                {errors.jenis_kelamin}
              </p>
            )}

            {errors.status_perkawinan && (
              <p className="form-error">
                {errors.status_perkawinan}
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

            <div className="grid grid-cols-3 gap-4">
              <InputField
                label="Dusun"
                name="dusun"
                value={form.dusun}
                onChange={handleChange}
                placeholder="Masukkan dusun"
              />

              <InputField
                label="RT"
                name="rt"
                value={form.rt}
                onChange={handleChange}
                placeholder="Contoh: 001"
              />

              <InputField
                label="RW"
                name="rw"
                value={form.rw}
                onChange={handleChange}
                placeholder="Contoh: 002"
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

            <InputField
              label="Kewarganegaraan"
              name="kewarganegaraan"
              value={
                form.kewarganegaraan
              }
              onChange={handleChange}
              placeholder="Contoh: WNI"
            />

            {errors.kewarganegaraan && (
              <p className="form-error">
                {errors.kewarganegaraan}
              </p>
            )}

            {/* ===========================
                DATA TANAH
            =========================== */}

            <InputField
              label="Nomor Sertifikat"
              name="nomor_sertifikat"
              value={
                form.nomor_sertifikat
              }
              onChange={handleChange}
              placeholder="Contoh: SHM No. 123"
            />

            {errors.nomor_sertifikat && (
              <p className="form-error">
                {errors.nomor_sertifikat}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Luas Tanah (m²)"
                name="luas_tanah"
                value={form.luas_tanah}
                onChange={handleChange}
                placeholder="Contoh: 600"
              />

              <InputField
                label="Tahun Perolehan"
                name="tahun_perolehan"
                value={
                  form.tahun_perolehan
                }
                onChange={handleChange}
                placeholder="Contoh: 2015"
              />
            </div>

            {errors.luas_tanah && (
              <p className="form-error">
                {errors.luas_tanah}
              </p>
            )}

            {errors.tahun_perolehan && (
              <p className="form-error">
                {errors.tahun_perolehan}
              </p>
            )}

            <InputField
              label="Asal Perolehan"
              name="asal_perolehan"
              value={
                form.asal_perolehan
              }
              onChange={handleChange}
              placeholder="Contoh: Warisan / Jual Beli"
            />

            {errors.asal_perolehan && (
              <p className="form-error">
                {errors.asal_perolehan}
              </p>
            )}

            <InputField
              label="Letak Tanah"
              name="letak_tanah"
              value={form.letak_tanah}
              onChange={handleChange}
              placeholder="Masukkan letak tanah"
              textarea
            />

            {errors.letak_tanah && (
              <p className="form-error">
                {errors.letak_tanah}
              </p>
            )}

            <InputField
              label="Harga Taksiran (Rp)"
              name="harga_taksiran"
              value={
                form.harga_taksiran
              }
              onChange={handleChange}
              placeholder="Contoh: 250000000"
            />

            {errors.harga_taksiran && (
              <p className="form-error">
                {errors.harga_taksiran}
              </p>
            )}

            {/* ===========================
                FILE KTP
            =========================== */}

            <FileUploadField
              label={role === "admin" ? "Upload KTP (Opsional)" : "Upload KTP"}
              accept="image/jpeg,image/png"
              onChange={(file: File | null) =>
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