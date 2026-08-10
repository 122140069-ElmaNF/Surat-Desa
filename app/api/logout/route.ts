import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("session");

  return NextResponse.json({
    success: true,
  });
}

export async function GET(request: Request) {
  const cookieStore = await cookies();

  cookieStore.delete("session");

  const url = new URL(request.url);

  const redirectTo =
    url.searchParams.get("redirect") || "/login";

  return NextResponse.redirect(
    new URL(redirectTo, request.url)
  );
}