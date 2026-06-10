import Link from "next/link";
import db from "@/lib/db";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditSuratPage({ params }: PageProps) {
  const { id } = await params;

  const [[surat]] = await db.query(
    `SELECT
      ps.id,
      ps.kode_tracking,
      ps.status,
      js.nama_surat
    FROM pengajuan_surat ps
    LEFT JOIN jenis_surat js ON js.id = ps.jenis_surat_id
    WHERE ps.id = ?
    LIMIT 1`,
    [id]
  );

  const [details] = await db.query(
    `SELECT
      dp.id,
      dp.value,
      fs.label_field,
      fs.nama_field
    FROM detail_pengajuan dp
    JOIN field_surat fs ON fs.id = dp.field_id
    WHERE dp.pengajuan_id = ?
    ORDER BY fs.id ASC`,
    [id]
  );

  if (!surat) {
    return <div style={{ color: "#991b1b" }}>Data surat tidak ditemukan.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: "#111827" }}>
          Edit Surat
        </h1>
        <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
          Edit data input pemohon untuk pengajuan {surat.kode_tracking}.
        </p>
      </div>

      <form action={`/api/admin/surat/${surat.id}`} method="post" style={cardStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          {(details as DetailField[]).map((detail) => (
            <EditField key={detail.id} detail={detail} />
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin/surat">
            <button type="button" style={buttonStyle}>
              Batal
            </button>
          </Link>
          <button type="submit" style={primaryButtonStyle}>
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}

type DetailField = {
  id: number;
  value: string | null;
  label_field: string;
  nama_field: string;
};

function EditField({ detail }: { detail: DetailField }) {
  const [tempat, tanggal] = splitTempatTanggal(detail.value || "");

  return (
    <div>
      <label
        htmlFor={`detail-${detail.id}`}
        style={{
          display: "block",
          marginBottom: "8px",
          color: "#374151",
          fontWeight: 700,
        }}
      >
        {detail.label_field}
      </label>

      {isTempatTanggalLahir(detail) ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <input
            id={`detail-${detail.id}`}
            name={`detail_${detail.id}_tempat`}
            type="text"
            defaultValue={tempat}
            placeholder="Tempat lahir"
            style={inputStyle}
          />
          <input
            name={`detail_${detail.id}_tanggal`}
            type="date"
            defaultValue={tanggal}
            style={inputStyle}
          />
        </div>
      ) : isTanggalLahir(detail) ? (
        <input
          id={`detail-${detail.id}`}
          name={`detail_${detail.id}`}
          type="date"
          defaultValue={detail.value || ""}
          style={inputStyle}
        />
      ) : isJenisKelamin(detail) ? (
        <select
          id={`detail-${detail.id}`}
          name={`detail_${detail.id}`}
          defaultValue={detail.value || ""}
          style={inputStyle}
        >
          <option value="">Pilih jenis kelamin</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      ) : isAgama(detail) ? (
        <select
          id={`detail-${detail.id}`}
          name={`detail_${detail.id}`}
          defaultValue={detail.value || ""}
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
          id={`detail-${detail.id}`}
          name={`detail_${detail.id}`}
          type="text"
          defaultValue={detail.value || ""}
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
  color: "#111827",
  backgroundColor: "white",
};

function fieldKey(field: DetailField) {
  return `${field.nama_field || ""} ${field.label_field || ""}`
    .toLowerCase()
    .replace(/_/g, " ");
}

function isTempatTanggalLahir(field: DetailField) {
  const key = fieldKey(field);
  return key.includes("tempat") && key.includes("lahir");
}

function isTanggalLahir(field: DetailField) {
  const key = fieldKey(field);
  return !key.includes("tempat") && key.includes("lahir") && (key.includes("tanggal") || key.includes("tgl"));
}

function isJenisKelamin(field: DetailField) {
  return fieldKey(field).includes("jenis kelamin");
}

function isAgama(field: DetailField) {
  return fieldKey(field).includes("agama");
}

function splitTempatTanggal(value: string) {
  const [tempat = "", tanggal = ""] = value.split(",").map((item) => item.trim());
  return [tempat, tanggal];
}

const cardStyle = {
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "22px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
};

const buttonStyle = {
  padding: "10px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 600,
};

const primaryButtonStyle = {
  ...buttonStyle,
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
};
