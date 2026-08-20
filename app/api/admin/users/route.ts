import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { requireSuperAdminApi } from "@/lib/auth";

export async function POST(req: Request) {
  // =========================================
  // CEK SUPER ADMIN
  // =========================================

  const auth = await requireSuperAdminApi();

  if (auth) return auth;

  try {
    const body = await req.json();

    const {
      nama,
      username,
      password,
      role,
      jabatan,
      periode,
    } = body;

    // =========================================
    // VALIDASI FIELD DASAR
    // =========================================

    if (
      !nama ||
      !username ||
      !password ||
      !role
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama, username, password, dan role wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // BERSIHKAN INPUT
    // =========================================

    const namaClean =
      String(nama).trim();

    const usernameClean =
      String(username).trim();

    // =========================================
    // VALIDASI NAMA
    // =========================================

    if (namaClean.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama minimal 3 karakter.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // VALIDASI USERNAME
    // =========================================

    if (usernameClean.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username minimal 3 karakter.",
        },
        {
          status: 400,
        }
      );
    }

// =========================================
// VALIDASI PASSWORD
// Minimal 8 karakter
// Harus mengandung huruf
// Harus mengandung angka
// Harus mengandung karakter spesial
// =========================================

const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

if (!passwordRegex.test(password)) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Password minimal 8 karakter dan harus mengandung huruf, angka, serta karakter spesial.",
    },
    {
      status: 400,
    }
  );
}

    // =========================================
    // VALIDASI ROLE
    // =========================================

    const allowedRoles = [
      "staff_admin",
      "kepala_desa",
    ];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Role yang dipilih tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // DATA KHUSUS KEPALA DESA
    // =========================================

    let jabatanClean: string | null = null;
    let periodeClean: string | null = null;

    if (role === "kepala_desa") {
      // =======================================
      // VALIDASI JABATAN
      // =======================================

      jabatanClean =
        String(jabatan ?? "").trim();

      if (!jabatanClean) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Jabatan Kepala Desa wajib diisi.",
          },
          {
            status: 400,
          }
        );
      }

      // =======================================
      // VALIDASI PERIODE
      // =======================================

      periodeClean =
        String(periode ?? "").trim();

      if (!periodeClean) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Periode Kepala Desa wajib diisi.",
          },
          {
            status: 400,
          }
        );
      }

      // =======================================
      // VALIDASI FORMAT PERIODE
      // =======================================

      const periodeRegex =
        /^\d{4}-\d{4}$/;

      if (!periodeRegex.test(periodeClean)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Format periode harus seperti 2026-2027.",
          },
          {
            status: 400,
          }
        );
      }

      // =======================================
      // VALIDASI TAHUN
      // =======================================

      const [
        tahunAwal,
        tahunAkhir,
      ] = periodeClean
        .split("-")
        .map(Number);

      if (tahunAkhir <= tahunAwal) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Tahun akhir periode harus lebih besar dari tahun awal.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =========================================
    // CEK USERNAME
    // =========================================

    const [checkUser] =
      await db.query(
        `
        SELECT id
        FROM users
        WHERE BINARY username = ?
        LIMIT 1
        `,
        [usernameClean]
      );

    if (
      (checkUser as any[]).length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username sudah digunakan.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // CEK KEPALA DESA AKTIF
    //
    // Hanya boleh ada satu Kepala Desa aktif.
    // =========================================

    if (role === "kepala_desa") {
      const [
        activeKepalaDesa,
      ] = await db.query(
        `
        SELECT
          id,
          nama,
          username
        FROM users
        WHERE role = 'kepala_desa'
        LIMIT 1
        `
      );

      if (
        (activeKepalaDesa as any[])
          .length > 0
      ) {
        const kepalaDesa =
          (
            activeKepalaDesa as any[]
          )[0];

        return NextResponse.json(
          {
            success: false,
            message:
              `Tidak dapat menambahkan Kepala Desa baru. ` +
              `Masih terdapat Kepala Desa aktif ` +
              `(${kepalaDesa.nama}). ` +
              `Silakan ubah Kepala Desa sebelumnya ` +
              `menjadi Ex Kepala Desa atau Nonaktif terlebih dahulu.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    // =========================================
    // HASH PASSWORD
    // =========================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // =========================================
    // SIMPAN USER
    // =========================================

    await db.query(
      `
      INSERT INTO users
      (
        nama,
        username,
        password,
        role,
        jabatan,
        periode
      )
      VALUES
      (?, ?, ?, ?, ?, ?)
      `,
      [
        namaClean,
        usernameClean,
        hashedPassword,
        role,

        // Jabatan hanya untuk Kepala Desa
        jabatanClean,

        // Periode hanya untuk Kepala Desa
        periodeClean,
      ]
    );

    // =========================================
    // RESPONSE
    // =========================================

    return NextResponse.json({
      success: true,
      message:
        role === "kepala_desa"
          ? "Kepala Desa berhasil ditambahkan."
          : "Staff Admin berhasil ditambahkan.",
    });

  } catch (err) {
    console.error(
      "ERROR POST /api/admin/users:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      }
    );
  }
}