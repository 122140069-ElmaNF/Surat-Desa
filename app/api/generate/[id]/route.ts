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

  let hasil =
    pengajuan.template_surat || "";

  // ==========================
  // Replace seluruh field
  // ==========================

  if (detail) {
    detail.forEach((item) => {
      hasil = hasil.replaceAll(
        `{{${item.key}}}`,
        formatValue(
          item.key,
          item.value
        )
      );
    });
  }

  // ==========================
  // Ambil Profil Kepala Desa
  // ==========================

  const [profilRows] =
    await db.query(`
      SELECT *
      FROM profil_pimpinan
      LIMIT 1
    `);

  const profil =
    (profilRows as any[])[0];

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
  hasil = hasil.replaceAll(
    "{{nomor_surat}}",
    pengajuan.nomor_surat ?? ""
  );
  
  console.log("Nomor Surat:", pengajuan.nomor_surat);

  return Response.json({
    success: true,
    hasil,
    status: pengajuan.status,
    use_kop: Boolean(
      pengajuan.use_kop
    ),

    profil: {
      nama_kepala_desa:
        profil?.nama_kepala_desa ?? "",
      jabatan:
        profil?.jabatan ?? "",
      tanda_tangan:
        profil?.tanda_tangan ?? "",
    },
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