import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session");
  const pathname = req.nextUrl.pathname;

  // ==========================
  // BELUM LOGIN
  // ==========================
  if (
    !session &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/pimpinan"))
  ) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  // SUDAH LOGIN

  if (session) {
    try {
      const user = JSON.parse(session.value);

      // Admin membuka halaman pimpinan
      if (
        user.role === "admin" &&
        pathname.startsWith("/pimpinan")
      ) {
        return NextResponse.redirect(
          new URL("/admin", req.url)
        );
      }

      // Pimpinan membuka halaman admin
      if (
        user.role === "pimpinan" &&
        pathname.startsWith("/admin")
      ) {
        return NextResponse.redirect(
          new URL("/pimpinan", req.url)
        );
      }

      // Sudah login lalu membuka /login
      if (pathname === "/login") {
        if (user.role === "admin") {
          return NextResponse.redirect(
            new URL("/admin", req.url)
          );
        }

        if (user.role === "pimpinan") {
          return NextResponse.redirect(
            new URL("/pimpinan", req.url)
          );
        }
      }
    } catch (error) {
      // Cookie rusak → hapus & kembali ke login
      const response = NextResponse.redirect(
        new URL("/login", req.url)
      );

      response.cookies.delete("session");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/pimpinan/:path*",
    "/login",
  ],
};