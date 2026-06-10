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
      .then(res => res.json())
      .then(setJenis);
  }, []);

  const handleSelect = async (id: string) => {
    const numericId = Number(id); // 🔥 fix penting
    setSelected(numericId);

    const res = await fetch(`/api/field/${numericId}`);
    const data = await res.json();

    console.log("DATA FIELD:", data);

    setFields(data);
  };

  const handleChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
  console.log("SUBMIT DIKLIK");

  if (!selected) {
    alert("Pilih jenis surat dulu!");
    return;
  }

    const payload = {
    jenis_surat_id: selected,
    fields: fields.map((f) => ({
      field_id: f.id,
      value: form[f.nama_field] || ""
    }))
  };

  console.log("PAYLOAD:", payload);

  try {
    const res = await fetch("/api/pengajuan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    console.log("RESULT:", result);

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
    <div style={{ padding: 20 }}>
      <h1>Pengajuan Surat</h1>

      <select onChange={(e) => handleSelect(e.target.value)}>
        <option value="">Pilih Surat</option>
        {jenis.map((j) => (
          <option key={j.id} value={j.id}>{j.nama_surat}</option>
        ))}
      </select>

      <div>
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
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Submit
      </button>
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
    <div style={{ marginBottom: "10px" }}>
      <label>{field.label_field}</label><br />

      {isTempatTanggalLahir(field) ? (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Tempat lahir"
            style={inputStyle}
            value={tempat}
            onChange={(e) => onChange(gabungTempatTanggal(e.target.value, tanggal))}
          />
          <input
            type="date"
            style={inputStyle}
            value={tanggal}
            onChange={(e) => onChange(gabungTempatTanggal(tempat, e.target.value))}
          />
        </div>
      ) : isTanggalLahir(field) ? (
        <input
          type="date"
          style={inputStyle}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : isJenisKelamin(field) ? (
        <select style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Pilih jenis kelamin</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      ) : isAgama(field) ? (
        <select style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
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
          type="text"
          style={inputStyle}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

const inputStyle = {
  padding: "8px",
  width: "300px",
  backgroundColor: "white",
  color: "black",
  border: "1px solid #ccc",
  borderRadius: "5px",
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
