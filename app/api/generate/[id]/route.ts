import db from "@/lib/db";
import { getPengajuanDetail } from "@/lib/queries/getPengajuanDetail";

export async function GET(
  req: Request,
  context: any
) {
  try {
    const { id } = await context.params;

    const data = await getPengajuanDetail(id);

    if (!data) {
      return Response.json(
        {
          success: false,
          message: "Data tidak ditemukan.",
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

    // =========================================
    // FIELD SURAT
    // =========================================

    const fields: Record<string, string> = {};

    detail.forEach((item) => {
      fields[item.key] = String(
        item.value ?? ""
      );
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

    // =========================================
    // TEMPLATE SURAT
    // =========================================

      let hasil = "";

      if (pengajuan.status === "selesai") {
        // Surat selesai menggunakan snapshot terakhir
        hasil =
          pengajuan.isi_surat &&
          pengajuan.isi_surat.trim() !== ""
            ? pengajuan.isi_surat
            : pengajuan.template_surat || "";
      } else {
        // Surat belum selesai selalu generate ulang
        // dari template + data terbaru
        hasil = pengajuan.template_surat || "";
      }

    // =========================================
    // REPLACE FIELD
    // =========================================

    Object.entries(fields).forEach(
      ([key, value]) => {
        const formatted = formatValue(
          key,
          String(value)
        );

        hasil = hasil.replaceAll(
          `{{${key}}}`,
          formatted
        );
      }
    );

    // =========================================
    // DATA KEPALA DESA
    // =========================================

    let profilFinal = {
      nama_kepala_desa: "",
      jabatan: "",
      tanda_tangan: "",
    };

    // =========================================
    // SURAT SUDAH SELESAI
    // Gunakan SNAPSHOT yang disimpan
    // ketika surat di-ACC
    // =========================================

    if (pengajuan.status === "selesai") {
      profilFinal = {
        nama_kepala_desa:
          pengajuan.nama_penandatangan ?? "",

        jabatan:
          pengajuan.jabatan_penandatangan ?? "",

        tanda_tangan:
          pengajuan.file_ttd ?? "",
      };
    }

    // =========================================
    // SURAT BELUM SELESAI
    // Ambil Kepala Desa aktif dari USERS
    // =========================================

    else {
      const [rows] = await db.query(
        `
        SELECT
          id,
          nama,
          tanda_tangan
        FROM users
        WHERE role = 'kepala_desa'
        LIMIT 1
        `
      );

      const kepalaDesa =
        (rows as any[])[0];

      if (kepalaDesa) {
        profilFinal = {
          nama_kepala_desa:
            kepalaDesa.nama ?? "",

          jabatan:
            "Kepala Desa Sumberejo",

          tanda_tangan:
            kepalaDesa.tanda_tangan ?? "",
        };
      }
    }

    // =========================================
    // RESPONSE
    // =========================================

    return Response.json({
      success: true,
      hasil,
      status: pengajuan.status,
      use_kop: Boolean(
        pengajuan.use_kop
      ),
      kodeSurat:
        pengajuan.kode_surat,
      tanggalSurat:
        pengajuan.tanggal_surat,
      profil: profilFinal,
    });

  } catch (error) {
    console.error(
      "ERROR API /api/generate/[id]:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Gagal mengambil data surat.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}

// =========================================
// FORMAT VALUE
// =========================================

function formatValue(
  field: string,
  value: string
) {
  if (!value) return "";

  const key = field
    .toLowerCase()
    .replace(/\_/g, " ");

  // =========================================
  // TTL
  // =========================================

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

  // =========================================
  // TANGGAL
  // =========================================

  if (
    key.includes("tanggal") ||
    key.includes("tgl")
  ) {
    return formatTanggalIndonesia(value);
  }

  // =========================================
  // JAM
  // =========================================

  if (
    key.includes("jam") ||
    key.includes("waktu")
  ) {
    return formatJamIndonesia(value);
  }

  return value;
}

// =========================================
// FORMAT JAM
// =========================================

function formatJamIndonesia(value: string) {
  if (!value) return "";

  const match = value.match(
    /^(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (match) {
    return `${match[1]}:${match[2]}`;
  }

  return value;
}

// =========================================
// FORMAT TANGGAL INDONESIA
// =========================================

function formatTanggalIndonesia(
  value: string
) {
  if (!value) return "";

  // Format YYYY-MM-DD
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (match) {
    const [
      ,
      year,
      month,
      day,
    ] = match;

    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return `${day} ${
      bulan[Number(month) - 1]
    } ${year}`;
  }

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
