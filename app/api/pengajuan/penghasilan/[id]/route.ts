import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  writeFile,
  unlink,
  mkdir,
} from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { logActivity } from "@/lib/activity";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  const conn =
    await db.getConnection();

  let newFilePath:
    string | null = null;

  let oldFileName:
    string | null = null;

  try {
    const { id } =
      await params;

    const formData =
      await request.formData();

    // =====================================================
    // DATA KEPALA KELUARGA
    // =====================================================

    const nikKepalaKeluarga =
      String(
        formData.get(
          "nik_kepala_keluarga"
        ) ?? ""
      ).trim();

    const namaKepalaKeluarga =
      String(
        formData.get(
          "nama_kepala_keluarga"
        ) ?? ""
      ).trim();

    const ttlKepalaKeluarga =
      String(
        formData.get(
          "ttl_kepala_keluarga"
        ) ?? ""
      ).trim();

    const agamaKepalaKeluarga =
      String(
        formData.get(
          "agama_kepala_keluarga"
        ) ?? ""
      ).trim();

    const jenisKelaminKepalaKeluarga =
      String(
        formData.get(
          "jenis_kelamin_kepala_keluarga"
        ) ?? ""
      ).trim();

    const statusPerkawinanKepalaKeluarga =
      String(
        formData.get(
          "status_perkawinan_kepala_keluarga"
        ) ?? ""
      ).trim();

    const pekerjaanKepalaKeluarga =
      String(
        formData.get(
          "pekerjaan_kepala_keluarga"
        ) ?? ""
      ).trim();

    const alamatKepalaKeluarga =
      String(
        formData.get(
          "alamat_kepala_keluarga"
        ) ?? ""
      ).trim();

    const dusunKepalaKeluarga =
      String(
        formData.get(
          "dusun_kepala_keluarga"
        ) ?? ""
      ).trim();

    const rtKepalaKeluarga =
      String(
        formData.get(
          "rt_kepala_keluarga"
        ) ?? ""
      ).trim();

    const rwKepalaKeluarga =
      String(
        formData.get(
          "rw_kepala_keluarga"
        ) ?? ""
      ).trim();

    const kewarganegaraanKepalaKeluarga =
      String(
        formData.get(
          "kewarganegaraan_kepala_keluarga"
        ) ?? ""
      ).trim();

    // =====================================================
    // DATA ANAK
    // =====================================================

    const nikAnak =
      String(
        formData.get(
          "nik_anak"
        ) ?? ""
      ).trim();

    const namaAnak =
      String(
        formData.get(
          "nama_anak"
        ) ?? ""
      ).trim();

    const ttlAnak =
      String(
        formData.get(
          "ttl_anak"
        ) ?? ""
      ).trim();

    const agamaAnak =
      String(
        formData.get(
          "agama_anak"
        ) ?? ""
      ).trim();

    const jenisKelaminAnak =
      String(
        formData.get(
          "jenis_kelamin_anak"
        ) ?? ""
      ).trim();

    const statusPerkawinanAnak =
      String(
        formData.get(
          "status_perkawinan_anak"
        ) ?? ""
      ).trim();

    const pekerjaanAnak =
      String(
        formData.get(
          "pekerjaan_anak"
        ) ?? ""
      ).trim();

    const alamatAnak =
      String(
        formData.get(
          "alamat_anak"
        ) ?? ""
      ).trim();

    const dusunAnak =
      String(
        formData.get(
          "dusun_anak"
        ) ?? ""
      ).trim();

    const rtAnak =
      String(
        formData.get(
          "rt_anak"
        ) ?? ""
      ).trim();

    const rwAnak =
      String(
        formData.get(
          "rw_anak"
        ) ?? ""
      ).trim();

    const kewarganegaraanAnak =
      String(
        formData.get(
          "kewarganegaraan_anak"
        ) ?? ""
      ).trim();

    // =====================================================
    // DATA PENGHASILAN
    // =====================================================

    const nilaiPenghasilan =
      String(
        formData.get(
          "penghasilan"
        ) ?? ""
      ).trim();

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    // =====================================================
    // VALIDASI NIK
    // =====================================================

    if (
      !/^\d{16}$/.test(
        nikKepalaKeluarga
      )
    ) {
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

    if (
      !/^\d{16}$/.test(
        nikAnak
      )
    ) {
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

    // =====================================================
    // VALIDASI DATA KEPALA KELUARGA
    // =====================================================

    if (
      !namaKepalaKeluarga ||
      !ttlKepalaKeluarga ||
      !agamaKepalaKeluarga ||
      !jenisKelaminKepalaKeluarga ||
      !pekerjaanKepalaKeluarga ||
      !alamatKepalaKeluarga
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data kepala keluarga belum lengkap.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VALIDASI DATA ANAK
    // =====================================================

    if (
      !namaAnak ||
      !ttlAnak ||
      !agamaAnak ||
      !jenisKelaminAnak ||
      !pekerjaanAnak ||
      !alamatAnak
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data anak belum lengkap.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VALIDASI PENGHASILAN
    // =====================================================

    if (!nilaiPenghasilan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Penghasilan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // VALIDASI FILE JIKA ADA FILE BARU
    // =====================================================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    const maxSize =
      5 * 1024 * 1024;

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      if (
        !allowedTypes.includes(
          fileKtp.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "File harus berupa JPG atau PNG.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        fileKtp.size >
        maxSize
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file maksimal 5 MB.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =====================================================
    // MULAI TRANSACTION
    // =====================================================

    await conn.beginTransaction();

    // =====================================================
    // AMBIL DATA PENGAJUAN
    // =====================================================

    const [pengajuanRows]: any =
      await conn.query(
        `
        SELECT
          nik
        FROM pengajuan_surat
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (
      !pengajuanRows.length
    ) {
      await conn.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Data pengajuan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const nikLama =
      pengajuanRows[0].nik;

    // =====================================================
    // AMBIL KTP LAMA DARI KEPENDUDUKAN
    // =====================================================

    const [pendudukRows]: any =
      await conn.query(
        `
        SELECT
          file_ktp
        FROM kependudukan
        WHERE nik = ?
        LIMIT 1
        `,
        [nikLama]
      );

    if (
      pendudukRows.length
    ) {
      oldFileName =
        pendudukRows[0]
          ?.file_ktp ?? null;
    }

    // =====================================================
    // FILE KTP
    // =====================================================

    let fileName =
      oldFileName;

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      const uploadDir =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp"
        );

      await mkdir(
        uploadDir,
        {
          recursive: true,
        }
      );

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      fileName =
        `${randomUUID()}.${ext}`;

      const uploadPath =
        path.join(
          uploadDir,
          fileName
        );

      await writeFile(
        uploadPath,
        Buffer.from(
          await fileKtp.arrayBuffer()
        )
      );

      newFilePath =
        uploadPath;
    }

    // =====================================================
    // UPDATE KEPALA KELUARGA
    // =====================================================

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
        kewarganegaraan,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nama =
          VALUES(nama),
        ttl =
          VALUES(ttl),
        agama =
          VALUES(agama),
        jenis_kelamin =
          VALUES(jenis_kelamin),
        status_perkawinan =
          VALUES(status_perkawinan),
        pekerjaan =
          VALUES(pekerjaan),
        alamat =
          VALUES(alamat),
        dusun =
          VALUES(dusun),
        rt =
          VALUES(rt),
        rw =
          VALUES(rw),
        kewarganegaraan =
          VALUES(kewarganegaraan),
        file_ktp =
          VALUES(file_ktp)
      `,
      [
        nikKepalaKeluarga,
        namaKepalaKeluarga,
        ttlKepalaKeluarga,
        agamaKepalaKeluarga,
        jenisKelaminKepalaKeluarga,
        statusPerkawinanKepalaKeluarga,
        pekerjaanKepalaKeluarga,
        alamatKepalaKeluarga,
        dusunKepalaKeluarga,
        rtKepalaKeluarga,
        rwKepalaKeluarga,
        kewarganegaraanKepalaKeluarga,
        fileName,
      ]
    );

    // =====================================================
    // UPDATE ANAK
    // =====================================================

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
      ON DUPLICATE KEY UPDATE
        nama =
          VALUES(nama),
        ttl =
          VALUES(ttl),
        agama =
          VALUES(agama),
        jenis_kelamin =
          VALUES(jenis_kelamin),
        status_perkawinan =
          VALUES(status_perkawinan),
        pekerjaan =
          VALUES(pekerjaan),
        alamat =
          VALUES(alamat),
        dusun =
          VALUES(dusun),
        rt =
          VALUES(rt),
        rw =
          VALUES(rw),
        kewarganegaraan =
          VALUES(kewarganegaraan)
      `,
      [
        nikAnak,
        namaAnak,
        ttlAnak,
        agamaAnak,
        jenisKelaminAnak,
        statusPerkawinanAnak,
        pekerjaanAnak,
        alamatAnak,
        dusunAnak,
        rtAnak,
        rwAnak,
        kewarganegaraanAnak,
      ]
    );

    // =====================================================
    // UPDATE PENGAJUAN SURAT
    // =====================================================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET
        nik = ?,
        status = 'pending',
        alasan_penolakan = NULL
      WHERE id = ?
      `,
      [
        nikKepalaKeluarga,
        id,
      ]
    );

    // =====================================================
    // UPDATE DETAIL PENGHASILAN
    // =====================================================

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
        nikKepalaKeluarga,
        nikAnak,
        nilaiPenghasilan,
        id,
      ]
    );

    // =====================================================
    // ACTIVITY LOG
    // =====================================================

    await logActivity({
      pengajuanId:
        Number(id),
      status:
        "pending",
      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",
      conn,
    });

    // =====================================================
    // COMMIT
    // =====================================================

    await conn.commit();

    // =====================================================
    // HAPUS FILE KTP LAMA
    // SETELAH COMMIT
    // =====================================================

    if (
      newFilePath &&
      oldFileName &&
      oldFileName !== fileName
    ) {
      try {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldFileName
          )
        );
      } catch {
        // Abaikan jika file lama
        // sudah tidak ada.
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (error) {

    await conn.rollback();

    // =====================================================
    // HAPUS FILE BARU JIKA TRANSAKSI GAGAL
    // =====================================================

    if (newFilePath) {
      try {
        await unlink(
          newFilePath
        );
      } catch {
        // Abaikan jika file
        // tidak ditemukan.
      }
    }

    console.error(
      "PUT penghasilan error:",
      error
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