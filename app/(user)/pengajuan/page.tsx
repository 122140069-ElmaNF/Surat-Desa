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

export default function Home() {
  const router = useRouter();
  const [jenis, setJenis] = useState<JenisSurat[]>([]);
  const [fields, setFields] = useState<FieldSurat[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/jenis-surat")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Failed to fetch jenis-surat:", res.status, text);
          return [];
        }

        try {
          return await res.json();
        } catch (err) {
          console.error("Failed parsing jenis-surat JSON:", err);
          return [];
        }
      })
      .then(setJenis)
      .catch((err) => {
        console.error("Fetch error jenis-surat:", err);
        setJenis([]);
      });
  }, []);

  const handleSelect = async (id: string) => {
    const numericId = Number(id);
    setSelected(numericId || null);
    setFields([]);
    setForm({});

    if (!numericId) {
      return;
    }

    const res = await fetch(`/api/field/${numericId}`);
    const data = await res.json();
    setFields(data);
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!selected) {
      alert("Pilih jenis surat dulu!");
      return;
    }

    const payload = {
      jenis_surat_id: selected,
      fields: fields.map((f) => ({
        field_id: f.id,
        value: form[f.nama_field] || "",
      })),
    };

    try {
      const res = await fetch("/api/pengajuan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        router.push(`/success/${result.kode_tracking}`);
      } else {
        alert("Gagal simpan data!");
      }
    } catch (error) {
      console.error("ERROR:", error);
      alert("Terjadi error!");
    }
  };

  return (
    <div className="public-page">
      <div className="public-card">
        <div style={{ marginBottom: "22px" }}>
          <h1 className="page-title">Pengajuan Surat</h1>
          <p className="page-subtitle">
            Pilih jenis surat lalu lengkapi data pemohon.
          </p>
        </div>

        <div style={{ marginBottom: "18px" }}>
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
            className="input-control"
            onChange={(e) => handleSelect(e.target.value)}
          >
            <option value="">Pilih Surat</option>
            {jenis.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama_surat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid">
          {fields.map((f) => (
            <DynamicField
              key={f.id}
              field={f}
              value={form[f.nama_field] || ""}
              onChange={(value) => handleChange(f.nama_field, value)}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="full-mobile"
          style={{
            marginTop: "20px",
            padding: "11px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Submit
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
            className="input-control"
            value={tempat}
            onChange={(e) => onChange(gabungTempatTanggal(e.target.value, tanggal))}
          />
          <input
            type="date"
            className="input-control"
            value={tanggal}
            onChange={(e) => onChange(gabungTempatTanggal(tempat, e.target.value))}
          />
        </div>
      ) : isTanggalLahir(field) ? (
        <input
          id={`field-${field.id}`}
          type="date"
          className="input-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : isJenisKelamin(field) ? (
        <select
          id={`field-${field.id}`}
          className="input-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Pilih jenis kelamin</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      ) : isAgama(field) ? (
        <select
          id={`field-${field.id}`}
          className="input-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
          className="input-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

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
  const key = fieldKey(field);
  return key.includes("jenis kelamin");
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
