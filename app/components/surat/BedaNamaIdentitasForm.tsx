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

export default function BedaNamaIdentitasForm({
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
    pekerjaan: "",
    alamat: "",
    dusun: "",
    rt: "",
    rw: "",
    kewarganegaraan: "",
    isi_keterangan: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [lookupStatus, setLookupStatus] =
    useState<
      "idle" |
      "loading" |
      "found" |
      "not-found"
    >("idle");

  // ===========================
  // FORMAT TANGGAL
  // ===========================

  function formatDateForInput(
    value: any
  ) {
    if (!value) {
      return "";
    }

    const stringValue =
      String(value).trim();

    // Sudah format YYYY-MM-DD
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        stringValue
      )
    ) {
      return stringValue;
    }

    // ISO Date
    if (
      stringValue.includes("T")
    ) {
      return stringValue
        .split("T")[0];
    }

    // Format DD/MM/YYYY
    const slashParts =
      stringValue.split("/");

    if (
      slashParts.length === 3 &&
      slashParts[2].length === 4
    ) {
      return `${slashParts[2]}-${slashParts[1].padStart(
        2,
        "0"
      )}-${slashParts[0].padStart(
        2,
        "0"
      )}`;
    }

    return stringValue;
  }

  // ===========================
  // PARSE TTL
  // ===========================

  function parseTtl(ttl: string) {
    if (!ttl) {
      return {
        tempat: "",
        tanggal: "",
      };
    }

    const parts =
      ttl.split(",");

    const tempat =
      parts[0]?.trim() ?? "";

    const tanggal =
      parts
        .slice(1)
        .join(",")
        .trim();

    return {
      tempat,
      tanggal:
        formatDateForInput(
          tanggal
        ),
    };
  }

  // ===========================
  // LOAD DATA EDIT
  // ===========================

  useEffect(() => {
    if (
      mode !== "edit" ||
      !initialData
    ) {
      return;
    }

    const ttl =
      parseTtl(
        initialData.ttl ?? ""
      );

    setForm({
      nik:
        initialData.nik ?? "",

      nama:
        initialData.nama ?? "",

      tempat_lahir:
        initialData.tempat_lahir ??
        ttl.tempat,

      tanggal_lahir:
        initialData.tanggal_lahir ??
        ttl.tanggal,

      agama:
        initialData.agama ?? "",

      jenis_kelamin:
        initialData.jenis_kelamin ?? "",

      status_perkawinan:
        initialData.status_perkawinan ??
        "",

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
        initialData.kewarganegaraan ??
        "",

      isi_keterangan:
        initialData.isi_keterangan ??
        "",
    });
  }, [
    mode,
    initialData,
  ]);

  // ===========================
  // LOOKUP PENDUDUK
  // ===========================

  async function lookupPenduduk(
    nik: string
  ) {
    if (
      !/^\d{16}$/.test(nik)
    ) {
      setLookupStatus("idle");
      return;
    }

    setLookupStatus("loading");

    try {
      const res =
        await fetch(
          `/api/pengajuan/beda-nama-identitas?nik=${nik}`
        );

      const json =
        await res.json();

      if (
        !json.success ||
        !json.found ||
        !json.data
      ) {
        setLookupStatus(
          "not-found"
        );

        return;
      }

      const data =
        json.data;

      const ttl =
        parseTtl(
          data.ttl ?? ""
        );

      setForm((prev) => ({
        ...prev,

        nama:
          data.nama ?? "",

        tempat_lahir:
          ttl.tempat,

        tanggal_lahir:
          ttl.tanggal,

        agama:
          data.agama ?? "",

        jenis_kelamin:
          data.jenis_kelamin ?? "",

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

      setLookupStatus("found");

    } catch (error) {

      console.error(
        "Lookup penduduk error:",
        error
      );

      setLookupStatus(
        "not-found"
      );
    }
  }

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
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // ===========================
    // LOOKUP NIK
    // ===========================

    if (name === "nik") {
      setLookupStatus("idle");

      if (
        mode === "create" &&
        value.length !== 16
      ) {
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

      if (
        mode === "create" &&
        /^\d{16}$/.test(value)
      ) {
        lookupPenduduk(value);
      }
    }
  }

  // ===========================
  // VALIDASI
  // ===========================

  function validateForm() {
    const newErrors:
      Record<string, string> = {};

    if (
      !/^\d{16}$/.test(
        form.nik
      )
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
        "Agama wajib diisi.";
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

    if (
      !form.pekerjaan.trim()
    ) {
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

    if (
      !form.isi_keterangan.trim()
    ) {
      newErrors.isi_keterangan =
        "Keterangan wajib diisi.";
    }

    if (
      mode === "create" &&
      role !== "admin" &&
      !fileKtp
    ) {
      newErrors.file_ktp =
        "Silakan upload KTP.";
    }

    setErrors(
      newErrors
    );

    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  }

  // ===========================
  // SUBMIT
  // ===========================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData =
      new FormData();

    // ======================
    // DATA PEMOHON
    // ======================

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

    // ======================
    // KETERANGAN
    // ======================

    formData.append(
      "isi_keterangan",
      form.isi_keterangan
    );

    // ======================
    // FILE KTP
    // ======================

    if (fileKtp) {
      formData.append(
        "file_ktp",
        fileKtp
      );
    }

    // ======================
    // ADMIN
    // ======================

    if (
      role === "admin" &&
      onSubmit
    ) {
      await onSubmit(
        formData
      );

      return;
    }

    // ======================
    // USER
    // ======================

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
        toast.error(
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
        toast.success(
          "Perbaikan berhasil dikirim."
        );

        window.location.href =
          `/tracking/${initialData.kode_tracking}`;

      } else {
        window.location.href =
          `/success/${json.kode_tracking}`;
      }

    } catch (error) {

      console.error(error);

      toast.error(
        "Terjadi kesalahan server."
      );
    }
  }

  // ===========================
  // LOOKUP MESSAGE
  // ===========================

  function renderLookupMessage() {
    if (
      lookupStatus ===
      "found"
    ) {
      return (
        <p
          style={{
            color: "#16a34a",
            fontSize: 14,
            marginTop: -10,
            marginBottom: 16,
          }}
        >
          Data penduduk ditemukan dan
          telah diisi otomatis.
        </p>
      );
    }

    if (
      lookupStatus ===
      "not-found"
    ) {
      return (
        <p
          style={{
            color: "#666",
            fontSize: 14,
            marginTop: -10,
            marginBottom: 16,
          }}
        >
          Silakan lengkapi data penduduk.
        </p>
      );
    }

    if (
      lookupStatus ===
      "loading"
    ) {
      return (
        <p
          style={{
            color: "#666",
            fontSize: 14,
            marginTop: -10,
            marginBottom: 16,
          }}
        >
          Mencari data penduduk...
        </p>
      );
    }

    return null;
  }

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className="pengajuan-page">

      {/* =========================
          HERO
      ========================= */}

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

          {/* ======================
              ALASAN PENOLAKAN
          ====================== */}

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
                      initialData?.alasan_penolakan
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

            {/* ======================
                DATA PEMOHON
            ====================== */}

            <h3 className="mb-4 font-semibold text-lg">
              Data Pemohon
            </h3>

            <InputField
              label="NIK"
              name="nik"
              value={form.nik}
              onChange={
                handleChange
              }
              placeholder="Masukkan NIK"
            />

            {errors.nik && (
              <p className="form-error">
                {errors.nik}
              </p>
            )}

            {renderLookupMessage()}

            <InputField
              label="Nama"
              name="nama"
              value={form.nama}
              onChange={
                handleChange
              }
              placeholder="Masukkan nama"
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
                onChange={
                  handleChange
                }
                placeholder="Masukkan tempat lahir"
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
            />

            {errors.agama && (
              <p className="form-error">
                {errors.agama}
              </p>
            )}

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
            />

            {errors.jenis_kelamin && (
              <p className="form-error">
                {
                  errors.jenis_kelamin
                }
              </p>
            )}

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
            />

            {errors.status_perkawinan && (
              <p className="form-error">
                {
                  errors.status_perkawinan
                }
              </p>
            )}

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
              name="alamat"
              value={form.alamat}
              onChange={
                handleChange
              }
              placeholder="Masukkan alamat"
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
                onChange={
                  handleChange
                }
                placeholder="Dusun"
              />

              <InputField
                label="RT"
                name="rt"
                value={form.rt}
                onChange={
                  handleChange
                }
                placeholder="RT"
              />

              <InputField
                label="RW"
                name="rw"
                value={form.rw}
                onChange={
                  handleChange
                }
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
            />

            {errors.kewarganegaraan && (
              <p className="form-error">
                {
                  errors.kewarganegaraan
                }
              </p>
            )}

            <hr className="my-8" />

            {/* ======================
                KETERANGAN
            ====================== */}

            <h3 className="mb-4 font-semibold text-lg">
              Keterangan
            </h3>

            <InputField
              label="Keterangan Perbedaan Nama/Identitas"
              name="isi_keterangan"
              value={
                form.isi_keterangan
              }
              onChange={
                handleChange
              }
              placeholder="Jelaskan perbedaan nama atau identitas yang dimiliki"
              textarea
            />

            {errors.isi_keterangan && (
              <p className="form-error">
                {
                  errors.isi_keterangan
                }
              </p>
            )}

            {/* ======================
                KTP
            ====================== */}

            <FileUploadField
              label={role === "admin" ? "Upload KTP (Opsional)" : "Upload KTP"}
              accept="image/jpeg,image/png"
              onChange={(
                file: File | null
              ) => {
                setFileKtp(
                  file
                );

                if (
                  errors.file_ktp
                ) {
                  setErrors(
                    (prev) => ({
                      ...prev,
                      file_ktp:
                        "",
                    })
                  );
                }
              }}
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

            {/* ======================
                SUBMIT
            ====================== */}

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