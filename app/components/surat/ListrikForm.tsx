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
};

export default function ListrikForm({
  mode,
  initialData,
  submitLabel,
  role = "user",
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

  const [fileKtp, setFileKtp] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode !== "edit" || !initialData) return;

    const ttl = initialData.ttl?.split(",") ?? [];

    setForm({
      nama: initialData.nama ?? "",
      tempat_lahir: ttl[0]?.trim() ?? "",
      tanggal_lahir: ttl[1]?.trim() ?? "",
      nik: initialData.nik ?? "",
      status_perkawinan: initialData.status_perkawinan ?? "",
      pekerjaan: initialData.pekerjaan ?? "",
      alamat: initialData.alamat ?? "",
      dusun: initialData.dusun ?? "",
      rt: initialData.rt ?? "",
      rw: initialData.rw ?? "",
      idpel: initialData.idpel ?? "",
      jenis_meteran: initialData.jenis_meteran ?? "",
      keperluan: initialData.keperluan ?? "",
    });
  }, [mode, initialData]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!form.nama.trim()) newErrors.nama = "Nama wajib diisi.";
    if (!form.tempat_lahir.trim()) newErrors.tempat_lahir = "Tempat lahir wajib diisi.";
    if (!form.tanggal_lahir) newErrors.tanggal_lahir = "Tanggal lahir wajib diisi.";
    if (!/^\d{16}$/.test(form.nik)) newErrors.nik = "NIK harus terdiri dari 16 digit.";
    if (!form.status_perkawinan) newErrors.status_perkawinan = "Pilih status perkawinan.";
    if (!form.pekerjaan.trim()) newErrors.pekerjaan = "Pekerjaan wajib diisi.";
    if (!form.alamat.trim()) newErrors.alamat = "Alamat wajib diisi.";
    if (!form.dusun.trim()) newErrors.dusun = "Dusun wajib diisi.";
    if (!form.rt.trim()) newErrors.rt = "RT wajib diisi.";
    if (!form.rw.trim()) newErrors.rw = "RW wajib diisi.";
    if (!form.idpel.trim()) newErrors.idpel = "ID Pelanggan wajib diisi.";
    if (!form.jenis_meteran) newErrors.jenis_meteran = "Pilih jenis meteran.";
    if (!form.keperluan.trim()) newErrors.keperluan = "Keperluan wajib diisi.";
    if (mode === "create" && !fileKtp) newErrors.file_ktp = "Silakan upload KTP.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("nama", form.nama);
    formData.append("ttl", `${form.tempat_lahir}, ${form.tanggal_lahir}`);
    formData.append("nik", form.nik);
    formData.append("status_perkawinan", form.status_perkawinan);
    formData.append("pekerjaan", form.pekerjaan);
    formData.append("alamat", form.alamat);
    formData.append("dusun", form.dusun);
    formData.append("rt", form.rt);
    formData.append("rw", form.rw);
    formData.append("idpel", form.idpel);
    formData.append("jenis_meteran", form.jenis_meteran);
    formData.append("keperluan", form.keperluan);
    if (fileKtp) formData.append("file_ktp", fileKtp);

    const url = mode === "edit"
      ? `/api/pengajuan/listrik/${initialData.id}`
      : "/api/pengajuan/listrik";

    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();

      if (!json.success) {
        alert(json.message ?? "Gagal menyimpan.");
        return;
      }

    if (mode === "edit") {
    alert("Perbaikan berhasil dikirim.");
    window.location.href = `/tracking/${initialData.kode_tracking}`;
    } else {
    alert("Pengajuan berhasil.");
    window.location.href = `/success/${json.kode_tracking}`;
    }
    } catch {
      alert("Terjadi kesalahan server.");
    }
  }

  return (
    <div className="pengajuan-page">
      <section className="pengajuan-hero">
        <div className="pengajuan-hero-content">
          <h1>{mode === "create" ? "Surat Keterangan Listrik" : "Perbaiki Pengajuan Surat Listrik"}</h1>
        </div>
      </section>

      <section className="pengajuan-content">
        <div className="pengajuan-card">
          {mode === "edit" && (
            <div className="reject-alert">
              <h3>Pengajuan Ditolak</h3>
              <p><strong>Alasan Penolakan :</strong></p>
              <p>{initialData.alasan_penolakan}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField label="Nama Lengkap" name="nama" value={form.nama} onChange={handleChange}/>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Tempat Lahir" name="tempat_lahir" value={form.tempat_lahir} onChange={handleChange}/>
              <InputField label="Tanggal Lahir" type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange}/>
            </div>

            <InputField label="NIK" name="nik" value={form.nik} onChange={handleChange}/>

            <SelectField label="Status Perkawinan" name="status_perkawinan" value={form.status_perkawinan} onChange={handleChange}
              options={["Belum Kawin","Kawin","Cerai Hidup","Cerai Mati"]}/>

            <InputField label="Pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={handleChange}/>
            <InputField label="Alamat" textarea name="alamat" value={form.alamat} onChange={handleChange}/>
            <InputField label="Dusun" name="dusun" value={form.dusun} onChange={handleChange}/>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="RT" name="rt" value={form.rt} onChange={handleChange}/>
              <InputField label="RW" name="rw" value={form.rw} onChange={handleChange}/>
            </div>

            <InputField label="ID Pelanggan PLN" name="idpel" value={form.idpel} onChange={handleChange}/>

            <SelectField
              label="Jenis Meteran"
              name="jenis_meteran"
              value={form.jenis_meteran}
              onChange={handleChange}
              options={["Prabayar","Pascabayar"]}
            />

            <InputField
              label="Keperluan"
              name="keperluan"
              value={form.keperluan}
              onChange={handleChange}
            />

            <FileUploadField
              label="Upload KTP"
              accept="image/jpeg,image/png"
              onChange={(file)=>setFileKtp(file)}
            />

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
