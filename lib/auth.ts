import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * Ambil session dari cookie dan validasi
 * terhadap data user di database.
 */
export async function getValidSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    return null;
  }

  let sessionUser: any;

  try {
    sessionUser = JSON.parse(session.value);
  } catch {
    return null;
  }

  if (!sessionUser?.id) {
    return null;
  }

  const [rows] = await db.query(
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
    [sessionUser.id]
  );

  const user = (rows as any[])[0];

  if (!user) {
    return null;
  }

  /**
   * Jika role atau status super admin
   * sudah berubah di database,
   * session lama dianggap tidak valid.
   */
  if (
    user.role !== sessionUser.role ||
    Boolean(user.is_super_admin) !==
      Boolean(sessionUser.is_super_admin)
  ) {
    return null;
  }

  return {
    ...user,
  };
}

/**
 * Untuk halaman Super Admin
 */
export async function requireSuperAdminPage() {
  const user = await getValidSession();

  if (!user) {
    redirect("/api/logout?redirect=/login");
  }

  if (!user.is_super_admin) {
    redirect("/admin");
  }

  return user;
}

/**
 * Untuk API Super Admin
 */
export async function requireSuperAdminApi() {
  const user = await getValidSession();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Session tidak valid atau role akun telah berubah. Silakan login kembali.",
      },
      {
        status: 401,
      }
    );
  }

  if (!user.is_super_admin) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}