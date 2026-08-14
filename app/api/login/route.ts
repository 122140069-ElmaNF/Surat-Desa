import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      username,
      password,
    } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username dan Password wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    const [rows] = await db.query(
      `
      SELECT
        id,
        nama,
        username,
        password,
        role,
        is_super_admin
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    );

    const user = (rows as any[])[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Username tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const cocok = await bcrypt.compare(
    password,
    user.password
    );

    if (!cocok) {
    return NextResponse.json(
        {
        success: false,
        message: "Password salah.",
        },
        {
        status: 401,
        }
    );
    }
    
    const cookieStore = await cookies();

cookieStore.set(
  "session",
  JSON.stringify({
    id: user.id,
    nama: user.nama,
    role: user.role,
    is_super_admin: Boolean(user.is_super_admin),
  }),
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  }
);

return NextResponse.json({
    success: true,
    role: user.role,
    nama: user.nama,
});

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}