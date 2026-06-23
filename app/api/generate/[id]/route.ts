import db from "@/lib/db";

export async function GET(
  req: Request,
  context: any
) {
  const { id } = await context.params;

  // ======================
  // Ambil pengajuan
  // ======================
const [pengajuanRows] = await db.query(
  `
  SELECT *
  FROM pengajuan_surat
  WHERE id = ?
  `,
  [id]
);

const pengajuan = (pengajuanRows as any[])[0];

  // ======================
  // Ambil template surat
  // ======================
const [suratRows] = await db.query(
  `
  SELECT template_surat, use_kop
  FROM jenis_surat
  WHERE id = ?
  `,
  [pengajuan.jenis_surat_id]
);

const surat = (suratRows as any[])[0];


  // ======================
  // Ambil field pengajuan
  // ======================
  const [detailsRows] = await db.query(
    `
    SELECT
      f.nama_field,
      d.value
    FROM detail_pengajuan d
    JOIN field_surat f
      ON d.field_id = f.id
    WHERE d.pengajuan_id = ?
    `,
    [id]
  );

  const details = detailsRows as any[];

  let hasil = surat.template_surat;

  // Replace data penandatangan
hasil = hasil.replaceAll(
  "{{nama_penandatangan}}",
  pengajuan.nama_penandatangan || ""
);

hasil = hasil.replaceAll(
  "{{jabatan_penandatangan}}",
  pengajuan.jabatan_penandatangan || ""
);

hasil = hasil.replaceAll(
  "{{ttd}}",
  pengajuan.file_ttd
    ? `<img
         src="${pengajuan.file_ttd}"
         style="
           width:150px;
           height:auto;
           margin-top:10px;
           margin-bottom:10px;
         "
       />`
    : ""
);

  // ======================
  // Replace field
  // ======================
  details.forEach((d: any) => {
    hasil = hasil.replaceAll(
      `{{${d.nama_field}}}`,
      formatValue(
        d.nama_field,
        d.value
      )
    );
  });

  // ======================
  // Tambahan manual
  // ======================
  hasil = hasil.replaceAll(
    "{{tanggal}}",
    new Date().toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    )
  );

  const [profilRows] = await db.query(`
  SELECT *
  FROM profil_pimpinan
  LIMIT 1
`);

const profil = (profilRows as any[])[0];

hasil = hasil.replaceAll(
  "{{nama_penandatangan}}",
  profil?.nama_kepala_desa || ""
);

hasil = hasil.replaceAll(
  "{{jabatan_penandatangan}}",
  profil?.jabatan || ""
);

if (
  profil?.tanda_tangan &&
  pengajuan.status === "selesai"
) {
  hasil = hasil.replaceAll(
    "{{ttd}}",
    `<img
      src="${profil.tanda_tangan}"
      style="
        width:140px;
        height:auto;
        display:block;
      "
    />`
  );
} else {
  hasil = hasil.replaceAll(
    "{{ttd}}",
    ""
  );
}

  // Nama penandatangan
  hasil = hasil.replaceAll(
    "{{nama_kepala_desa}}",
    pengajuan.nama_penandatangan ??
      ""
  );

  // Jabatan
  hasil = hasil.replaceAll(
    "{{jabatan}}",
    pengajuan.jabatan_penandatangan ??
      ""
  );

  // Gambar tanda tangan
  const ttdHtml =
    pengajuan.file_ttd
      ? `
      <div style="margin-top:20px">
        <img
          src="${pengajuan.file_ttd}"
          style="
            width:180px;
            height:auto;
          "
        />
      </div>
    `
      : "";

  hasil = hasil.replaceAll(
    "{{tanda_tangan}}",
    ttdHtml
  );

  return Response.json({
    hasil,
    use_kop: surat.use_kop,
    status: pengajuan.status,
  });
}

function formatValue(
  namaField: string,
  value: string
) {
  if (!value) return "";

  const key = String(
    namaField
  )
    .toLowerCase()
    .replace(/_/g, " ");

  if (
    key.includes("tempat") &&
    key.includes("lahir")
  ) {
    const [
      tempat = "",
      tanggal = "",
    ] = String(value)
      .split(",")
      .map((item) =>
        item.trim()
      );

    return `${tempat}, ${formatTanggalIndonesia(
      tanggal
    )}`;
  }

  if (
    !key.includes(
      "tempat"
    ) &&
    key.includes("lahir") &&
    (key.includes(
      "tanggal"
    ) ||
      key.includes("tgl"))
  ) {
    return formatTanggalIndonesia(
      value
    );
  }

  return value;
}

function formatTanggalIndonesia(
  value: string
) {
  const date = new Date(
    value
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}