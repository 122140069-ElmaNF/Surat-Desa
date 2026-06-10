import db from "@/lib/db";

export async function POST(req) {
  const body = await req.json();
  const { jenis_surat_id, fields } = body;

  const [[jenisSurat]] = await db.query(
    "SELECT nama_surat FROM jenis_surat WHERE id = ?",
    [jenis_surat_id]
  );

  if (!jenisSurat) {
    return Response.json(
      {
        success: false,
        message: "Jenis surat tidak ditemukan",
      },
      { status: 404 }
    );
  }

  const singkatan = buatSingkatan(jenisSurat.nama_surat);
  const tanggal = formatTanggalKode(new Date());

  const [[count]] = await db.query(
    `SELECT COUNT(*) AS total
    FROM pengajuan_surat
    WHERE jenis_surat_id = ?
      AND kode_tracking LIKE ?`,
    [jenis_surat_id, `${singkatan}-${tanggal}-%`]
  );

  const nomor = count.total + 1;
  const kode_tracking = `${singkatan}-${tanggal}-${String(nomor).padStart(4, "0")}`;

  const [result] = await db.query(
    `INSERT INTO pengajuan_surat
    (jenis_surat_id, user_id, status, kode_tracking)
    VALUES (?, ?, ?, ?)`,
    [jenis_surat_id, 1, "menunggu tanda tangan", kode_tracking]
  );

  const pengajuan_id = result.insertId;

  for (const field of fields) {
    await db.query(
      `INSERT INTO detail_pengajuan
      (pengajuan_id, field_id, value)
      VALUES (?, ?, ?)`,
      [pengajuan_id, field.field_id, field.value]
    );
  }

  return Response.json({
    success: true,
    kode_tracking,
    pengajuan_id,
  });
}

function buatSingkatan(namaSurat) {
  return namaSurat
    .split(/\s+/)
    .filter(Boolean)
    .map((kata) => kata[0])
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function formatTanggalKode(date) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value || "00";
  const month = parts.find((part) => part.type === "month")?.value || "00";
  const year = parts.find((part) => part.type === "year")?.value || "00";

  return `${day}${month}${year}`;
}
