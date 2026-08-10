import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { requireSuperAdminApi } from "@/lib/auth";
import { cookies } from "next/headers";

/* =========================================================
   UPDATE USER
========================================================= */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdminApi();

  if (auth) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    const {
      nama,
      username,
      password,
      role,
      periode,
    } = body;

    /* =====================================================
       VALIDASI FIELD
    ===================================================== */

    if (!nama || !username || !role) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama, username, dan role wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       AMBIL USER YANG AKAN DIUPDATE
    ===================================================== */

    const [targetRows] = await db.query(
      `
      SELECT
        id,
        nama,
        username,
        role,
        is_super_admin
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    const targetUser =
      (targetRows as any[])[0];

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       CEK SESSION
    ===================================================== */

    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Session tidak ditemukan.",
        },
        {
          status: 401,
        }
      );
    }

    const currentUser = JSON.parse(
      session.value
    );

/* =====================================================
   NORMALISASI ROLE
===================================================== */

let finalRole = role;

// Kompatibilitas data lama
if (finalRole === "pimpinan") {
  finalRole = "kepala_desa";
}

/*
 * Jika target adalah Super Admin,
 * role Super Admin harus tetap dipertahankan.
 *
 * Super Admin boleh mengubah:
 * - nama
 * - username
 * - password
 *
 * Tetapi role-nya tidak boleh berubah.
 */
if (Boolean(targetUser.is_super_admin)) {
  finalRole = "super_admin";
}
    /* =====================================================
       KHUSUS SUPER ADMIN
       
       Jika target adalah Super Admin,
       role TIDAK BOLEH berubah.
       
       Tetapi nama, username, password
       tetap boleh diperbarui.
    ===================================================== */

    if (Boolean(targetUser.is_super_admin)) {
      finalRole = targetUser.role;
    }

    /* =====================================================
       VALIDASI ROLE
    ===================================================== */
    const allowedRoles = [
      "staff_admin",
      "kepala_desa",
      "ex_kepala_desa",
      "super_admin",
    ];

    if (!allowedRoles.includes(finalRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role tidak valid.",
        },
        {
          status: 400,
        }
      );
    }
    /* =====================================================
       CEK USERNAME
    ===================================================== */

    const [checkUser] = await db.query(
      `
      SELECT id
      FROM users
      WHERE username = ?
      AND id <> ?
      LIMIT 1
      `,
      [
        username.trim(),
        id,
      ]
    );

    if ((checkUser as any[]).length > 0) {
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

    /* =====================================================
       VALIDASI PERIODE
       
       Kepala Desa dan Ex Kepala Desa
       tetap menyimpan periode untuk history.
    ===================================================== */

    let finalPeriode: string | null = null;

    if (
      finalRole === "kepala_desa" ||
      finalRole === "ex_kepala_desa"
    ) {
      if (!periode) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Periode jabatan wajib diisi.",
          },
          {
            status: 400,
          }
        );
      }

      const periodeClean =
        String(periode).trim();

      if (
        !/^\d{4}-\d{4}$/.test(
          periodeClean
        )
      ) {
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

      const [
        tahunAwal,
        tahunAkhir,
      ] = periodeClean
        .split("-")
        .map(Number);

      if (
        tahunAkhir <= tahunAwal
      ) {
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

      finalPeriode = periodeClean;
    }

    /* =====================================================
       SUPER ADMIN
       
       Super Admin tidak membutuhkan periode.
       Pertahankan periode yang sudah ada jika ada.
    ===================================================== */

    if (
      Boolean(targetUser.is_super_admin) &&
      finalRole === targetUser.role
    ) {
      finalPeriode =
        targetUser.periode ?? null;
    }

    /* =====================================================
       CEK KEPALA DESA AKTIF
       
       Hanya untuk akun non-Super Admin.
    ===================================================== */

    if (
      finalRole === "kepala_desa" &&
      !Boolean(targetUser.is_super_admin)
    ) {
      const [activeKepalaRows] =
        await db.query(
          `
          SELECT
            id,
            nama,
            username
          FROM users
          WHERE role = 'kepala_desa'
          AND id <> ?
          LIMIT 1
          `,
          [id]
        );

      const activeKepala =
        (activeKepalaRows as any[])[0];

      if (activeKepala) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Tidak dapat menetapkan ${targetUser.nama} sebagai Kepala Desa karena masih terdapat Kepala Desa aktif, yaitu ${activeKepala.nama}. Ubah Kepala Desa sebelumnya menjadi Ex Kepala Desa terlebih dahulu.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =====================================================
       UPDATE TANPA PASSWORD
    ===================================================== */

    if (!password) {
      await db.query(
        `
        UPDATE users
        SET
          nama = ?,
          username = ?,
          role = ?,
          periode = ?
        WHERE id = ?
        `,
        [
          nama.trim(),
          username.trim(),
          finalRole,
          finalPeriode,
          id,
        ]
      );
    }

    /* =====================================================
       UPDATE DENGAN PASSWORD
    ===================================================== */

    else {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password minimal 6 karakter.",
          },
          {
            status: 400,
          }
        );
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      await db.query(
        `
        UPDATE users
        SET
          nama = ?,
          username = ?,
          password = ?,
          role = ?,
          periode = ?
        WHERE id = ?
        `,
        [
          nama.trim(),
          username.trim(),
          hashedPassword,
          finalRole,
          finalPeriode,
          id,
        ]
      );
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,
      message:
        "Data berhasil diperbarui.",
    });

  } catch (error) {
    console.error(
      "ERROR PATCH /api/admin/users/[id]:",
      error
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
/* =========================================================
   DELETE USER
========================================================= */

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const auth =
    await requireSuperAdminApi();

  if (auth) return auth;

  try {
    const { id } = await params;

    /* =====================================================
       CEK SESSION
    ===================================================== */

    const cookieStore =
      await cookies();

    const session =
      cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Session tidak ditemukan.",
        },
        {
          status: 401,
        }
      );
    }

    const currentUser =
      JSON.parse(session.value);

    /* =====================================================
       SUPER ADMIN TIDAK BOLEH HAPUS DIRI SENDIRI
    ===================================================== */

    if (
      Number(id) ===
      Number(currentUser.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Super Admin tidak dapat menghapus akun sendiri.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       CEK USER
    ===================================================== */

    const [rows] =
      await db.query(
        `
        SELECT
          id,
          nama,
          is_super_admin
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    const user =
      (rows as any[])[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       SUPER ADMIN TIDAK BOLEH DIHAPUS
    ===================================================== */

    if (user.is_super_admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akun Super Admin tidak dapat dihapus.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       DELETE
    ===================================================== */

    await db.query(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      message:
        "User berhasil dihapus.",
    });

  } catch (error) {
    console.error(
      "ERROR DELETE /api/admin/users/[id]:",
      error
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