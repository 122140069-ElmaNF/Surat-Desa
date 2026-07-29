import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { requireSuperAdminApi } from "@/lib/auth";

export async function POST(req: Request) {
  const auth = await requireSuperAdminApi();

  if (auth) return auth;
  try {
    const body = await req.json();

    const {
      nama,
      username,
      password,
      role,
    } = body;

    /* VALIDASI FIELD KOSONG*/

    if (
      !nama ||
      !username ||
      !password ||
      !role
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua field wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /*VALIDASI NAMA*/

    if (nama.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama minimal 3 karakter.",
        },
        {
          status: 400,
        }
      );
    }

    /* ===========================
       VALIDASI PASSWORD
    =========================== */

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 6 karakter.",
        },
        {
          status: 400,
        }
      );
    }

    /* ===========================
       CEK USERNAME
    =========================== */

    const [checkUser] = await db.query(
      `
      SELECT id
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    );

    if ((checkUser as any[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Username sudah digunakan.",
        },
        {
          status: 400,
        }
      );
    }

    /* ===========================
       SIMPAN DATA
    =========================== */

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await db.query(
    `
    INSERT INTO users
    (
    nama,
    username,
    password,
    role
    )
    VALUES
    (?, ?, ?, ?)
    `,
    [
    nama,
    username,
    hashedPassword,
    role,
    ]
    );

    return NextResponse.json({
      success: true,
      message: "Admin berhasil ditambahkan.",
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      }
    );
  }
}