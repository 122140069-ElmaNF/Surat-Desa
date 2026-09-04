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

export default function KebenaranDataForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    // ==========================
    // NIK
    // ==========================

    nik: "",

    // ==========================
    // DATA KEPENDUDUKAN
    // ==========================

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

    // ==========================
    // DATA KHUSUS SKKD
    // ==========================

    no_hp: "",
    nomor_porsi: "",
    bin_binti: "",

    // ==========================
    // DATA PERSYARATAN
    // ==========================

    no_kk: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [fileKk, setFileKk] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [loadingNik, setLoadingNik] =
    useState(false);

  const [lookupMessage, setLookupMessage] =
    useState("");

  // ==========================
  // LOAD DATA EDIT
  // ==========================

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

      no_hp:
        initialData.no_hp ?? "",

      nomor_porsi:
        initialData.nomor_porsi ?? "",

      bin_binti:
        initialData.bin_binti ?? "",

      // ==========================
      // NOMOR KK
      // ==========================

      no_kk:
        initialData.no_kk ??
        initialData.persyaratan?.no_kk ??
        "",
    });

    setLookupMessage("");

    // Tidak mengisi file baru.
    // File lama tetap ditampilkan melalui
    // dokumen.file_ktp dan dokumen.file_kk.
    setFileKtp(null);
    setFileKk(null);
  }, [mode, initialData]);

  // ==========================
  // LOOKUP NIK
  // ==========================

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
          `/api/pengajuan/kebenaran-data?nik=${encodeURIComponent(
            form.nik
          )}`
        );

        const json =
          await res.json();

        if (cancelled) {
          return;
        }

        if (
          json.success &&
          json.data
        ) {
          const data =
            json.data;

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

  // ==========================
  // HANDLE INPUT
  // ==========================

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

    // ==========================
    // NIK
    // ==========================

    if (
      name === "nik" &&
      mode === "create"
    ) {
      setForm((prev) => ({
        ...prev,

        nik:
          value.replace(/\D/g, ""),

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

  // ==========================
  // VALIDASI
  // ==========================

  function validateForm() {
    const newErrors:
      Record<string, string> = {};

    // ==========================
    // KEPENDUDUKAN
    // ==========================

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

    if (
      !form.status_perkawinan
    ) {
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

    // ==========================
    // DATA KHUSUS SKKD
    // ==========================

    if (!form.no_hp.trim()) {
      newErrors.no_hp =
        "Nomor HP wajib diisi.";
    }

    if (
      !form.nomor_porsi.trim()
    ) {
      newErrors.nomor_porsi =
        "Nomor porsi wajib diisi.";
    }

    if (!form.bin_binti.trim()) {
      newErrors.bin_binti =
        "Bin / Binti wajib diisi.";
    }

    // ==========================
    // DATA PERSYARATAN
    // ==========================

    if (
      mode === "create" &&
      role !== "admin" &&
      !form.no_kk.trim()
    ) {
      newErrors.no_kk =
        "Nomor KK wajib diisi.";
    } else if (
      form.no_kk.trim() &&
      !/^\d{16}$/.test(form.no_kk)
    ) {
      newErrors.no_kk =
        "Nomor KK harus terdiri dari 16 digit.";
    }

    // ==========================
    // FILE KTP
    // ==========================

    if (
      mode === "create" &&
      role !== "admin" &&
      !fileKtp
    ) {
      newErrors.file_ktp =
        "Silakan upload KTP.";
    }

    // ==========================
    // FILE KK
    // ==========================

    if (
      mode === "create" &&
      role !== "admin" &&
      !fileKk
    ) {
      newErrors.file_kk =
        "Silakan upload KK.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
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
    // DATA KEPENDUDUKAN
    // ==========================

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

    // ==========================
    // DATA KHUSUS SKKD
    // ==========================

    formData.append(
      "no_hp",
      form.no_hp
    );

    formData.append(
      "nomor_porsi",
      form.nomor_porsi
    );

    formData.append(
      "bin_binti",
      form.bin_binti
    );

    // ==========================
    // DATA PERSYARATAN
    // ==========================

    formData.append(
      "no_kk",
      form.no_kk
    );

    // ==========================
    // FILE
    // ==========================

    // Hanya file baru yang dikirim.
    // Kalau user tidak memilih file baru,
    // backend harus mempertahankan file lama.

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

    if (fileKk) {
      formData.append(
        "file_kk",
        fileKk
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
          ? `/api/pengajuan/kebenaran-data/${initialData.id}`
          : "/api/pengajuan/kebenaran-data";

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
      setFileKk(null);

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
  // DOKUMEN LAMA
  // ==========================

  // getPengajuanEdit mengembalikan dokumen
  // dalam bentuk object:
  //
  // dokumen: {
  //   file_ktp: "...",
  //   file_kk: "..."
  // }
  //
  // Jadi tidak menggunakan .find()

  const dokumenKtp =
    initialData?.dokumen?.file_ktp ??
    "";

  const dokumenKk =
    initialData?.dokumen?.file_kk ??
    "";

  // ==========================
  // RENDER
  // ==========================

  return (
    <div className="pengajuan-page">

      <section className="pengajuan-hero">
        <div className="pengajuan-hero-content">

          <h1>
            {mode === "create"
              ? "Surat Keterangan Kebenaran Data"
              : "Perbaiki Pengajuan Surat Keterangan Kebenaran Data"}
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

          {/* ==========================
              ALASAN PENOLAKAN
          ========================== */}

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
                    {
                      initialData.alasan_penolakan
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
          >

            {/* ==========================
                NIK
            ========================== */}

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

            {/* ==========================
                DATA KEPENDUDUKAN
            ========================== */}

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
                value={
                  form.jenis_kelamin
                }
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

            {/* ==========================
                DATA KHUSUS SKKD
            ========================== */}

            <InputField
              label="Nomor HP"
              name="no_hp"
              value={form.no_hp}
              onChange={handleChange}
              placeholder="Masukkan nomor HP"
            />

            {errors.no_hp && (
              <p className="form-error">
                {errors.no_hp}
              </p>
            )}

            <InputField
              label="Nomor Porsi"
              name="nomor_porsi"
              value={
                form.nomor_porsi
              }
              onChange={handleChange}
              placeholder="Masukkan nomor porsi"
            />

            {errors.nomor_porsi && (
              <p className="form-error">
                {errors.nomor_porsi}
              </p>
            )}

            <InputField
              label="Bin / Binti"
              name="bin_binti"
              value={
                form.bin_binti
              }
              onChange={handleChange}
              placeholder="Masukkan nama Bin / Binti"
            />

            {errors.bin_binti && (
              <p className="form-error">
                {errors.bin_binti}
              </p>
            )}

            {/* ==========================
                NOMOR KK
            ========================== */}

            <InputField
              label="Nomor KK"
              name="no_kk"
              value={form.no_kk}
              onChange={handleChange}
              placeholder="Masukkan Nomor KK 16 digit"
            />

            {errors.no_kk && (
              <p className="form-error">
                {errors.no_kk}
              </p>
            )}

            {/* ==========================
                KTP
            ========================== */}

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
              dokumenKtp && (
                <div
                  style={{
                    marginTop: 8,
                    marginBottom: 16,
                    fontSize: 14,
                  }}
                >
                  <span>
                    File KTP saat ini:
                  </span>

                  <a
                    href={`/uploads/ktp/${dokumenKtp}`}
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

            {/* ==========================
                KK
            ========================== */}

            <FileUploadField
              label={
                role === "admin"
                  ? "Upload KK (Opsional)"
                  : "Upload KK"
              }
              accept="image/jpeg,image/png"
              onChange={(
                file: File | null
              ) =>
                setFileKk(file)
              }
            />

            {mode === "edit" &&
              dokumenKk && (
                <div
                  style={{
                    marginTop: 8,
                    marginBottom: 16,
                    fontSize: 14,
                  }}
                >
                  <span>
                    File KK saat ini:
                  </span>

                  <a
                    href={`/uploads/kk/${dokumenKk}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      marginLeft: 8,
                    }}
                  >
                    Lihat KK
                  </a>
                </div>
              )}

            {errors.file_kk && (
              <p className="form-error">
                {errors.file_kk}
              </p>
            )}

            {/* ==========================
                SUBMIT
            ========================== */}

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