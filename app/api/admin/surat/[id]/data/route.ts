import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSurat } from "@/lib/surat/generateSurat";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const {
      table,
      fields,
    } = body;

    // ===========================
    // VALIDASI TABLE
    // ===========================

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama tabel tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }

    // ===========================
    // VALIDASI FIELDS
    // ===========================

    if (
      !fields ||
      typeof fields !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    const keys = Object.keys(fields);

    if (keys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data yang diubah.",
        },
        {
          status: 400,
        }
      );
    }

    // ===========================
    // UPDATE DATA SURAT
    // ===========================

    const setClause = keys
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = keys.map(
      (key) => fields[key]
    );

    values.push(id);

    await db.query(
      `
      UPDATE ${table}
      SET ${setClause}
      WHERE pengajuan_id = ?
      `,
      values
    );

    // ===========================
    // AMBIL DATA TERBARU
    // ===========================

    const [pengajuanRows]: any =
      await db.query(
        `
        SELECT
          ps.*,
          js.template_surat
        FROM pengajuan_surat ps
        JOIN jenis_surat js
          ON js.id = ps.jenis_surat_id
        WHERE ps.id = ?
        LIMIT 1
        `,
        [id]
      );

    const pengajuan =
      pengajuanRows[0];

    if (!pengajuan) {
      return NextResponse.json(
        {
          success: false,
          message: "Data surat tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // ===========================
    // AMBIL DETAIL TERBARU
    // ===========================

    const [detailRows]: any =
      await db.query(
        `
        SELECT *
        FROM ${table}
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [id]
      );

    const detail =
      detailRows[0];

    if (!detail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Detail data surat tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // ===========================
    // BANGUN FIELD TEMPLATE
    // ===========================

    const templateFields: Record<
      string,
      string
    > = {};

    Object.entries(detail).forEach(
      ([key, value]) => {
        if (
          [
            "id",
            "pengajuan_id",
            "created_at",
            "updated_at",
          ].includes(key)
        ) {
          return;
        }

        templateFields[key] =
          String(value ?? "");
      }
    );

    // ===========================
    // FIELD SISTEM
    // ===========================

    templateFields.nomor_surat =
      pengajuan.nomor_surat ?? "";

    templateFields.tanggal =
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

    // ===========================
    // DATA KEPALA DESA
    // ===========================

    if (
      pengajuan.status ===
      "selesai"
    ) {
      // --------------------------------
      // SURAT SUDAH SELESAI
      // Gunakan snapshot Kepala Desa
      // ketika surat di-ACC
      // --------------------------------

      templateFields.nama_penandatangan =
        pengajuan.nama_penandatangan ??
        "";

      templateFields.jabatan =
        pengajuan.jabatan_penandatangan ??
        "";
    } else {
      // --------------------------------
      // SURAT BELUM SELESAI
      // Ambil Kepala Desa aktif
      // dari tabel users
      // --------------------------------

      const [
        kepalaDesaRows,
      ]: any = await db.query(
        `
        SELECT
          nama
        FROM users
        WHERE role = 'kepala_desa'
        LIMIT 1
        `
      );

      const kepalaDesa =
        kepalaDesaRows[0];

      templateFields.nama_penandatangan =
        kepalaDesa?.nama ?? "";

      templateFields.jabatan =
        "Kepala Desa Sumberejo";
    }

    // ===========================
    // GENERATE ULANG SURAT
    // ===========================

    const html = generateSurat(
      pengajuan.template_surat ?? "",
      templateFields,
      {
        preserveSystemFields: true,
      }
    );

    // ===========================
    // SIMPAN ISI SURAT TERBARU
    // ===========================

    await db.query(
      `
      UPDATE pengajuan_surat
      SET isi_surat = ?
      WHERE id = ?
      `,
      [
        html,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message:
        "Data berhasil diperbarui.",
    });
  } catch (err) {
    console.error(
      "ERROR UPDATE DATA SURAT:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}