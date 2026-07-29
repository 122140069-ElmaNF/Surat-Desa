import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { requireSuperAdminApi } from "@/lib/auth";
import { cookies } from "next/headers";

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
    } = body;

    const cookieStore = await cookies();

    const session = cookieStore.get("session");

    const currentUser = JSON.parse(session!.value);

    if (
        Number(id) === currentUser.id &&
        role !== "admin"
    ) {
        return NextResponse.json(
            {
                success:false,
                message:"Role Super Admin tidak boleh diubah."
            },
            {
                status:400
            }
        );
    }

    const [checkUser] = await db.query(
    `
    SELECT id
    FROM users
    WHERE username = ?
    AND id <> ?
    LIMIT 1
    `,
    [
    username,
    id,
    ]
    );

    if ((checkUser as any[]).length > 0) {

    return NextResponse.json(
    {
    success:false,
    message:"Username sudah digunakan."
    },
    {
    status:400,
    }
    );

}

    if (!nama || !username || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap.",
        },
        { status: 400 }
      );
    }

    // Jika password dikosongkan
    if (!password) {
      await db.query(
        `
        UPDATE users
        SET
            nama = ?,
            username = ?,
            role = ?
        WHERE id = ?
        `,
        [
          nama,
          username,
          role,
          id,
        ]
      );
    }

    // Jika password diisi

else {

    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

    await db.query(
        `
        UPDATE users
        SET
            nama=?,
            username=?,
            password=?,
            role=?
        WHERE id=?
        `,
        [
            nama,
            username,
            hashedPassword,
            role,
            id,
        ]
    );

}

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdminApi();

  if (auth) return auth;

  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const currentUser = JSON.parse(session!.value);
  const { id } = await params;

  if (Number(id) === currentUser.id) {
    return NextResponse.json(
      {
        success: false,
        message: "Super Admin tidak dapat menghapus akun sendiri.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const { id } = await params;

    await db.query(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}