import db from "@/lib/db";

export async function GET(req, context) {
  const { id } = await context.params;

  // 1. ambil pengajuan
  const [[pengajuan]] = await db.query(
    "SELECT * FROM pengajuan_surat WHERE id = ?",
    [id]
  );

  // 2. ambil template + use_kop
  const [[surat]] = await db.query(
    "SELECT template_surat, use_kop FROM jenis_surat WHERE id = ?",
    [pengajuan.jenis_surat_id]
  );

  // 3. ambil detail field
  const [details] = await db.query(`
    SELECT f.nama_field, d.value
    FROM detail_pengajuan d
    JOIN field_surat f ON d.field_id = f.id
    WHERE d.pengajuan_id = ?
  `, [id]);

  let hasil = surat.template_surat;

  // 4. replace field
  details.forEach(d => {
    hasil = hasil.replaceAll(`{{${d.nama_field}}}`, formatValue(d.nama_field, d.value));
  });

  // tambahan manual
  hasil = hasil.replaceAll("{{tanggal}}", new Date().toLocaleDateString());

  return Response.json({
    hasil,
    use_kop: surat.use_kop
  });
}

function formatValue(namaField, value) {
  if (!value) return "";

  const key = String(namaField).toLowerCase().replace(/_/g, " ");

  if (key.includes("tempat") && key.includes("lahir")) {
    const [tempat = "", tanggal = ""] = String(value).split(",").map((item) => item.trim());
    return `${tempat}, ${formatTanggalIndonesia(tanggal)}`;
  }

  if (!key.includes("tempat") && key.includes("lahir") && (key.includes("tanggal") || key.includes("tgl"))) {
    return formatTanggalIndonesia(value);
  }

  return value;
}

function formatTanggalIndonesia(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
