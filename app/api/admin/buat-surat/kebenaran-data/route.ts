import db from "@/lib/db";
import { NextResponse } from "next/server";
import {
  writeFile,
  unlink,
  mkdir,
} from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

import { logActivity } from "@/lib/activity";
import { generateSurat } from "@/lib/surat/generateSurat";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedKtpPath: string | null = null;
  let uploadedKkPath: string | null = null;

  try {
    const formData =
      await request.formData();

    // ==================================
    // DATA PEMOHON
    // ==================================

    const nama =
      String(
        formData.get("nama") ?? ""
      ).trim();

    const ttl =
      String(
        formData.get("ttl") ?? ""
      ).trim();

    const nik =
      String(
        formData.get("nik") ?? ""
      ).trim();

    const agama =
      String(
        formData.get("agama") ?? ""
      ).trim();

    const jenis_kelamin =
      String(
        formData.get("jenis_kelamin") ?? ""
      ).trim();

    const status_perkawinan =
      String(
        formData.get("status_perkawinan") ?? ""
      ).trim();

    const pekerjaan =
      String(
        formData.get("pekerjaan") ?? ""
      ).trim();

    const alamat =
      String(
        formData.get("alamat") ?? ""
      ).trim();

    const dusun =
      String(
        formData.get("dusun") ?? ""
      ).trim();

    const rt =
      String(
        formData.get("rt") ?? ""
      ).trim();

    const rw =
      String(
        formData.get("rw") ?? ""
      ).trim();

    const kewarganegaraan =
      String(
        formData.get("kewarganegaraan") ?? ""
      ).trim();

    // ==================================
    // DATA PERSYARATAN
    // ==================================

    const no_kk =
      String(
        formData.get("no_kk") ?? ""
      ).trim();

    // ==================================
    // DATA KHUSUS SURAT
    // ==================================

    const no_hp =
      String(
        formData.get("no_hp") ?? ""
      ).trim();

    const nomor_porsi =
      String(
        formData.get("nomor_porsi") ?? ""
      ).trim();

    const bin_binti =
      String(
        formData.get("bin_binti") ?? ""
      ).trim();

    // ==================================
    // VALIDASI NIK
    // ==================================

    if (
      !nik ||
      !/^\d{16}$/.test(nik)
    ) {
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

    // ==================================
    // VALIDASI DATA PEMOHON
    // ==================================

    if (!nama) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ttl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tempat, tanggal lahir wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!agama) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Agama wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!jenis_kelamin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jenis kelamin wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!status_perkawinan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status perkawinan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!pekerjaan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pekerjaan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!alamat) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Alamat wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!dusun) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Dusun wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!rt) {
      return NextResponse.json(
        {
          success: false,
          message:
            "RT wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!rw) {
      return NextResponse.json(
        {
          success: false,
          message:
            "RW wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!kewarganegaraan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kewarganegaraan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================
    // VALIDASI DATA KHUSUS
    // ==================================

    if (!no_hp) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor HP wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!nomor_porsi) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor porsi wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!bin_binti) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bin/Binti wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================
    // FILE KTP & KK
    // ==================================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    const fileKk =
      formData.get(
        "file_kk"
      ) as File | null;

    let fileKtpName:
      string | null = null;

    let fileKkName:
      string | null = null;

    // ==================================
    // FUNGSI VALIDASI + UPLOAD FILE
    // ==================================

    const uploadDir =
      path.join(
        process.cwd(),
        "public",
        "uploads"
      );

    const ktpDir =
      path.join(
        uploadDir,
        "ktp"
      );

    const kkDir =
      path.join(
        uploadDir,
        "kk"
      );

    // ==================================
    // UPLOAD KTP JIKA ADA
    // ==================================

    if (
      fileKtp &&
      fileKtp.size > 0
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
      ];

      if (
        !allowedTypes.includes(
          fileKtp.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "File KTP harus berupa JPG atau PNG.",
          },
          {
            status: 400,
          }
        );
      }

      const maxSize =
        5 * 1024 * 1024;

      if (
        fileKtp.size > maxSize
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file KTP maksimal 5 MB.",
          },
          {
            status: 400,
          }
        );
      }

      await mkdir(
        ktpDir,
        {
          recursive: true,
        }
      );

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      fileKtpName =
        `${randomUUID()}.${ext}`;

      const ktpPath =
        path.join(
          ktpDir,
          fileKtpName
        );

      await writeFile(
        ktpPath,
        Buffer.from(
          await fileKtp.arrayBuffer()
        )
      );

      uploadedKtpPath =
        ktpPath;
    }

    // ==================================
    // UPLOAD KK JIKA ADA
    // ==================================

    if (
      fileKk &&
      fileKk.size > 0
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
      ];

      if (
        !allowedTypes.includes(
          fileKk.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "File KK harus berupa JPG, PNG, atau PDF.",
          },
          {
            status: 400,
          }
        );
      }

      const maxSize =
        5 * 1024 * 1024;

      if (
        fileKk.size > maxSize
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file KK maksimal 5 MB.",
          },
          {
            status: 400,
          }
        );
      }

      await mkdir(
        kkDir,
        {
          recursive: true,
        }
      );

      const ext =
        fileKk.name
          .split(".")
          .pop()
          ?.toLowerCase() || "pdf";

      fileKkName =
        `${randomUUID()}.${ext}`;

      const kkPath =
        path.join(
          kkDir,
          fileKkName
        );

      await writeFile(
        kkPath,
        Buffer.from(
          await fileKk.arrayBuffer()
        )
      );

      uploadedKkPath =
        kkPath;
    }

    // ==================================
    // MULAI TRANSAKSI
    // ==================================

    await conn.beginTransaction();

    // ==================================
    // AMBIL JENIS SURAT
    // ==================================

    const [
      jenisRows,
    ]: any = await conn.query(
      `
      SELECT
        id,
        kode_surat,
        template_surat
      FROM jenis_surat
      WHERE kode_surat = 'SKKD'
      LIMIT 1
      `
    );

    if (
      jenisRows.length === 0
    ) {
      throw new Error(
        "Jenis surat tidak ditemukan."
      );
    }

    const jenisSuratId =
      jenisRows[0].id;

    const kodeSurat =
      jenisRows[0].kode_surat;

    const templateSurat =
      jenisRows[0].template_surat ?? "";

    // ==================================
    // AMBIL DATA DOKUMEN LAMA
    // ==================================

    const [
      dokumenRows,
    ]: any = await conn.query(
      `
      SELECT
        kp.file_ktp,
        pr.no_kk,
        pr.file_kk
      FROM kependudukan kp
      LEFT JOIN persyaratan pr
        ON pr.nik = kp.nik
      WHERE kp.nik = ?
      LIMIT 1
      `,
      [nik]
    );

    const oldKtpName =
      dokumenRows[0]?.file_ktp ??
      null;

    const oldKkName =
      dokumenRows[0]?.file_kk ??
      null;

    const oldNoKk =
      dokumenRows[0]?.no_kk ??
      null;

    // ==================================
    // TENTUKAN FILE YANG AKAN DISIMPAN
    // ==================================

    const finalKtpName =
      fileKtpName ??
      oldKtpName;

    const finalKkName =
      fileKkName ??
      oldKkName;

    const finalNoKk =
      no_kk ||
      oldNoKk;

    // ==================================
    // SIMPAN / UPDATE KEPENDUDUKAN
    // ==================================

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
        nama = VALUES(nama),
        ttl = VALUES(ttl),
        agama = VALUES(agama),
        jenis_kelamin = VALUES(jenis_kelamin),
        status_perkawinan = VALUES(status_perkawinan),
        pekerjaan = VALUES(pekerjaan),
        alamat = VALUES(alamat),
        dusun = VALUES(dusun),
        rt = VALUES(rt),
        rw = VALUES(rw),
        kewarganegaraan = VALUES(kewarganegaraan),
        file_ktp = VALUES(file_ktp)
      `,
      [
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
        finalKtpName,
      ]
    );

    // ==================================
    // SIMPAN / UPDATE PERSYARATAN
    // ==================================

    await conn.query(
      `
      INSERT INTO persyaratan
      (
        nik,
        no_kk,
        file_kk
      )
      VALUES
      (?, ?, ?)

      ON DUPLICATE KEY UPDATE
        no_kk = VALUES(no_kk),
        file_kk = VALUES(file_kk)
      `,
      [
        nik,
        finalNoKk,
        finalKkName,
      ]
    );

    // ==================================
    // GENERATE TRACKING
    // ==================================

    const sekarang =
      new Date();

    const tanggal =
      `${String(
        sekarang.getDate()
      ).padStart(2, "0")}` +
      `${String(
        sekarang.getMonth() + 1
      ).padStart(2, "0")}` +
      `${String(
        sekarang.getFullYear()
      ).slice(-2)}`;

    const [
      countRows,
    ]: any = await conn.query(
      `
      SELECT
        COUNT(*) AS total
      FROM pengajuan_surat
      WHERE jenis_surat_id = ?
      `,
      [jenisSuratId]
    );

    const urut =
      String(
        Number(
          countRows[0].total
        ) + 1
      ).padStart(4, "0");

    const kode_tracking =
      `${kodeSurat}-${tanggal}-${urut}`;

    // ==================================
    // INSERT PENGAJUAN
    // ==================================

    const [result]: any =
      await conn.query(
        `
        INSERT INTO pengajuan_surat
        (
          jenis_surat_id,
          nik,
          status,
          kode_tracking
        )
        VALUES
        (?, ?, ?, ?)
        `,
        [
          jenisSuratId,
          nik,
          "draft",
          kode_tracking,
        ]
      );

    const pengajuan_id =
      result.insertId;

    // ==================================
    // INSERT DETAIL KEBENARAN DATA
    // ==================================

    await conn.query(
      `
      INSERT INTO kebenaran_data
      (
        pengajuan_id,
        no_hp,
        nomor_porsi,
        bin_binti
      )
      VALUES
      (?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        no_hp,
        nomor_porsi,
        bin_binti,
      ]
    );

    // ==================================
    // GENERATE ISI SURAT
    // ==================================

    const fields: Record<
      string,
      string
    > = {
      nomor_surat: "",

      tanggal:
        sekarang.toLocaleDateString(
          "id-ID",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        ),

      nama,
      ttl,
      nik,
      agama,
      jenis_kelamin,
      status_perkawinan,
      pekerjaan,
      alamat,
      dusun,
      rt,
      rw,
      kewarganegaraan,

      no_hp,
      nomor_porsi,
      bin_binti,
    };

    const isiSurat =
      generateSurat(
        templateSurat,
        fields,
        {
          preserveSystemFields:
            true,
        }
      );

    // ==================================
    // SIMPAN ISI SURAT
    // ==================================

    await conn.query(
      `
      UPDATE pengajuan_surat
      SET isi_surat = ?
      WHERE id = ?
      `,
      [
        isiSurat,
        pengajuan_id,
      ]
    );

    // ==================================
    // ACTIVITY LOG
    // ==================================

    await logActivity({
      pengajuanId:
        pengajuan_id,

      status:
        "draft",

      aktivitas:
        "Surat dibuat oleh Admin.",

      conn,
    });

    // ==================================
    // COMMIT
    // ==================================

    await conn.commit();

    uploadedKtpPath = null;
    uploadedKkPath = null;

    // ==================================
    // HAPUS FILE LAMA SETELAH COMMIT
    // ==================================

    if (
      fileKtpName &&
      oldKtpName &&
      oldKtpName !== fileKtpName
    ) {
      try {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            oldKtpName
          )
        );
      } catch (error) {
        console.error(
          "Gagal menghapus KTP lama:",
          error
        );
      }
    }

    if (
      fileKkName &&
      oldKkName &&
      oldKkName !== fileKkName
    ) {
      try {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "kk",
            oldKkName
          )
        );
      } catch (error) {
        console.error(
          "Gagal menghapus KK lama:",
          error
        );
      }
    }

    // ==================================
    // RESPONSE
    // ==================================

    return NextResponse.json({
      success: true,
      pengajuan_id,
      kode_tracking,
      message:
        "Surat berhasil dibuat.",
    });

  } catch (error: any) {
    try {
      await conn.rollback();
    } catch {
      // Abaikan jika transaksi belum dimulai
    }

    // ==================================
    // CLEANUP FILE KTP
    // ==================================

    if (uploadedKtpPath) {
      try {
        await unlink(
          uploadedKtpPath
        );
      } catch {
        // Abaikan
      }
    }

    // ==================================
    // CLEANUP FILE KK
    // ==================================

    if (uploadedKkPath) {
      try {
        await unlink(
          uploadedKkPath
        );
      } catch {
        // Abaikan
      }
    }

    console.error(
      "ADMIN BUAT SURAT SKKD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ??
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