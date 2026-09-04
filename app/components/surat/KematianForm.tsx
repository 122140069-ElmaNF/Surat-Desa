"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import InputField from "@/app/components/form/InputField";
import FileUploadField from "@/app/components/form/FileUploadField";
import SelectField from "@/app/components/form/SelectField";
import SubmitButton from "@/app/components/form/SubmitButton";

type Props = {
  mode: "create" | "edit";
  initialData?: any;
  submitLabel?: string;
  role?: "user" | "admin";
  onSubmit?: (formData: FormData) => Promise<void>;
};

// ======================================================
// NORMALISASI TANGGAL UNTUK INPUT TYPE="DATE"
// ======================================================

function normalizeDateForInput(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  // ====================================================
  // JIKA DATA BERUPA OBJECT DATE
  // ====================================================

  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      return "";
    }

    const year =
      value.getFullYear();

    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      value.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const stringValue =
    String(value).trim();

  // ====================================================
  // FORMAT YYYY-MM-DD
  // ====================================================

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      stringValue
    )
  ) {
    return stringValue;
  }

  // ====================================================
  // FORMAT ISO
  //
  // Contoh:
  // 2026-09-04T00:00:00.000Z
  // ====================================================

  const isoMatch =
    stringValue.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // ====================================================
  // FORMAT DD/MM/YYYY
  // ====================================================

  const slashMatch =
    stringValue.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

  if (slashMatch) {
    const day =
      slashMatch[1].padStart(2, "0");

    const month =
      slashMatch[2].padStart(2, "0");

    const year =
      slashMatch[3];

    return `${year}-${month}-${day}`;
  }

  // ====================================================
  // FORMAT DD-MM-YYYY
  // ====================================================

  const dashMatch =
    stringValue.match(
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/
    );

  if (dashMatch) {
    const day =
      dashMatch[1].padStart(2, "0");

    const month =
      dashMatch[2].padStart(2, "0");

    const year =
      dashMatch[3];

    return `${year}-${month}-${day}`;
  }

  // ====================================================
  // FORMAT DD.MM.YYYY
  // ====================================================

  const dotMatch =
    stringValue.match(
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
    );

  if (dotMatch) {
    const day =
      dotMatch[1].padStart(2, "0");

    const month =
      dotMatch[2].padStart(2, "0");

    const year =
      dotMatch[3];

    return `${year}-${month}-${day}`;
  }

  // ====================================================
  // FORMAT INDONESIA
  //
  // Contoh:
  // 4 September 2026
  // ====================================================

  const bulan: Record<
    string,
    string
  > = {
    januari: "01",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12",
  };

  const indoMatch =
    stringValue.match(
      /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
    );

  if (indoMatch) {
    const day =
      indoMatch[1].padStart(2, "0");

    const month =
      bulan[
        indoMatch[2].toLowerCase()
      ];

    const year =
      indoMatch[3];

    if (month) {
      return `${year}-${month}-${day}`;
    }
  }

  // ====================================================
  // FALLBACK
  // ====================================================

  return "";
}

