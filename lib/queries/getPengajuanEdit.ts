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

export default async function getPengajuanEdit(
  id: number | string
) {
  // ===========================
  // AMBIL DATA PENGAJUAN
  // ===========================

  const [rows] = await db.query(
    `
    SELECT
      ps.*,
      js.nama_surat,
      js.kode_surat
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

  // ===========================
  // TENTUKAN TABEL DETAIL
  // ===========================

  const table =
    TABLE_MAP[pengajuan.kode_surat];

  type DetailRow =
    Record<string, any>;

  let detail: DetailRow | null =
    null;

  const dokumen: Record<
    string,
    string
  > = {};

  // =====================================================
  // AMBIL DATA DETAIL SURAT
  // =====================================================

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

    detail =
      ((detailRows as any[])[0] as
        | DetailRow
        | undefined) ?? null;

    // ===================================================
    // AMBIL DOKUMEN DARI DETAIL
    // ===================================================

    if (detail) {
      FILE_COLUMNS.forEach(
        (column) => {
          // KTP sudah dipindahkan
          // ke kependudukan
          if (column === "file_ktp") {
            return;
          }

          // KK SKKD diambil dari persyaratan
          if (
            column === "file_kk" &&
            pengajuan.kode_surat ===
              "SKKD"
          ) {
            return;
          }

          const value =
            detail?.[column];

          if (
            value &&
            String(value).trim() !== ""
          ) {
            dokumen[column] =
              value;
          }
        }
      );
    }
  }

  // =====================================================
  // KHUSUS SKTBAPT
  //
  // NIK PERTAMA DAN NIK KEDUA
  // BERASAL DARI TABEL DETAIL
  // =====================================================

  if (
    pengajuan.kode_surat ===
      "SKTBAPT" &&
    detail
  ) {
    const nikPertama =
      detail.nik_pertama ?? "";

    const nikKedua =
      detail.nik_kedua ?? "";

    // ===================================================
    // KEPENDUDUKAN ORANG PERTAMA
    // ===================================================

    let pendudukPertama:
      DetailRow | null = null;

    if (nikPertama) {
      const [
        pendudukPertamaRows,
      ] = await db.query(
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
        [nikPertama]
      );

      pendudukPertama =
        (
          pendudukPertamaRows as any[]
        )[0] ?? null;
    }

    // ===================================================
    // KEPENDUDUKAN ORANG KEDUA
    // ===================================================

    let pendudukKedua:
      DetailRow | null = null;

    if (nikKedua) {
      const [
        pendudukKeduaRows,
      ] = await db.query(
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
        [nikKedua]
      );

      pendudukKedua =
        (
          pendudukKeduaRows as any[]
        )[0] ?? null;
    }

    // ===================================================
    // BENTUK ULANG DATA AGAR SESUAI DENGAN FORM
    // ===================================================

    detail = {
      ...detail,

      // ===============================================
      // ORANG PERTAMA
      // ===============================================

      nik_pertama:
        nikPertama,

      nama_pertama:
        pendudukPertama?.nama ??
        "",

      ttl_pertama:
        pendudukPertama?.ttl ??
        "",

      agama_pertama:
        pendudukPertama?.agama ??
        "",

      jenis_kelamin_pertama:
        pendudukPertama?.jenis_kelamin ??
        "",

      status_perkawinan_pertama:
        pendudukPertama?.status_perkawinan ??
        "",

      pekerjaan_pertama:
        pendudukPertama?.pekerjaan ??
        "",

      alamat_pertama:
        pendudukPertama?.alamat ??
        "",

      dusun_pertama:
        pendudukPertama?.dusun ??
        "",

      rt_pertama:
        pendudukPertama?.rt ??
        "",

      rw_pertama:
        pendudukPertama?.rw ??
        "",

      kewarganegaraan_pertama:
        pendudukPertama?.kewarganegaraan ??
        "",

      // ===============================================
      // ORANG KEDUA / CALON MAHASISWA
      // ===============================================

      nik_kedua:
        nikKedua,

      nama_kedua:
        pendudukKedua?.nama ??
        "",

      ttl_kedua:
        pendudukKedua?.ttl ??
        "",

      alamat_kedua:
        pendudukKedua?.alamat ??
        "",

      // Tetap dari tabel
      // tidak_berlangganan_air
      prodi_kedua:
        detail.prodi_kedua ??
        "",
    };

    // ===================================================
    // KTP ORANG PERTAMA
    // ===================================================

    if (
      pendudukPertama?.file_ktp &&
      String(
        pendudukPertama.file_ktp
      ).trim() !== ""
    ) {
      dokumen.file_ktp =
        pendudukPertama.file_ktp;
    }

    // ===================================================
    // PASTIKAN NIK PERTAMA DAN KEDUA
    // TETAP BERASAL DARI DETAIL
    // ===================================================

    detail.nik_pertama =
      nikPertama;

    detail.nik_kedua =
      nikKedua;
  } else {
    // ===================================================
    // SURAT BIASA
    // AMBIL DATA KEPENDUDUKAN BERDASARKAN
    // pengajuan.nik
    // ===================================================

    let dataKependudukan:
      DetailRow | null = null;

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

    // ===================================================
    // KHUSUS SKKD
    // AMBIL NOMOR KK DAN FILE KK
    // ===================================================

    if (
      pengajuan.kode_surat ===
        "SKKD" &&
      pengajuan.nik
    ) {
      const [
        persyaratanRows,
      ] = await db.query(
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

      const persyaratan =
        (
          persyaratanRows as any[]
        )[0] ?? null;

      pengajuan.no_kk =
        persyaratan?.no_kk ??
        "";

      if (
        persyaratan?.file_kk &&
        String(
          persyaratan.file_kk
        ).trim() !== ""
      ) {
        dokumen.file_kk =
          persyaratan.file_kk;
      }
    }

    // ===================================================
    // GABUNGKAN DATA KEPENDUDUKAN
    // ===================================================

    if (dataKependudukan) {
      detail = {
        ...(detail ?? {}),
        ...dataKependudukan,
      };

      if (
        dataKependudukan.file_ktp &&
        String(
          dataKependudukan.file_ktp
        ).trim() !== ""
      ) {
        dokumen.file_ktp =
          dataKependudukan.file_ktp;
      }
    }
  }

  // ===========================
  // RETURN
  // ===========================

  return {
    pengajuan,
    detail,
    dokumen,
    table,
    kodeSurat:
      pengajuan.kode_surat,
  };
}