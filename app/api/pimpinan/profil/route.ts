import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    // =========================
    // 1. Ambil session
    // =========================
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda belum login.",
        },
        {
          status: 401,
        }
      );
    }

    let userSession: any;

    try {
      userSession = JSON.parse(session.value);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Session tidak valid.",
        },
        {
          status: 401,
        }
      );
    }

    // =========================
    // 2. Pastikan user adalah
    //    Kepala Desa
    // =========================
    if (
      !userSession.id ||
      userSession.role !== "kepala_desa"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses hanya untuk Kepala Desa.",
        },
        {
          status: 403,
        }
      );
    }

    // =========================
    // 3. Ambil file
    // =========================
    const formData = await request.formData();

    const file = formData.get(
      "tanda_tangan"
    ) as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Silakan pilih file tanda tangan terlebih dahulu.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // 4. Validasi file
    // =========================
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "File tanda tangan harus berupa gambar.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // 5. Pastikan user masih
    //    Kepala Desa di database
    // =========================
    const [rows] = await db.query(
      `
      SELECT
        id,
        nama,
        role,
        tanda_tangan
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userSession.id]
    );

    const user = (rows as any[])[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pengguna tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    if (user.role !== "kepala_desa") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akun ini bukan Kepala Desa aktif.",
        },
        {
          status: 403,
        }
      );
    }

    // =========================
    // 6. Simpan file tanda tangan
    // =========================
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext =
      path.extname(file.name) || ".png";

    const fileName =
      `ttd-${user.id}-${Date.now()}${ext}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "ttd"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const savePath = path.join(
      uploadDir,
      fileName
    );

    await fs.writeFile(
      savePath,
      buffer
    );

    const tandaTanganPath =
      `/ttd/${fileName}`;

    // =========================
    // 7. Update users
    // =========================
    await db.query(
      `
      UPDATE users
      SET tanda_tangan = ?
      WHERE id = ?
        AND role = 'kepala_desa'
      `,
      [
        tandaTanganPath,
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
      message:
        "Tanda tangan Kepala Desa berhasil disimpan.",
    });
  } catch (error) {
    console.error(
      "Gagal menyimpan tanda tangan Kepala Desa:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menyimpan tanda tangan Kepala Desa.",
      },
      {
        status: 500,
      }
    );
  }
}