import db from "@/lib/db";
import buildFields from "@/lib/surat/buildFields";

export async function GET(
  req: Request,
  context: any
) {
  try {
    const { id } = await context.params;

    // =========================================
    // AMBIL DATA PENGAJUAN
    // =========================================

    const [rows]: any = await db.query(
      `
      SELECT
        ps.*,
        js.kode_surat,
        js.template_surat,
        js.use_kop
      FROM pengajuan_surat ps
      JOIN jenis_surat js
        ON js.id = ps.jenis_surat_id
      WHERE ps.id = ?
      LIMIT 1
      `,
      [id]
    );

    const pengajuan = rows[0];

    if (!pengajuan) {
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

    // =========================================
    // GENERATE / SNAPSHOT SURAT
    // =========================================

    let hasil = "";

    // =========================================
    // SURAT SUDAH SELESAI
    // =========================================
    //
    // Jika surat sudah selesai, gunakan
    // isi_surat sebagai SNAPSHOT FINAL.
    //
    // Jangan generate ulang karena data
    // kependudukan bisa saja sudah berubah.
    //
    // =========================================

    if (pengajuan.status === "selesai") {
      hasil = pengajuan.isi_surat ?? "";
    }

    // =========================================
    // SURAT BELUM SELESAI
    // =========================================
    //
    // Ambil data terbaru melalui buildFields().
    //
    // buildFields() menangani:
    //
    // 1. Surat satu penduduk
    // 2. SKPHS / Penghasilan
    // 3. SKTBAPT / Tidak Berlangganan Air
    // 4. SKM / Kematian
    // 5. Field khusus masing-masing surat
    //
    // =========================================

    else {
      const fields =
        await buildFields(
          Number(id)
        );

      // =========================================
      // SYSTEM FIELDS
      // =========================================

      fields.nomor_surat =
        pengajuan.nomor_surat ?? "";

      fields.tanggal =
        pengajuan.tanggal_surat
          ? new Date(
              pengajuan.tanggal_surat
            ).toLocaleDateString(
              "id-ID",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }
            )
          : "";

      // =========================================
      // GENERATE SURAT
      // =========================================

      hasil =
        pengajuan.template_surat ??
        "";

      Object.entries(fields).forEach(
        ([key, value]) => {
          hasil = hasil.replaceAll(
            `{{${key}}}`,
            String(value ?? "")
          );
        }
      );
    }

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
    // =========================================
    //
    // Gunakan data penandatangan yang disimpan
    // sebagai snapshot saat surat di-ACC.
    //
    // =========================================

    if (pengajuan.status === "selesai") {
      profilFinal = {
        nama_kepala_desa:
          pengajuan.nama_penandatangan ??
          "",

        jabatan:
          pengajuan.jabatan_penandatangan ??
          "",

        tanda_tangan:
          pengajuan.file_ttd ??
          "",
      };
    }

    // =========================================
    // SURAT BELUM SELESAI
    // =========================================
    //
    // Ambil Kepala Desa aktif.
    //
    // =========================================

    else {
      const [kepalaDesaRows]: any =
        await db.query(
          `
          SELECT
            id,
            nama,
            jabatan,
            tanda_tangan
          FROM users
          WHERE role = 'kepala_desa'
          LIMIT 1
          `
        );

      const kepalaDesa =
        kepalaDesaRows[0];

      if (kepalaDesa) {
        profilFinal = {
          nama_kepala_desa:
            kepalaDesa.nama ?? "",

          jabatan:
            kepalaDesa.jabatan ?? "",

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

      status:
        pengajuan.status,

      use_kop:
        Boolean(
          pengajuan.use_kop
        ),

      kodeSurat:
        pengajuan.kode_surat,

      tanggalSurat:
        pengajuan.tanggal_surat,

      profil:
        profilFinal,
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