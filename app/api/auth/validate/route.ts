import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getValidSession } from "@/lib/auth";

export async function GET() {
  const user = await getValidSession();

  if (!user) {
    const cookieStore = await cookies();

    cookieStore.delete("session");

    return NextResponse.json(
      {
        success: false,
        valid: false,
        message:
          "Session tidak valid atau role telah berubah.",
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.json({
    success: true,
    valid: true,
  });
}