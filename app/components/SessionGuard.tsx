"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SessionGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function validateSession() {
      try {
        const res = await fetch(
          "/api/auth/validate",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (res.status === 401) {
          router.replace("/login");
          router.refresh();
        }
      } catch (error) {
        console.error(
          "Gagal memvalidasi session:",
          error
        );
      }
    }

    validateSession();
  }, [pathname, router]);

  return null;
}