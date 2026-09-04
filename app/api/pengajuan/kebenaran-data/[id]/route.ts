import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
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

  let newKtpName: string | null = null;
  let newKkName: string | null = null;

  try {
    await conn.beginTransaction();

    const { id } =
      await params;

    const pengajuanId =
      Number(id);

    if (!Number.isInteger(pengajuanId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID pengajuan tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    const formData =
      await request.formData();

    // ===========================
    // DATA KEPENDUDUKAN
    // ===========================

    const nama =
      (formData.get("nama") as string | null)
        ?.trim() ?? "";

    const ttl =
      (formData.get("ttl") as string | null)
        ?.trim() ?? "";

    const nik =
      (formData.get("nik") as string | null)
        ?.trim() ?? "";

    const agama =
      (formData.get("agama") as string | null)
        ?.trim() ?? "";

    const jenis_kelamin =
      (
        formData.get(
          "jenis_kelamin"
        ) as string | null
      )?.trim() ?? "";

    const status_perkawinan =
      (
        formData.get(
          "status_perkawinan"
        ) as string | null
      )?.trim() ?? "";

    const pekerjaan =
      (
        formData.get(
          "pekerjaan"
        ) as string | null
      )?.trim() ?? "";

    const alamat =
      (formData.get("alamat") as string | null)
        ?.trim() ?? "";

    const dusun =
      (formData.get("dusun") as string | null)
        ?.trim() ?? "";

    const rt =
      (formData.get("rt") as string | null)
        ?.trim() ?? "";

    const rw =
      (formData.get("rw") as string | null)
        ?.trim() ?? "";

    const kewarganegaraan =
      (
        formData.get(
          "kewarganegaraan"
        ) as string | null
      )?.trim() ?? "";

    // ===========================
    // DATA KHUSUS SKKD
    // ===========================

    const no_hp =
      (formData.get("no_hp") as string | null)
        ?.trim() ?? "";

    const nomor_porsi =
      (
        formData.get(
          "nomor_porsi"
        ) as string | null
      )?.trim() ?? "";

    const bin_binti =
      (
        formData.get(
          "bin_binti"
        ) as string | null
      )?.trim() ?? "";

    // ===========================
    // FILE
    // ===========================

    const fileKtp =
      formData.get(
        "file_ktp"
      ) as File | null;

    const fileKk =
      formData.get(
        "file_kk"
      ) as File | null;

    // ===========================
    // VALIDASI DATA
    // ===========================

    if (!nik) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "NIK harus terdiri dari 16 digit.",
        },
        { status: 400 }
      );
    }

    if (!nama) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!ttl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tempat dan tanggal lahir wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!agama) {
      return NextResponse.json(
        {
          success: false,
          message: "Agama wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!jenis_kelamin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jenis kelamin wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!status_perkawinan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status perkawinan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!pekerjaan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pekerjaan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!alamat) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Alamat wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!dusun) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Dusun wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!rt) {
      return NextResponse.json(
        {
          success: false,
          message:
            "RT wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!rw) {
      return NextResponse.json(
        {
          success: false,
          message:
            "RW wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!kewarganegaraan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kewarganegaraan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!no_hp) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor HP wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!nomor_porsi) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor porsi wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!bin_binti) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bin/Binti wajib diisi.",
        },
        { status: 400 }
      );
    }

    // ===========================
    // AMBIL DATA LAMA
    // ===========================

    const [rows]: any =
      await conn.query(
        `
        SELECT
          kd.file_ktp,
          kd.file_kk,
          ps.nik AS pengajuan_nik
        FROM kebenaran_data kd
        INNER JOIN pengajuan_surat ps
          ON ps.id = kd.pengajuan_id
        WHERE kd.pengajuan_id = ?
        LIMIT 1
        `,
        [pengajuanId]
      );

    if (!rows.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data pengajuan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const oldKtpName =
      rows[0].file_ktp;

    const oldKkName =
      rows[0].file_kk;

    // ===========================
    // NAMA FILE LAMA
    // ===========================

    let fileKtpName =
      oldKtpName;

    let fileKkName =
      oldKkName;

    // ===========================
    // VALIDASI FILE
    // ===========================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    const maxSize =
      5 * 1024 * 1024;

    // ===========================
    // UPLOAD KTP BARU
    // ===========================

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
              "File KTP harus JPG atau PNG.",
          },
          { status: 400 }
        );
      }

      if (
        fileKtp.size > maxSize
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file KTP maksimal 5 MB.",
          },
          { status: 400 }
        );
      }

      const ext =
        fileKtp.name
          .split(".")
          .pop()
          ?.toLowerCase();

      newKtpName =
        `${randomUUID()}.${ext}`;

      fileKtpName =
        newKtpName;

      await writeFile(
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "ktp",
          newKtpName
        ),
        Buffer.from(
          await fileKtp.arrayBuffer()
        )
      );
    }

    // ===========================
    // UPLOAD KK BARU
    // ===========================

    if (
      fileKk &&
      fileKk.size > 0
    ) {
      if (
        !allowedTypes.includes(
          fileKk.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "File KK harus JPG atau PNG.",
          },
          { status: 400 }
        );
      }

      if (
        fileKk.size > maxSize
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran file KK maksimal 5 MB.",
          },
          { status: 400 }
        );
      }

      const ext =
        fileKk.name
          .split(".")
          .pop()
          ?.toLowerCase();

      newKkName =
        `${randomUUID()}.${ext}`;

      fileKkName =
        newKkName;

      await writeFile(
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "kk",
          newKkName
        ),
        Buffer.from(
          await fileKk.arrayBuffer()
        )
      );
    }

    // ===========================
    // UPSERT KEPENDUDUKAN
    // ===========================

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
        kewarganegaraan = VALUES(kewarganegaraan)
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

    // ===========================
    // UPDATE PENGAJUAN
    // ===========================

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
        nik,
        pengajuanId,
      ]
    );

    // ===========================
    // UPDATE DATA KHUSUS SKKD
    // ===========================

    await conn.query(
      `
      UPDATE kebenaran_data
      SET
        no_hp = ?,
        nomor_porsi = ?,
        bin_binti = ?,
        file_ktp = ?,
        file_kk = ?
      WHERE pengajuan_id = ?
      `,
      [
        no_hp,
        nomor_porsi,
        bin_binti,
        fileKtpName,
        fileKkName,
        pengajuanId,
      ]
    );

    // ===========================
    // HAPUS FILE LAMA
    // ===========================

    if (
      newKtpName &&
      oldKtpName &&
      oldKtpName !== newKtpName
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
      newKkName &&
      oldKkName &&
      oldKkName !== newKkName
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

    // ===========================
    // ACTIVITY LOG
    // ===========================

    await logActivity({
      pengajuanId:
        pengajuanId,

      status:
        "pending",

      aktivitas:
        "Pemohon mengirim perbaikan pengajuan.",

      conn,
    });

    // ===========================
    // COMMIT
    // ===========================

    await conn.commit();

    return NextResponse.json({
      success: true,
      message:
        "Pengajuan berhasil diperbarui.",
    });

  } catch (error) {
    await conn.rollback();

    // ===========================
    // CLEANUP FILE BARU
    // ===========================

    try {
      if (newKtpName) {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "ktp",
            newKtpName
          )
        );
      }

      if (newKkName) {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "kk",
            newKkName
          )
        );
      }
    } catch (fileError) {
      console.error(
        "Gagal membersihkan file baru:",
        fileError
      );
    }

    console.error(error);

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