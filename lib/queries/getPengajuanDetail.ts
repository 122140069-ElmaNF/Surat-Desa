import db from "@/lib/db";

const TABLE_MAP: Record<string, string> = {
  SD: "domisili",
  SKIK: "izin_keramaian",
  STHT: "tafsiran_harga_tanah",
  SKL: "listrik",
  SKTM: "tidak_mampu",
  SKU: "usaha",
  SKJ: "jalan",
  SKH: "kehilangan",
  SKKD: "kebenaran_data",
  SKBNI: "beda_nama_identitas",
  SKTBAPT: "tidak_berlangganan_air",
  SKPHS: "penghasilan",
  SKM: "kematian",
};

const FILE_COLUMNS = [
  "file_ktp",
  "file_kk",
  "file_pengantar_rt",
  "file_pengantar_rw",
  "file_akta_kelahiran",
  "file_buku_nikah",
  "file_surat_kematian",
  "file_surat_kehilangan",
  "file_foto_rumah",
  "file_pendukung",
];

export async function getPengajuanDetail(
  id: number | string
) {
  // =====================================================
  // DATA PENGAJUAN
  // =====================================================

  const [rows] = await db.query(
    `
    SELECT
      ps.*,
      js.nama_surat,
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

  const pengajuan =
    (rows as any[])[0];

  if (!pengajuan) {
    return null;
  }

  // =====================================================
  // TABEL DETAIL
  // =====================================================

  const table =
    TABLE_MAP[pengajuan.kode_surat];

  let detail: {
    key: string;
    label: string;
    value: any;
  }[] = [];

  let dokumen: {
    key: string;
    label: string;
    file: string;
    url: string;
  }[] = [];

  // =====================================================
  // DATA KEPENDUDUKAN PEMOHON
  // =====================================================

  let dataKependudukan: any =
    null;

  if (pengajuan.nik) {
    const [pendudukRows] =
      await db.query(
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
          kewarganegaraan,
          file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [pengajuan.nik]
      );

    dataKependudukan =
      (pendudukRows as any[])[0] ??
      null;
  }

  // =====================================================
  // DATA PERSYARATAN
  // =====================================================

  let dataPersyaratan: any =
    null;

  if (pengajuan.nik) {
    const [persyaratanRows] =
      await db.query(
        `
        SELECT
          nik,
          no_kk,
          file_kk
        FROM persyaratan
        WHERE nik = ?
        LIMIT 1
        `,
        [pengajuan.nik]
      );

    dataPersyaratan =
      (persyaratanRows as any[])[0] ??
      null;
  }

  // =====================================================
  // DATA DETAIL SURAT
  // =====================================================

  let detailRow: any = null;

  if (table) {
    const [detailRows] =
      await db.query(
        `
        SELECT *
        FROM ${table}
        WHERE pengajuan_id = ?
        LIMIT 1
        `,
        [pengajuan.id]
      );

    detailRow =
      (detailRows as any[])[0] ??
      null;
  }

  // =====================================================
  // DATA KEPENDUDUKAN PEMOHON
  //
  // KHUSUS SKPHS:
  // Data kepala keluarga akan dimasukkan
  // melalui blok khusus SKPHS.
  //
  // Jadi untuk SKPHS jangan masukkan
  // identity umum di sini agar tidak dobel.
  // =====================================================

  if (dataKependudukan) {
    if (
      pengajuan.kode_surat !==
      "SKPHS"
    ) {
      const identityFields = [
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

      identityFields.forEach(
        (key) => {
          if (
            dataKependudukan[key] !==
              null &&
            dataKependudukan[key] !==
              undefined
          ) {
            detail.push({
              key,
              label:
                formatLabel(key),
              value:
                normalizeValue(
                  dataKependudukan[
                    key
                  ]
                ),
            });
          }
        }
      );
    }

    // ===================================================
    // DOKUMEN KTP
    // SELALU DIAMBIL DARI KEPENDUDUKAN
    // ===================================================

    if (
      dataKependudukan.file_ktp &&
      String(
        dataKependudukan.file_ktp
      ).trim() !== ""
    ) {
      dokumen.push({
        key: "file_ktp",
        label: "KTP",
        file:
          dataKependudukan.file_ktp,
        url: `/uploads/ktp/${dataKependudukan.file_ktp}`,
      });
    }
  }

  // =====================================================
  // KHUSUS SKTBAPT
  // DATA ORANG KEDUA
  // =====================================================

  if (
    pengajuan.kode_surat ===
      "SKTBAPT" &&
    detailRow?.nik_kedua
  ) {
    const nikKedua =
      detailRow.nik_kedua;

    const [
      pendudukKeduaRows,
    ] = await db.query(
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
      (pendudukKeduaRows as any[])[0] ??
      null;

    // ===================================================
    // NIK KEDUA
    // ===================================================

    detail.push({
      key: "nik_kedua",
      label: "Nik Kedua",
      value:
        normalizeValue(
          nikKedua
        ),
    });

    // ===================================================
    // DATA ORANG KEDUA
    //
    // Digunakan oleh template:
    //
    // {{nama_calon}}
    // {{ttl_calon}}
    // {{alamat_calon}}
    // ===================================================

    if (pendudukKedua) {
      detail.push({
        key: "nama_calon",
        label: "Nama Calon",
        value:
          normalizeValue(
            pendudukKedua.nama
          ),
      });

      detail.push({
        key: "ttl_calon",
        label: "Ttl Calon",
        value:
          normalizeValue(
            pendudukKedua.ttl
          ),
      });

      detail.push({
        key: "alamat_calon",
        label: "Alamat Calon",
        value:
          normalizeValue(
            pendudukKedua.alamat
          ),
      });
    }

    // ===================================================
    // PROGRAM STUDI
    // ===================================================

    if (
      detailRow.prodi_kedua !==
        null &&
      detailRow.prodi_kedua !==
        undefined
    ) {
      detail.push({
        key: "prodi_kedua",
        label: "Prodi Kedua",
        value:
          normalizeValue(
            detailRow.prodi_kedua
          ),
      });
    }
  }

  // =====================================================
  // KHUSUS SKPHS
  //
  // DATA KEPALA KELUARGA
  // +
  // DATA ANAK
  // =====================================================

  if (
    pengajuan.kode_surat ===
      "SKPHS" &&
    detailRow
  ) {
    const nikKepalaKeluarga =
      detailRow.nik_kepala_keluarga ??
      "";

    const nikAnak =
      detailRow.nik_anak ??
      "";

    // ===================================================
    // DATA KEPALA KELUARGA
    // ===================================================

    let kepalaKeluarga: any =
      null;

    if (nikKepalaKeluarga) {
      const [
        kepalaKeluargaRows,
      ] = await db.query(
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
        [nikKepalaKeluarga]
      );

      kepalaKeluarga =
        (kepalaKeluargaRows as any[])[0] ??
        null;
    }

    // ===================================================
    // DATA ANAK
    // ===================================================

    let anak: any = null;

    if (nikAnak) {
      const [anakRows] =
        await db.query(
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

      anak =
        (anakRows as any[])[0] ??
        null;
    }

    // ===================================================
    // KEPALA KELUARGA
    // ===================================================

    detail.push({
      key: "nik_kepala_keluarga",
      label:
        "Nik Kepala Keluarga",
      value:
        normalizeValue(
          nikKepalaKeluarga
        ),
    });

    if (kepalaKeluarga) {
      detail.push({
        key:
          "nama_kepala_keluarga",
        label:
          "Nama Kepala Keluarga",
        value:
          normalizeValue(
            kepalaKeluarga.nama
          ),
      });

      detail.push({
        key:
          "ttl_kepala_keluarga",
        label:
          "Ttl Kepala Keluarga",
        value:
          normalizeValue(
            kepalaKeluarga.ttl
          ),
      });

      detail.push({
        key:
          "jenis_kelamin_kepala_keluarga",
        label:
          "Jenis Kelamin Kepala Keluarga",
        value:
          normalizeValue(
            kepalaKeluarga.jenis_kelamin
          ),
      });

      detail.push({
        key:
          "kewarganegaraan_kepala_keluarga",
        label:
          "Kewarganegaraan Kepala Keluarga",
        value:
          normalizeValue(
            kepalaKeluarga.kewarganegaraan
          ),
      });

      detail.push({
        key:
          "agama_kepala_keluarga",
        label:
          "Agama Kepala Keluarga",
        value:
          normalizeValue(
            kepalaKeluarga.agama
          ),
      });

      detail.push({
        key:
          "pekerjaan_kepala_keluarga",
        label:
          "Pekerjaan Kepala Keluarga",
        value:
          normalizeValue(
            kepalaKeluarga.pekerjaan
          ),
      });

      detail.push({
        key:
          "alamat_kepala_keluarga",
        label:
          "Alamat Kepala Keluarga",
        value:
          normalizeValue(
            kepalaKeluarga.alamat
          ),
      });
    }

    // ===================================================
    // DATA ANAK
    // ===================================================

    detail.push({
      key: "nik_anak",
      label: "Nik Anak",
      value:
        normalizeValue(
          nikAnak
        ),
    });

    if (anak) {
      detail.push({
        key: "nama_anak",
        label: "Nama Anak",
        value:
          normalizeValue(
            anak.nama
          ),
      });

      detail.push({
        key: "ttl_anak",
        label: "Ttl Anak",
        value:
          normalizeValue(
            anak.ttl
          ),
      });

      detail.push({
        key:
          "jenis_kelamin_anak",
        label:
          "Jenis Kelamin Anak",
        value:
          normalizeValue(
            anak.jenis_kelamin
          ),
      });

      detail.push({
        key:
          "kewarganegaraan_anak",
        label:
          "Kewarganegaraan Anak",
        value:
          normalizeValue(
            anak.kewarganegaraan
          ),
      });

      detail.push({
        key: "agama_anak",
        label: "Agama Anak",
        value:
          normalizeValue(
            anak.agama
          ),
      });

      detail.push({
        key:
          "pekerjaan_anak",
        label:
          "Pekerjaan Anak",
        value:
          normalizeValue(
            anak.pekerjaan
          ),
      });

      detail.push({
        key:
          "alamat_anak",
        label:
          "Alamat Anak",
        value:
          normalizeValue(
            anak.alamat
          ),
      });
    }

    // ===================================================
    // PENGHASILAN
    // ===================================================

    if (
      detailRow.penghasilan !==
        null &&
      detailRow.penghasilan !==
        undefined
    ) {
      detail.push({
        key: "penghasilan",
        label: "Penghasilan",
        value:
          normalizeValue(
            detailRow.penghasilan
          ),
      });
    }
  }

  // =====================================================
  // NOMOR KK
  // KHUSUS SKKD
  // =====================================================

  if (
    pengajuan.kode_surat ===
      "SKKD" &&
    dataPersyaratan?.no_kk
  ) {
    detail.push({
      key: "no_kk",
      label: "No KK",
      value:
        normalizeValue(
          dataPersyaratan.no_kk
        ),
    });
  }

  // =====================================================
  // DOKUMEN KK
  // KHUSUS SKKD
  // =====================================================

  if (
    pengajuan.kode_surat ===
      "SKKD" &&
    dataPersyaratan?.file_kk &&
    String(
      dataPersyaratan.file_kk
    ).trim() !== ""
  ) {
    dokumen.push({
      key: "file_kk",
      label: "KK",
      file:
        dataPersyaratan.file_kk,
      url: `/uploads/kk/${dataPersyaratan.file_kk}`,
    });
  }

  // =====================================================
  // DATA KHUSUS SURAT
  // =====================================================

  if (detailRow) {
    Object.keys(detailRow)
      .filter(
        (key) =>
          ![
            "id",
            "pengajuan_id",
            "created_at",
            "updated_at",
            ...FILE_COLUMNS,

            // =========================================
            // DATA IDENTITAS PEMOHON
            // =========================================

            "nama",
            "nik",
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

            // =========================================
            // FIELD SKTBAPT
            // SUDAH DIBUAT DI BLOK KHUSUS
            // =========================================

            ...(pengajuan.kode_surat ===
            "SKTBAPT"
              ? [
                  "nik_kedua",
                  "prodi_kedua",
                ]
              : []),

            // =========================================
            // FIELD SKPHS
            // SUDAH DIBUAT DI BLOK KHUSUS
            // =========================================

            ...(pengajuan.kode_surat ===
            "SKPHS"
              ? [
                  "nik_kepala_keluarga",
                  "nik_anak",
                  "penghasilan",
                ]
              : []),
          ].includes(key)
      )
      .forEach((key) => {
        detail.push({
          key,
          label: formatLabel(key),
          value:
            normalizeValue(
              detailRow[key]
            ),
        });
      });

    // ===================================================
    // DOKUMEN LAIN
    // ===================================================

    const dokumenDetail =
      FILE_COLUMNS
        .filter(
          (column) =>
            column !== "file_ktp" &&
            column !== "file_kk" &&
            detailRow[column] &&
            String(
              detailRow[column]
            ).trim() !== ""
        )
        .map((column) => ({
          key: column,
          label: formatLabel(column),
          file: detailRow[column],
          url: `/uploads/${getFolder(
            column
          )}/${detailRow[column]}`,
        }));

    dokumen.push(
      ...dokumenDetail
    );
  }

  // =====================================================
  // NOMOR KK UNTUK INITIAL DATA
  // =====================================================

  pengajuan.no_kk =
    dataPersyaratan?.no_kk ?? "";

  // =====================================================
  // RETURN
  // =====================================================

  return {
    pengajuan,
    detail,
    dokumen,
    table,
  };
}

// =======================================================
// NORMALIZE VALUE
// =======================================================

function normalizeValue(
  value: any
) {
  // Nilai kosong
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  // =====================================================
  // DATE DARI DATABASE
  // =====================================================

  if (value instanceof Date) {
    const year =
      value.getFullYear();

    const month =
      String(
        value.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        value.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // =====================================================
  // BIGINT
  // =====================================================

  if (
    typeof value === "bigint"
  ) {
    return value.toString();
  }

  // =====================================================
  // NILAI LAIN
  // =====================================================

  return String(value);
}

// =======================================================
// FORMAT LABEL
// =======================================================

function formatLabel(
  column: string
) {
  return column
    .replace("file_", "")
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (c) => c.toUpperCase()
    );
}

// =======================================================
// FOLDER FILE
// =======================================================

function getFolder(
  column: string
) {
  switch (column) {
    case "file_ktp":
      return "ktp";

    case "file_kk":
      return "kk";

    default:
      return "dokumen";
  }
}