export default function KematianForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
  onSubmit,
}: Props) {

  // ======================================================
  // STATE FORM
  // ======================================================

  const [form, setForm] = useState({
    nik: "",
    nama: "",
    jenis_kelamin: "",
    umur: "",
    agama: "",
    pekerjaan: "",
    alamat: "",

    hari: "",
    tanggal: "",
    jam: "",
    bertempat_di: "",
    penyebab: "",

    pelapor: "",
    hubungan_pelapor: "",
  });

  const [fileKtp, setFileKtp] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [loadingNik, setLoadingNik] =
    useState(false);

  const [lookupMessage, setLookupMessage] =
    useState("");

  // ======================================================
  // LOAD DATA EDIT
  // ======================================================

  useEffect(() => {

    if (
      mode !== "edit" ||
      !initialData
    ) {
      return;
    }

    // ====================================================
    // DEBUG TANGGAL
    // Bisa dihapus nanti setelah berhasil.
    // ====================================================

    console.log(
      "DEBUG TANGGAL KEMATIAN:",
      initialData.tanggal,
      typeof initialData.tanggal,
      normalizeDateForInput(
        initialData.tanggal
      )
    );

    setForm({

      nik:
        initialData.nik ?? "",

      nama:
        initialData.nama ?? "",

      jenis_kelamin:
        initialData.jenis_kelamin ?? "",

      umur:
        initialData.umur ?? "",

      agama:
        initialData.agama ?? "",

      pekerjaan:
        initialData.pekerjaan ?? "",

      alamat:
        initialData.alamat ?? "",

      hari:
        initialData.hari ?? "",

      tanggal:
        normalizeDateForInput(
          initialData.tanggal
        ),

      jam:
        initialData.jam ?? "",

      bertempat_di:
        initialData.bertempat_di ?? "",

      penyebab:
        initialData.penyebab ?? "",

      pelapor:
        initialData.pelapor ?? "",

      hubungan_pelapor:
        initialData.hubungan_pelapor ?? "",
    });

    setLookupMessage("");

  }, [mode, initialData]);

  // ======================================================
  // LOOKUP NIK
  // ======================================================

  useEffect(() => {

    // Hanya melakukan lookup ketika NIK
    // sudah tepat 16 digit.
    if (
      form.nik.length !== 16
    ) {
      setLookupMessage("");
      setLoadingNik(false);

      return;
    }

    let cancelled = false;

    async function lookupNik() {

      try {

        setLoadingNik(true);
        setLookupMessage("");

        const res =
          await fetch(
            `/api/pengajuan/kematian?nik=${encodeURIComponent(
              form.nik
            )}`
          );

        const json =
          await res.json();

        if (cancelled) {
          return;
        }

        // ==================================================
        // DATA DITEMUKAN
        // ==================================================

        if (
          res.ok &&
          json.success &&
          json.data
        ) {

          const data =
            json.data;

          setForm((prev) => ({
            ...prev,

            nik:
              data.nik ??
              prev.nik,

            nama:
              data.nama ??
              "",

            jenis_kelamin:
              data.jenis_kelamin ??
              "",

            agama:
              data.agama ??
              "",

            pekerjaan:
              data.pekerjaan ??
              "",

            alamat:
              data.alamat ??
              "",
          }));

          setLookupMessage(
            "Data penduduk ditemukan dan telah diisi otomatis."
          );

        }

        // ==================================================
        // DATA TIDAK DITEMUKAN
        // ==================================================

        else {

          setLookupMessage(
            "Silakan lengkapi data penduduk."
          );

          // Bersihkan data identitas yang mungkin
          // berasal dari hasil lookup NIK sebelumnya.
          setForm((prev) => ({
            ...prev,

            nama: "",
            jenis_kelamin: "",
            agama: "",
            pekerjaan: "",
            alamat: "",
          }));

        }

      } catch (error) {

        console.error(
          "Gagal melakukan lookup NIK:",
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

  }, [form.nik]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

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

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Kalau NIK berubah sebelum 16 digit,
    // hasil lookup sebelumnya dihapus.
    if (name === "nik") {
      setLookupMessage("");
    }

  }

  // ======================================================
  // VALIDASI
  // ======================================================

  function validateForm() {

    const newErrors:
      Record<string, string> = {};

    Object.entries(form).forEach(
      ([key, value]) => {

        if (
          !String(value).trim()
        ) {

          newErrors[key] =
            "Field ini wajib diisi.";

        }

      }
    );

    // Validasi NIK
    if (
      !/^\d{16}$/.test(form.nik)
    ) {

      newErrors.nik =
        "NIK harus terdiri dari 16 digit.";

    }

    // KTP wajib untuk user create.
    // Admin boleh tanpa KTP.
    if (
      mode === "create" &&
      role !== "admin" &&
      !fileKtp
    ) {

      newErrors.file_ktp =
        "Silakan upload KTP Almarhum/Almarhumah.";

    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );

  }

  // ======================================================
  // HANDLE SUBMIT
  // ======================================================

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData =
      new FormData();

    // ==================================================
    // DATA IDENTITAS PENDUDUK
    // ==================================================

    formData.append(
      "nik",
      form.nik
    );

    formData.append(
      "nama",
      form.nama
    );

    formData.append(
      "jenis_kelamin",
      form.jenis_kelamin
    );

    formData.append(
      "umur",
      form.umur
    );

    formData.append(
      "agama",
      form.agama
    );

    formData.append(
      "pekerjaan",
      form.pekerjaan
    );

    formData.append(
      "alamat",
      form.alamat
    );

    // ==================================================
    // DATA KEMATIAN
    // ==================================================

    formData.append(
      "hari",
      form.hari
    );

    formData.append(
      "tanggal",
      form.tanggal
    );

    formData.append(
      "jam",
      form.jam
    );

    formData.append(
      "bertempat_di",
      form.bertempat_di
    );

    formData.append(
      "penyebab",
      form.penyebab
    );

    // ==================================================
    // DATA PELAPOR
    // ==================================================

    formData.append(
      "pelapor",
      form.pelapor
    );

    formData.append(
      "hubungan_pelapor",
      form.hubungan_pelapor
    );

    // ==================================================
    // FILE KTP
    // ==================================================

    if (fileKtp) {

      formData.append(
        "file_ktp",
        fileKtp
      );

    }

    // ==================================================
    // ADMIN
    // ==================================================

    if (
      role === "admin" &&
      onSubmit
    ) {

      await onSubmit(formData);

      return;

    }

    // ==================================================
    // USER
    // ==================================================

    try {

      const url =
        mode === "edit"
          ? `/api/pengajuan/kematian/${initialData.id}`
          : "/api/pengajuan/kematian";

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

      // ==================================================
      // EDIT BERHASIL
      // ==================================================

      if (mode === "edit") {

        toast.success(
          "Perbaikan berhasil dikirim."
        );

        window.location.href =
          `/tracking/${initialData.kode_tracking}`;

      }

      // ==================================================
      // CREATE BERHASIL
      // ==================================================

      else {

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

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div className="pengajuan-page">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="pengajuan-hero">

        <div className="pengajuan-hero-content">

          <h1>
            {mode === "create"
              ? "Surat Keterangan Kematian"
              : "Perbaiki Pengajuan Surat Keterangan Kematian"}
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

          {/* ==================================================
              ALERT PENOLAKAN
          ================================================== */}

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

            {/* ==================================================
                DATA JENAZAH
            ================================================== */}

            <h3 className="form-section-title">
              Data Jenazah
            </h3>

            {/* NIK */}
            <InputField
              label="NIK"
              name="nik"
              value={form.nik}
              onChange={handleChange}
              placeholder="Masukkan NIK 16 digit"
            />

            {errors.nik && (
              <p className="form-error">
                {errors.nik}
              </p>
            )}

            {/* STATUS LOOKUP NIK */}
            {loadingNik && (

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

            )}

            {!loadingNik &&
              lookupMessage && (

                <p
                  style={{
                    color:
                      lookupMessage.startsWith(
                        "Data penduduk ditemukan"
                      )
                        ? "#16a34a"
                        : "#666",
                    fontSize: 14,
                    marginTop: -10,
                    marginBottom: 16,
                  }}
                >
                  {lookupMessage}
                </p>

              )}

            {/* NAMA */}
            <InputField
              label="Nama"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan nama"
            />

            {errors.nama && (
              <p className="form-error">
                {errors.nama}
              </p>
            )}

            {/* JENIS KELAMIN */}
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

            {errors.jenis_kelamin && (
              <p className="form-error">
                {errors.jenis_kelamin}
              </p>
            )}

            {/* UMUR */}
            <InputField
              label="Umur"
              name="umur"
              value={form.umur}
              onChange={handleChange}
              placeholder="Contoh : 55 Tahun"
            />

            {errors.umur && (
              <p className="form-error">
                {errors.umur}
              </p>
            )}

            {/* AGAMA */}
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

            {/* PEKERJAAN */}
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

            {/* ALAMAT */}
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

            {/* ==================================================
                DATA KEMATIAN
            ================================================== */}

            <h3 className="form-section-title">
              Data Kematian
            </h3>

            <InputField
              label="Hari"
              name="hari"
              value={form.hari}
              onChange={handleChange}
              placeholder="Contoh : Senin"
            />

            {errors.hari && (
              <p className="form-error">
                {errors.hari}
              </p>
            )}

            <InputField
              label="Tanggal"
              name="tanggal"
              type="date"
              value={form.tanggal}
              onChange={handleChange}
            />

            {errors.tanggal && (
              <p className="form-error">
                {errors.tanggal}
              </p>
            )}

            <InputField
              label="Jam"
              name="jam"
              type="time"
              value={form.jam}
              onChange={handleChange}
            />

            {errors.jam && (
              <p className="form-error">
                {errors.jam}
              </p>
            )}

            <InputField
              label="Bertempat di"
              name="bertempat_di"
              value={form.bertempat_di}
              onChange={handleChange}
              placeholder="Contoh : Rumah"
            />

            {errors.bertempat_di && (
              <p className="form-error">
                {errors.bertempat_di}
              </p>
            )}

            <InputField
              label="Penyebab Kematian"
              name="penyebab"
              value={form.penyebab}
              onChange={handleChange}
              placeholder="Contoh : Sakit"
            />

            {errors.penyebab && (
              <p className="form-error">
                {errors.penyebab}
              </p>
            )}

            {/* ==================================================
                DATA PELAPOR
            ================================================== */}

            <h3 className="form-section-title">
              Data Pelapor
            </h3>

            <InputField
              label="Nama Pelapor"
              name="pelapor"
              value={form.pelapor}
              onChange={handleChange}
              placeholder="Masukkan nama pelapor"
            />

            {errors.pelapor && (
              <p className="form-error">
                {errors.pelapor}
              </p>
            )}

            <InputField
              label="Hubungan dengan Almarhum/Almarhumah"
              name="hubungan_pelapor"
              value={
                form.hubungan_pelapor
              }
              onChange={handleChange}
              placeholder="Contoh : Anak Kandung"
            />

            {errors.hubungan_pelapor && (
              <p className="form-error">
                {errors.hubungan_pelapor}
              </p>
            )}

            {/* ==================================================
                FILE KTP
            ================================================== */}

            <FileUploadField
              label="Upload KTP Almarhum/Almarhumah"
              accept="image/jpeg,image/png"
              onChange={(
                file: File | null
              ) =>
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

            {/* ==================================================
                SUBMIT
            ================================================== */}

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