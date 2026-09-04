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

// =====================================================
// FIELD KHUSUS SKTBAPT
// Field ini TIDAK disimpan ke tabel
// tidak_berlangganan_air secara generic.
// =====================================================

const SKTBAPT_FIELDS = [
  "nik_pertama",
  "nik_kedua",
  "nama_calon",
  "ttl_calon",
  "alamat_calon",
  "prodi_kedua",
];

// =====================================================
// FIELD KHUSUS SKPHS
// Field identitas kepala keluarga dan anak
// disimpan di tabel kependudukan.
// Yang masuk tabel penghasilan hanya:
// nik_kepala_keluarga
// nik_anak
// penghasilan
// =====================================================

const SKPHS_FIELDS = [
  "nik_kepala_keluarga",
  "nama_kepala_keluarga",
  "ttl_kepala_keluarga",
  "jenis_kelamin_kepala_keluarga",
  "kewarganegaraan_kepala_keluarga",
  "agama_kepala_keluarga",
  "pekerjaan_kepala_keluarga",
  "alamat_kepala_keluarga",

  "nik_anak",
  "nama_anak",
  "ttl_anak",
  "jenis_kelamin_anak",
  "kewarganegaraan_anak",
  "agama_anak",
  "pekerjaan_anak",
  "alamat_anak",
];

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const conn = await db.getConnection();

  try {
    const { id } = await params;

    const body = await req.json();

    const {
      table,
      fields,
    } = body;

    // =====================================================
    // VALIDASI TABLE
    // =====================================================

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

    // =====================================================
    // VALIDASI FIELDS
    // =====================================================

    if (
      !fields ||
      typeof fields !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    const keys =
      Object.keys(fields);

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

    // =====================================================
    // AMBIL DATA PENGAJUAN
    // =====================================================

    const [
      pengajuanRows,
    ]: any = await conn.query(
      `
      SELECT
        ps.*,
        js.kode_surat,
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
    // KHUSUS SKTBAPT
    // AMBIL NIK ORANG KEDUA LAMA
    // =====================================================

    let oldNikKedua = "";

    if (
      pengajuan.kode_surat ===
      "SKTBAPT"
    ) {
      const [
        oldDetailRows,
      ]: any = await conn.query(
        `
        SELECT
          nik_kedua
        FROM tidak_berlangganan_air
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [id]
      );

      oldNikKedua =
        oldDetailRows[0]
          ?.nik_kedua ?? "";
    }

    // =====================================================
    // 1. DATA KEPENDUDUKAN ORANG PERTAMA
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

    // =====================================================
    // KHUSUS SKPHS
    //
    // Untuk SKPHS NIK utama berasal dari:
    // nik_kepala_keluarga
    //
    // Bukan dari field "nik" biasa.
    // =====================================================

    let nik =
      identityData.nik ??
      pengajuan.nik;

    if (
      pengajuan.kode_surat ===
        "SKPHS" &&
      fields.nik_kepala_keluarga
    ) {
      nik =
        fields.nik_kepala_keluarga;
    }

    // =====================================================
    // VALIDASI NIK PERTAMA
    // =====================================================

    if (
      !nik ||
      !/^\d{16}$/.test(
        String(nik)
      )
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

    // =====================================================
    // CEK KEPENDUDUKAN PERTAMA
    // =====================================================

    const [
      pendudukRows,
    ]: any = await conn.query(
      `
      SELECT
        nik
      FROM kependudukan
      WHERE nik = ?
      LIMIT 1
      `,
      [nik]
    );

    // =====================================================
    // 2. UPDATE / INSERT KEPENDUDUKAN UMUM
    //
    // SKPHS ditangani khusus di bagian berikutnya.
    // =====================================================

    if (
      pengajuan.kode_surat !==
      "SKPHS"
    ) {
      if (
        pendudukRows.length > 0
      ) {
        // =========================
        // UPDATE PENDUDUK PERTAMA
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
                identityData[
                  field
                ]
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
        // INSERT PENDUDUK PERTAMA
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
            identityData.nama ??
              "",
            identityData.ttl ??
              "",
            identityData.agama ??
              "",
            identityData.jenis_kelamin ??
              "",
            identityData.status_perkawinan ??
              "",
            identityData.pekerjaan ??
              "",
            identityData.alamat ??
              "",
            identityData.dusun ??
              "",
            identityData.rt ??
              "",
            identityData.rw ??
              "",
            identityData.kewarganegaraan ??
              "",
          ]
        );
      }
    }

    // =====================================================
    // 3. UPDATE NIK PADA PENGAJUAN
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
    // 4. UPDATE NOMOR KK
    // KHUSUS SKKD
    // =====================================================

    if (
      pengajuan.kode_surat ===
        "SKKD" &&
      Object.prototype.hasOwnProperty.call(
        fields,
        "no_kk"
      )
    ) {
      const noKk =
        fields.no_kk ?? "";

      const [
        persyaratanRows,
      ]: any = await conn.query(
        `
        SELECT
          id
        FROM persyaratan
        WHERE nik = ?
        LIMIT 1
        `,
        [nik]
      );

      if (
        persyaratanRows.length > 0
      ) {
        await conn.query(
          `
          UPDATE persyaratan
          SET no_kk = ?
          WHERE nik = ?
          `,
          [
            noKk,
            nik,
          ]
        );
      } else {
        await conn.query(
          `
          INSERT INTO persyaratan
          (
            nik,
            no_kk
          )
          VALUES
          (?, ?)
          `,
          [
            nik,
            noKk,
          ]
        );
      }
    }

    // =====================================================
    // 5. KHUSUS SKTBAPT
    // UPDATE DATA ORANG KEDUA
    // =====================================================

    if (
      pengajuan.kode_surat ===
      "SKTBAPT"
    ) {
      const nikKedua =
        fields.nik_kedua ??
        oldNikKedua ??
        "";

      // ===========================
      // VALIDASI NIK KEDUA
      // ===========================

      if (
        !nikKedua ||
        !/^\d{16}$/.test(
          String(nikKedua)
        )
      ) {
        await conn.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "NIK kedua harus terdiri dari 16 digit.",
          },
          {
            status: 400,
          }
        );
      }

      // ===========================
      // DATA ORANG KEDUA
      // ===========================

      const namaCalon =
        fields.nama_calon ??
        fields.nama_kedua ??
        "";

      const ttlCalon =
        fields.ttl_calon ??
        fields.ttl_kedua ??
        "";

      const alamatCalon =
        fields.alamat_calon ??
        fields.alamat_kedua ??
        "";

      const prodiKedua =
        fields.prodi_kedua ??
        "";

      // ===========================
      // CEK KEPENDUDUKAN
      // ===========================

      const [
        pendudukKeduaRows,
      ]: any = await conn.query(
        `
        SELECT
          nik
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nikKedua]
      );

      if (
        pendudukKeduaRows.length >
        0
      ) {
        await conn.query(
          `
          UPDATE kependudukan
          SET
            nama = ?,
            ttl = ?,
            alamat = ?
          WHERE nik = ?
          `,
          [
            namaCalon,
            ttlCalon,
            alamatCalon,
            nikKedua,
          ]
        );
      } else {
        await conn.query(
          `
          INSERT INTO kependudukan
          (
            nik,
            nama,
            ttl,
            alamat
          )
          VALUES
          (?, ?, ?, ?)
          `,
          [
            nikKedua,
            namaCalon,
            ttlCalon,
            alamatCalon,
          ]
        );
      }

      // ===========================
      // UPDATE DETAIL SKTBAPT
      // ===========================

      await conn.query(
        `
        UPDATE tidak_berlangganan_air
        SET
          nik_pertama = ?,
          nik_kedua = ?,
          prodi_kedua = ?
        WHERE pengajuan_id = ?
        `,
        [
          fields.nik_pertama ??
            nik,
          nikKedua,
          prodiKedua,
          id,
        ]
      );
    }

    // =====================================================
    // 6. KHUSUS SKPHS
    //
    // UPDATE KEPALA KELUARGA
    // UPDATE ANAK
    //
    // Field identitas TIDAK masuk ke tabel penghasilan.
    // =====================================================

    if (
      pengajuan.kode_surat ===
      "SKPHS"
    ) {
      // ===================================================
      // NIK KEPALA KELUARGA
      // ===================================================

      const nikKepalaKeluarga =
        fields.nik_kepala_keluarga ??
        "";

      if (
        !nikKepalaKeluarga ||
        !/^\d{16}$/.test(
          String(
            nikKepalaKeluarga
          )
        )
      ) {
        await conn.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "NIK kepala keluarga harus terdiri dari 16 digit.",
          },
          {
            status: 400,
          }
        );
      }

      // ===================================================
      // DATA KEPALA KELUARGA
      // ===================================================

      const [
        kepalaKeluargaRows,
      ]: any = await conn.query(
        `
        SELECT
          nik
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [
          nikKepalaKeluarga,
        ]
      );

      if (
        kepalaKeluargaRows.length >
        0
      ) {
        // =========================
        // UPDATE KEPALA KELUARGA
        // =========================

        await conn.query(
          `
          UPDATE kependudukan
          SET
            nama = ?,
            ttl = ?,
            jenis_kelamin = ?,
            kewarganegaraan = ?,
            agama = ?,
            pekerjaan = ?,
            alamat = ?
          WHERE nik = ?
          `,
          [
            fields.nama_kepala_keluarga ??
              "",
            fields.ttl_kepala_keluarga ??
              "",
            fields.jenis_kelamin_kepala_keluarga ??
              "",
            fields.kewarganegaraan_kepala_keluarga ??
              "",
            fields.agama_kepala_keluarga ??
              "",
            fields.pekerjaan_kepala_keluarga ??
              "",
            fields.alamat_kepala_keluarga ??
              "",
            nikKepalaKeluarga,
          ]
        );
      } else {
        // =========================
        // INSERT KEPALA KELUARGA
        // =========================

        await conn.query(
          `
          INSERT INTO kependudukan
          (
            nik,
            nama,
            ttl,
            jenis_kelamin,
            kewarganegaraan,
            agama,
            pekerjaan,
            alamat
          )
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            nikKepalaKeluarga,
            fields.nama_kepala_keluarga ??
              "",
            fields.ttl_kepala_keluarga ??
              "",
            fields.jenis_kelamin_kepala_keluarga ??
              "",
            fields.kewarganegaraan_kepala_keluarga ??
              "",
            fields.agama_kepala_keluarga ??
              "",
            fields.pekerjaan_kepala_keluarga ??
              "",
            fields.alamat_kepala_keluarga ??
              "",
          ]
        );
      }

      // ===================================================
      // NIK ANAK
      // ===================================================

      const nikAnak =
        fields.nik_anak ??
        "";

      if (
        !nikAnak ||
        !/^\d{16}$/.test(
          String(nikAnak)
        )
      ) {
        await conn.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "NIK anak harus terdiri dari 16 digit.",
          },
          {
            status: 400,
          }
        );
      }

      // ===================================================
      // CEK DATA ANAK
      // ===================================================

      const [
        anakRows,
      ]: any = await conn.query(
        `
        SELECT
          nik
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nikAnak]
      );

      if (
        anakRows.length > 0
      ) {
        // =========================
        // UPDATE ANAK
        // =========================

        await conn.query(
          `
          UPDATE kependudukan
          SET
            nama = ?,
            ttl = ?,
            jenis_kelamin = ?,
            kewarganegaraan = ?,
            agama = ?,
            pekerjaan = ?,
            alamat = ?
          WHERE nik = ?
          `,
          [
            fields.nama_anak ??
              "",
            fields.ttl_anak ??
              "",
            fields.jenis_kelamin_anak ??
              "",
            fields.kewarganegaraan_anak ??
              "",
            fields.agama_anak ??
              "",
            fields.pekerjaan_anak ??
              "",
            fields.alamat_anak ??
              "",
            nikAnak,
          ]
        );
      } else {
        // =========================
        // INSERT ANAK
        // =========================

        await conn.query(
          `
          INSERT INTO kependudukan
          (
            nik,
            nama,
            ttl,
            jenis_kelamin,
            kewarganegaraan,
            agama,
            pekerjaan,
            alamat
          )
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            nikAnak,
            fields.nama_anak ??
              "",
            fields.ttl_anak ??
              "",
            fields.jenis_kelamin_anak ??
              "",
            fields.kewarganegaraan_anak ??
              "",
            fields.agama_anak ??
              "",
            fields.pekerjaan_anak ??
              "",
            fields.alamat_anak ??
              "",
          ]
        );
      }
    }

    // =====================================================
    // 7. UPDATE DATA KHUSUS SURAT
    //
    // HANYA FIELD YANG BENAR-BENAR ADA
    // DI TABEL DETAIL YANG BOLEH MASUK SINI.
    // =====================================================

    const detailFields =
      keys.filter(
        (key) =>
          !IDENTITY_FIELDS.includes(
            key
          ) &&
          !SYSTEM_FIELDS.includes(
            key
          ) &&
          key !== "no_kk" &&
          !SKTBAPT_FIELDS.includes(
            key
          ) &&
          !SKPHS_FIELDS.includes(
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
    // 8. KHUSUS SKPHS
    //
    // UPDATE FIELD YANG MEMANG ADA DI TABEL PENGHASILAN
    //
    // HANYA:
    // - nik_kepala_keluarga
    // - nik_anak
    // - penghasilan
    // =====================================================

    if (
      pengajuan.kode_surat ===
      "SKPHS"
    ) {
      await conn.query(
        `
        UPDATE penghasilan
        SET
          nik_kepala_keluarga = ?,
          nik_anak = ?,
          penghasilan = ?
        WHERE pengajuan_id = ?
        `,
        [
          fields.nik_kepala_keluarga ??
            nik,
          fields.nik_anak ??
            "",
          fields.penghasilan ??
            "",
          id,
        ]
      );
    }

    // =====================================================
    // 9. AMBIL DATA PENGAJUAN TERBARU
    // =====================================================

    const [
      updatedPengajuanRows,
    ]: any = await conn.query(
      `
      SELECT
        ps.*,
        js.kode_surat,
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
    // 10. AMBIL DATA KEPENDUDUKAN PERTAMA
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
    // 11. AMBIL DATA DETAIL TERBARU
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
    // 12. BANGUN FIELD TEMPLATE
    // =====================================================

    const templateFields: Record<
      string,
      string
    > = {};

    // =====================================================
    // DATA KEPENDUDUKAN UMUM
    // =====================================================

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

    // =====================================================
    // DATA DETAIL
    // =====================================================

    Object.entries(detail).forEach(
      ([key, value]) => {
        if (
          SYSTEM_FIELDS.includes(
            key
          )
        ) {
          return;
        }

        // Jangan masukkan field khusus
        // SKPHS karena akan dibangun
        // dari kependudukan di bawah.
        if (
          updatedPengajuan.kode_surat ===
            "SKPHS" &&
          SKPHS_FIELDS.includes(
            key
          )
        ) {
          return;
        }

        // Jangan masukkan field khusus
        // SKTBAPT yang berasal dari
        // kependudukan.
        if (
          updatedPengajuan.kode_surat ===
            "SKTBAPT" &&
          [
            "nama_calon",
            "ttl_calon",
            "alamat_calon",
          ].includes(key)
        ) {
          return;
        }

        templateFields[key] =
          String(value ?? "");
      }
    );

    // =====================================================
    // 13. KHUSUS SKTBAPT
    // AMBIL DATA ORANG KEDUA TERBARU
    // =====================================================

    if (
      updatedPengajuan.kode_surat ===
      "SKTBAPT"
    ) {
      const nikKedua =
        detail.nik_kedua ??
        "";

      if (nikKedua) {
        const [
          pendudukKeduaRows,
        ]: any = await conn.query(
          `
          SELECT
            nik,
            nama,
            ttl,
            alamat
          FROM kependudukan
          WHERE nik = ?
          LIMIT 1
          `,
          [nikKedua]
        );

        const pendudukKedua =
          pendudukKeduaRows[0];

        if (pendudukKedua) {
          templateFields.nama_calon =
            String(
              pendudukKedua.nama ??
                ""
            );

          templateFields.ttl_calon =
            String(
              pendudukKedua.ttl ??
                ""
            );

          templateFields.nik_kedua =
            String(
              pendudukKedua.nik ??
                nikKedua
            );

          templateFields.alamat_calon =
            String(
              pendudukKedua.alamat ??
                ""
            );
        }

        templateFields.prodi_kedua =
          String(
            detail.prodi_kedua ??
              ""
          );
      }
    }

    // =====================================================
    // 14. KHUSUS SKPHS
    // BANGUN FIELD TEMPLATE DARI KEPENDUDUKAN
    // =====================================================

    if (
      updatedPengajuan.kode_surat ===
      "SKPHS"
    ) {
      const nikKepalaKeluarga =
        detail.nik_kepala_keluarga ??
        updatedPengajuan.nik ??
        "";

      const nikAnak =
        detail.nik_anak ??
        "";

      // ===================================================
      // DATA KEPALA KELUARGA TERBARU
      // ===================================================

      if (
        nikKepalaKeluarga
      ) {
        const [
          kepalaKeluargaRows,
        ]: any = await conn.query(
          `
          SELECT
            nik,
            nama,
            ttl,
            jenis_kelamin,
            kewarganegaraan,
            agama,
            pekerjaan,
            alamat
          FROM kependudukan
          WHERE nik = ?
          LIMIT 1
          `,
          [
            nikKepalaKeluarga,
          ]
        );

        const kepalaKeluarga =
          kepalaKeluargaRows[0];

        if (kepalaKeluarga) {
          templateFields.nik_kepala_keluarga =
            String(
              kepalaKeluarga.nik ??
                ""
            );

          templateFields.nama_kepala_keluarga =
            String(
              kepalaKeluarga.nama ??
                ""
            );

          templateFields.ttl_kepala_keluarga =
            String(
              kepalaKeluarga.ttl ??
                ""
            );

          templateFields.jenis_kelamin_kepala_keluarga =
            String(
              kepalaKeluarga.jenis_kelamin ??
                ""
            );

          templateFields.kewarganegaraan_kepala_keluarga =
            String(
              kepalaKeluarga.kewarganegaraan ??
                ""
            );

          templateFields.agama_kepala_keluarga =
            String(
              kepalaKeluarga.agama ??
                ""
            );

          templateFields.pekerjaan_kepala_keluarga =
            String(
              kepalaKeluarga.pekerjaan ??
                ""
            );

          templateFields.alamat_kepala_keluarga =
            String(
              kepalaKeluarga.alamat ??
                ""
            );
        }
      }

      // ===================================================
      // DATA ANAK TERBARU
      // ===================================================

      if (nikAnak) {
        const [
          anakRows,
        ]: any = await conn.query(
          `
          SELECT
            nik,
            nama,
            ttl,
            jenis_kelamin,
            kewarganegaraan,
            agama,
            pekerjaan,
            alamat
          FROM kependudukan
          WHERE nik = ?
          LIMIT 1
          `,
          [nikAnak]
        );

        const anak =
          anakRows[0];

        if (anak) {
          templateFields.nik_anak =
            String(
              anak.nik ??
                ""
            );

          templateFields.nama_anak =
            String(
              anak.nama ??
                ""
            );

          templateFields.ttl_anak =
            String(
              anak.ttl ??
                ""
            );

          templateFields.jenis_kelamin_anak =
            String(
              anak.jenis_kelamin ??
                ""
            );

          templateFields.kewarganegaraan_anak =
            String(
              anak.kewarganegaraan ??
                ""
            );

          templateFields.agama_anak =
            String(
              anak.agama ??
                ""
            );

          templateFields.pekerjaan_anak =
            String(
              anak.pekerjaan ??
                ""
            );

          templateFields.alamat_anak =
            String(
              anak.alamat ??
                ""
            );
        }
      }

      // ===================================================
      // PENGHASILAN
      // ===================================================

      templateFields.penghasilan =
        String(
          detail.penghasilan ??
            ""
        );
    }

    // =====================================================
    // 15. AMBIL NO KK
    // =====================================================

    if (
      updatedPengajuan.nik
    ) {
      const [
        persyaratanRows,
      ]: any = await conn.query(
        `
        SELECT
          no_kk
        FROM persyaratan
        WHERE nik = ?
        LIMIT 1
        `,
        [updatedPengajuan.nik]
      );

      const persyaratan =
        persyaratanRows[0];

      templateFields.no_kk =
        String(
          persyaratan?.no_kk ??
            ""
        );
    }

    // =====================================================
    // 16. FIELD SISTEM
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
    // 17. DATA KEPALA DESA
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
        kepalaDesa?.nama ??
        "";

      templateFields.jabatan =
        "Kepala Desa Sumberejo";
    }

    // =====================================================
    // 18. GENERATE ULANG SURAT
    // =====================================================

    const html =
      generateSurat(
        updatedPengajuan.template_surat ??
          "",
        templateFields,
        {
          preserveSystemFields:
            true,
        }
      );

    // =====================================================
    // 19. SIMPAN ISI SURAT
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