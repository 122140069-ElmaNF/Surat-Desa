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

    if (!fields || typeof fields !== "object") {
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

    const [pengajuanRows]: any = await db.query(
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

    const pengajuan = pengajuanRows[0];

    const [detailRows]: any = await db.query(
      `
      SELECT *
      FROM ${table}
      WHERE pengajuan_id = ?
      LIMIT 1
      `,
      [id]
    );

    const detail = detailRows[0];

    const [profilRows]: any = await db.query(`
      SELECT *
      FROM profil_pimpinan
      LIMIT 1
    `);

    const profil = profilRows[0];

    // ===========================
    // BANGUN FIELD
    // ===========================

    const templateFields: Record<string, string> = {};

    Object.entries(detail).forEach(([key, value]) => {
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

      templateFields[key] = String(value ?? "");
    });

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

    templateFields.nama_penandatangan =
      profil?.nama_kepala_desa ?? "";

    templateFields.jabatan =
      profil?.jabatan ?? "";

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
      message: "Data berhasil diperbarui.",
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );

  }
}