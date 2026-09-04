import db from "@/lib/db";
import { NextResponse } from "next/server";
import {
  writeFile,
  unlink,
  mkdir,
} from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

import { generateSurat } from "@/lib/surat/generateSurat";
import getJenisSurat from "@/lib/surat/getJenisSurat";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  let uploadedFilePath: string | null = null;

  try {
    const formData =
      await request.formData();

    // ===============================
    // DATA KEPENDUDUKAN
    // ===============================

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
        formData.get(
          "status_perkawinan"
        ) ?? ""
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
        formData.get(
          "kewarganegaraan"
        ) ?? ""
      ).trim();

    // ===============================
    // DATA TANAH
    // ===============================

    const nomor_sertifikat =
      String(
        formData.get(
          "nomor_sertifikat"
        ) ?? ""
      ).trim();

    const luas_tanah =
      String(
        formData.get(
          "luas_tanah"
        ) ?? ""
      ).trim();

    const tahun_perolehan =
      String(
        formData.get(
          "tahun_perolehan"
        ) ?? ""
      ).trim();

    const asal_perolehan =
      String(
        formData.get(
          "asal_perolehan"
        ) ?? ""
      ).trim();

    const letak_tanah =
      String(
        formData.get(
          "letak_tanah"
        ) ?? ""
      ).trim();

    const harga_taksiran =
      String(
        formData.get(
          "harga_taksiran"
        ) ?? ""
      ).trim();

    // ===============================
    // VALIDASI NIK
    // ===============================

    if (!nik) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (
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

    // ===============================
    // VALIDASI DATA KEPENDUDUKAN
    // ===============================

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
            "Tempat dan tanggal lahir wajib diisi.",
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

    // ===============================
    // VALIDASI DATA TANAH
    // ===============================

    if (!nomor_sertifikat) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor sertifikat wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!luas_tanah) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Luas tanah wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!tahun_perolehan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tahun perolehan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!asal_perolehan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Asal perolehan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!letak_tanah) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Letak tanah wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!harga_taksiran) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Harga taksiran wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // FILE KTP
    // OPSIONAL UNTUK ADMIN
    // ===============================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    let fileName:
      string | null = null;

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
        fileKtp.size >
        maxSize
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

      // ===============================
      // UPLOAD FILE KTP
      // ===============================

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

      uploadedFilePath =
        path.join(
          uploadDir,
          fileName
        );

      const bytes =
        await fileKtp.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      await writeFile(
        uploadedFilePath,
        buffer
      );
    }

    // ===============================
    // MULAI TRANSAKSI
    // ===============================

    await conn.beginTransaction();

    // ===============================
    // AMBIL JENIS SURAT
    // ===============================

    const jenis =
      await getJenisSurat(
        "STHT"
      );

    const jenisSuratId =
      jenis.id;

    const kodeSurat =
      jenis.kode_surat;

    const templateSurat =
      jenis.template_surat ??
      "";

    // ===============================
    // UPSERT DATA KEPENDUDUKAN
    // ===============================

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
      ]
    );

    // ===============================
    // GENERATE TRACKING
    // ===============================

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

    const [countRows]: any =
      await conn.query(
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

    // ===============================
    // INSERT PENGAJUAN
    // ===============================

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

    // ===============================
    // INSERT DATA TAFSIRAN HARGA TANAH
    // ===============================

    await conn.query(
      `
      INSERT INTO tafsiran_harga_tanah
      (
        pengajuan_id,
        nomor_sertifikat,
        luas_tanah,
        tahun_perolehan,
        asal_perolehan,
        letak_tanah,
        harga_taksiran,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        nomor_sertifikat,
        luas_tanah,
        tahun_perolehan,
        asal_perolehan,
        letak_tanah,
        harga_taksiran,
        fileName,
      ]
    );

    // ===============================
    // GENERATE ISI SURAT
    // ===============================

    const tanggalSurat =
      sekarang.toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

    const replaceFields:
      Record<string, string> = {
      nomor_surat: "",
      tanggal:
        tanggalSurat,

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

      nomor_sertifikat,
      luas_tanah,
      tahun_perolehan,
      asal_perolehan,
      letak_tanah,
      harga_taksiran,
    };

    const isiSurat =
      generateSurat(
        templateSurat,
        replaceFields,
        {
          preserveSystemFields:
            true,
        }
      );

    // ===============================
    // SIMPAN ISI SURAT
    // ===============================

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

    // ===============================
    // ACTIVITY LOG
    // ===============================

    await logActivity({
      pengajuanId:
        pengajuan_id,
      status: "draft",
      aktivitas:
        "Surat dibuat oleh Admin.",
      conn,
    });

    // ===============================
    // COMMIT
    // ===============================

    await conn.commit();

    // File sudah berhasil disimpan
    uploadedFilePath = null;

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

    // ===============================
    // CLEANUP FILE
    // ===============================

    if (
      uploadedFilePath
    ) {
      try {
        await unlink(
          uploadedFilePath
        );
      } catch {
        // Abaikan jika file tidak ditemukan
      }
    }

    console.error(
      "ADMIN BUAT SURAT STHT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
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