import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSurat } from "@/lib/surat/generateSurat";

const IDENTITY_FIELDS = [
  "nik",
  "nama",
  "ttl",
  "agama",
  "jenis_kelamin",
  "status_perkawinan",
  "pekerjaan",
  "alamat",
  "dusun",
  "rt",
  "rw",
  "kewarganegaraan",
];

const SYSTEM_FIELDS = [
  "id",
  "pengajuan_id",
  "created_at",
  "updated_at",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const conn = await db.getConnection();

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
          message:
            "Nama tabel tidak ditemukan.",
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
          message:
            "Tidak ada data yang diubah.",
        },
        {
          status: 400,
        }
      );
    }

    await conn.beginTransaction();

    // ===========================
    // AMBIL DATA PENGAJUAN
    // ===========================

    const [pengajuanRows]: any =
      await conn.query(
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
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Data surat tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // 1. DATA KEPENDUDUKAN
    // =====================================================

    const identityData: Record<
      string,
      any
    > = {};

    IDENTITY_FIELDS.forEach(
      (field) => {
        if (
          Object.prototype.hasOwnProperty.call(
            fields,
            field
          )
        ) {
          identityData[field] =
            fields[field] ?? "";
        }
      }
    );

    const nik =
      identityData.nik ??
      pengajuan.nik;

    // ===========================
    // VALIDASI NIK
    // ===========================

    if (
      !nik ||
      !/^\d{16}$/.test(String(nik))
    ) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "NIK harus terdiri dari 16 digit.",
        },
        {
          status: 400,
        }
      );
    }

    // ===========================
    // CEK KEPENDUDUKAN
    // ===========================

    const [pendudukRows]: any =
      await conn.query(
        `
        SELECT nik
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

    if (pendudukRows.length > 0) {
      // =========================
      // UPDATE PENDUDUK
      // =========================

      const updateFields =
        IDENTITY_FIELDS.filter(
          (field) =>
            field !== "nik" &&
            Object.prototype.hasOwnProperty.call(
              identityData,
              field
            )
        );

      if (
        updateFields.length > 0
      ) {
        const setClause =
          updateFields
            .map(
              (field) =>
                `${field} = ?`
            )
            .join(", ");

        const values =
          updateFields.map(
            (field) =>
              identityData[field]
          );

        values.push(nik);

        await conn.query(
          `
          UPDATE kependudukan
          SET ${setClause}
          WHERE nik = ?
          `,
          values
        );
      }
    } else {
      // =========================
      // INSERT PENDUDUK BARU
      // =========================

      await conn.query(
        `
        INSERT INTO kependudukan
        (
          nik,
          nama,
          ttl,
          agama,
          jenis_kelamin,
          status_perkawinan,
          pekerjaan,
          alamat,
          dusun,
          rt,
          rw,
          kewarganegaraan
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nik,
          identityData.nama ?? "",
          identityData.ttl ?? "",
          identityData.agama ?? "",
          identityData.jenis_kelamin ??
            "",
          identityData.status_perkawinan ??
            "",
          identityData.pekerjaan ?? "",
          identityData.alamat ?? "",
          identityData.dusun ?? "",
          identityData.rt ?? "",
          identityData.rw ?? "",
          identityData.kewarganegaraan ??
            "",
        ]
      );
    }

    // =====================================================
    // 2. UPDATE NIK PADA PENGAJUAN
    // =====================================================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET nik = ?
      WHERE id = ?
      `,
      [
        nik,
        id,
      ]
    );

    // =====================================================
    // 3. UPDATE DATA KHUSUS SURAT
    // =====================================================

    const detailFields =
      keys.filter(
        (key) =>
          !IDENTITY_FIELDS.includes(
            key
          ) &&
          !SYSTEM_FIELDS.includes(
            key
          )
      );

    if (
      detailFields.length > 0
    ) {
      const setClause =
        detailFields
          .map(
            (key) =>
              `${key} = ?`
          )
          .join(", ");

      const values =
        detailFields.map(
          (key) =>
            fields[key]
        );

      values.push(id);

      await conn.query(
        `
        UPDATE ${table}
        SET ${setClause}
        WHERE pengajuan_id = ?
        `,
        values
      );
    }

    // =====================================================
    // 4. AMBIL DATA TERBARU
    // =====================================================

    const [
      updatedPengajuanRows,
    ]: any = await conn.query(
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

    const updatedPengajuan =
      updatedPengajuanRows[0];

    // =====================================================
    // 5. AMBIL DATA KEPENDUDUKAN TERBARU
    // =====================================================

    const [
      updatedPendudukRows,
    ]: any = await conn.query(
      `
      SELECT
        nik,
        nama,
        ttl,
        agama,
        jenis_kelamin,
        status_perkawinan,
        pekerjaan,
        alamat,
        dusun,
        rt,
        rw,
        kewarganegaraan
      FROM kependudukan
      WHERE nik = ?
      LIMIT 1
      `,
      [updatedPengajuan.nik]
    );

    const penduduk =
      updatedPendudukRows[0];

    // =====================================================
    // 6. AMBIL DETAIL TERBARU
    // =====================================================

    const [detailRows]: any =
      await conn.query(
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
      await conn.rollback();

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

    // =====================================================
    // 7. BANGUN FIELD TEMPLATE
    // =====================================================

    const templateFields: Record<
      string,
      string
    > = {};

    // ---------------------------
    // Data kependudukan
    // ---------------------------

    if (penduduk) {
      Object.entries(
        penduduk
      ).forEach(
        ([key, value]) => {
          templateFields[key] =
            String(value ?? "");
        }
      );
    }

    // ---------------------------
    // Data khusus surat
    // ---------------------------

    Object.entries(detail).forEach(
      ([key, value]) => {
        if (
          SYSTEM_FIELDS.includes(
            key
          )
        ) {
          return;
        }

        templateFields[key] =
          String(value ?? "");
      }
    );

    // =====================================================
    // 8. FIELD SISTEM
    // =====================================================

    templateFields.nomor_surat =
      updatedPengajuan.nomor_surat ??
      "";

    templateFields.tanggal =
      updatedPengajuan.tanggal_surat
        ? new Date(
            updatedPengajuan.tanggal_surat
          ).toLocaleDateString(
            "id-ID",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          )
        : "";

    // =====================================================
    // 9. DATA KEPALA DESA
    // =====================================================

    if (
      updatedPengajuan.status ===
      "selesai"
    ) {
      templateFields.nama_penandatangan =
        updatedPengajuan.nama_penandatangan ??
        "";

      templateFields.jabatan =
        updatedPengajuan.jabatan_penandatangan ??
        "";
    } else {
      const [
        kepalaDesaRows,
      ]: any = await conn.query(
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

    // =====================================================
    // 10. GENERATE ULANG SURAT
    // =====================================================

    const html = generateSurat(
      updatedPengajuan.template_surat ??
        "",
      templateFields,
      {
        preserveSystemFields: true,
      }
    );

    // =====================================================
    // 11. SIMPAN ISI SURAT
    // =====================================================

    await conn.query(
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

    // =====================================================
    // COMMIT
    // =====================================================

    await conn.commit();

    return NextResponse.json({
      success: true,
      message:
        "Data berhasil diperbarui.",
    });
  } catch (err) {
    await conn.rollback();

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
  } finally {
    conn.release();
  }
}