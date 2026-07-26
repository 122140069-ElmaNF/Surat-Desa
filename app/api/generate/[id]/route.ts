import db from "@/lib/db";
import { getPengajuanDetail } from "@/lib/queries/getPengajuanDetail";

export async function GET(
  req: Request,
  context: any
) {
  const { id } = await context.params;

  const data = await getPengajuanDetail(id);

  if (!data) {
    return Response.json(
      {
        success: false,
        message: "Data tidak ditemukan",
      },
      {
        status: 404,
      }
    );
  }

  const {
    pengajuan,
    detail,
  } = data;

const fields: Record<string, string> = {};

detail.forEach((item) => {
  fields[item.key] = String(item.value ?? "");
});

fields.nomor_surat =
  pengajuan.nomor_surat ?? "";

fields.tanggal =
  pengajuan.tanggal_surat
    ? new Date(
        pengajuan.tanggal_surat
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

let hasil =
  pengajuan.isi_surat &&
  pengajuan.isi_surat.trim() !== ""
    ? pengajuan.isi_surat
    : pengajuan.template_surat || "";

  // ==========================
  // Replace seluruh field
  // ==========================

Object.entries(fields).forEach(
  ([key, value]) => {
    hasil = hasil.replaceAll(
      `{{${key}}}`,
      formatValue(
        key,
        String(value)
      )
    );
  }
);

  // ==========================
  // Ambil Profil Kepala Desa
  // ==========================

const [profilRows] = await db.query(`
    SELECT *
    FROM profil_pimpinan
    LIMIT 1
`);

const profil = (profilRows as any[])[0];

const profilFinal =
  pengajuan.status === "selesai"
    ? {
        nama_kepala_desa:
          pengajuan.nama_penandatangan,
        jabatan:
          pengajuan.jabatan_penandatangan,
        tanda_tangan:
          pengajuan.file_ttd,
      }
    : {
        nama_kepala_desa:
          profil?.nama_kepala_desa ?? "",
        jabatan:
          profil?.jabatan ?? "",
        tanda_tangan:
          profil?.tanda_tangan ?? "",
      };

  return Response.json({
    success: true,
    hasil,
    status: pengajuan.status,
    use_kop: Boolean(pengajuan.use_kop),

    kodeSurat: pengajuan.kode_surat,

    tanggalSurat: pengajuan.tanggal_surat
      ? new Date(
          pengajuan.tanggal_surat
        ).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "",

    profil: profilFinal,
  });
}

function formatValue(
  field: string,
  value: string
) {
  if (!value) return "";

  const key = field
    .toLowerCase()
    .replace(/_/g, " ");

  if (key === "ttl") {
    const parts = value
      .split(",")
      .map((v) => v.trim());

    if (parts.length === 2) {
      return `${parts[0]}, ${formatTanggalIndonesia(
        parts[1]
      )}`;
    }

    return value;
  }

  if (
    key.includes("tanggal") ||
    key.includes("tgl")
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
  if (!value) return "";

  const date = new Date(value);

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