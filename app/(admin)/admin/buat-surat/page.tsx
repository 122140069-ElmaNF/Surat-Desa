"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type JenisSurat = {
  id: number;
  nama_surat: string;
};

type FieldSurat = {
  id: number;
  nama_field: string;
  label_field: string;
};

export default function AdminBuatSuratPage() {
  const router = useRouter();
  const [jenisSurat, setJenisSurat] = useState<JenisSurat[]>([]);
  const [fields, setFields] = useState<FieldSurat[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/jenis-surat")
      .then((res) => res.json())
      .then(setJenisSurat);
  }, []);

  const handleSelect = async (id: string) => {
    const numericId = Number(id);

    setSelected(numericId || null);
    setFields([]);
    setForm({});

    if (!numericId) {
      return;
    }

    setLoadingFields(true);

    try {
      const res = await fetch(`/api/field/${numericId}`);
      const data = await res.json();
      setFields(data);
    } catch (error) {
      console.error("ERROR FIELD:", error);
      alert("Gagal mengambil field surat");
    } finally {
      setLoadingFields(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApproval = async () => {
    if (!selected) {
      alert("Pilih jenis surat terlebih dahulu");
      return;
    }

    setSubmitting(true);

    const payload = {
      jenis_surat_id: selected,
      fields: fields.map((field) => ({
        field_id: field.id,
        value: form[field.nama_field] || "",
      })),
    };

    try {
      const res = await fetch("/api/admin/buat-surat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Gagal membuat surat");
        return;
      }

      alert(`Surat berhasil dibuat: ${result.kode_tracking}`);
      router.push("/admin/surat");
      router.refresh();
    } catch (error) {
      console.error("ERROR BUAT SURAT:", error);
      alert("Terjadi kesalahan saat membuat surat");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 className="page-title">Buat Surat</h1>
        <p className="page-subtitle">
          Buat pengajuan atas nama masyarakat dan langsung ajukan approval.
        </p>
      </div>

      <div className="card">
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="jenis-surat"
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#374151",
              fontWeight: 700,
            }}
          >
            Jenis Surat
          </label>
          <select
            id="jenis-surat"
            value={selected || ""}
            onChange={(e) => handleSelect(e.target.value)}
            className="input-control"
            style={{
              maxWidth: "420px",
            }}
          >
            <option value="">Pilih jenis surat</option>
            {jenisSurat.map((jenis) => (
              <option key={jenis.id} value={jenis.id}>
                {jenis.nama_surat}
              </option>
            ))}
          </select>
        </div>

        {loadingFields && (
          <div style={{ color: "#6b7280", marginBottom: "16px" }}>
            Memuat form surat...
          </div>
        )}

        {fields.length > 0 && (
          <div className="form-grid" style={{ marginBottom: "22px" }}>
            {fields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={form[field.nama_field] || ""}
                onChange={(value) => handleChange(field.nama_field, value)}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleApproval}
          disabled={!selected || submitting}
          className="full-mobile"
          style={{
            padding: "11px 18px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: !selected || submitting ? "#9ca3af" : "#16a34a",
            color: "white",
            fontWeight: 700,
            cursor: !selected || submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Memproses..." : "Approval"}
        </button>
      </div>
    </div>
  );
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FieldSurat;
  value: string;
  onChange: (value: string) => void;
}) {
  const [tempat, tanggal] = splitTempatTanggal(value);

  return (
    <div>
      <label
        htmlFor={`field-${field.id}`}
        style={{
          display: "block",
          marginBottom: "8px",
          color: "#374151",
          fontWeight: 700,
        }}
      >
        {field.label_field}
      </label>

      {isTempatTanggalLahir(field) ? (
        <div className="split-field">
          <input
            id={`field-${field.id}`}
            type="text"
            placeholder="Tempat lahir"
            value={tempat}
            onChange={(e) => onChange(gabungTempatTanggal(e.target.value, tanggal))}
            style={inputStyle}
          />
          <input
            type="date"
            value={tanggal}
            onChange={(e) => onChange(gabungTempatTanggal(tempat, e.target.value))}
            style={inputStyle}
          />
        </div>
      ) : isTanggalLahir(field) ? (
        <input
          id={`field-${field.id}`}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      ) : isJenisKelamin(field) ? (
        <select
          id={`field-${field.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">Pilih jenis kelamin</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      ) : isAgama(field) ? (
        <select
          id={`field-${field.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">Pilih agama</option>
          <option value="Islam">Islam</option>
          <option value="Kristen">Kristen</option>
          <option value="Katolik">Katolik</option>
          <option value="Hindu">Hindu</option>
          <option value="Buddha">Buddha</option>
          <option value="Konghucu">Konghucu</option>
        </select>
      ) : (
        <input
          id={`field-${field.id}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "#111827",
};

function fieldKey(field: FieldSurat) {
  return `${field.nama_field || ""} ${field.label_field || ""}`
    .toLowerCase()
    .replace(/_/g, " ");
}

function isTempatTanggalLahir(field: FieldSurat) {
  const key = fieldKey(field);
  return key.includes("tempat") && key.includes("lahir");
}

function isTanggalLahir(field: FieldSurat) {
  const key = fieldKey(field);
  return !key.includes("tempat") && key.includes("lahir") && (key.includes("tanggal") || key.includes("tgl"));
}

function isJenisKelamin(field: FieldSurat) {
  return fieldKey(field).includes("jenis kelamin");
}

function isAgama(field: FieldSurat) {
  return fieldKey(field).includes("agama");
}

function splitTempatTanggal(value: string) {
  const [tempat = "", tanggal = ""] = value.split(",").map((item) => item.trim());
  return [tempat, tanggal];
}

function gabungTempatTanggal(tempat: string, tanggal: string) {
  if (!tempat && !tanggal) return "";
  return `${tempat}, ${tanggal}`;
}
