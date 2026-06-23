import { NextResponse } from "next/server";
import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const namaKepalaDesa = String(
      formData.get("nama_kepala_desa") ?? ""
    ).trim();

    const jabatan = String(
      formData.get("jabatan") ?? ""
    ).trim();

    const file = formData.get(
      "tanda_tangan"
    ) as File | null;

    let tandaTanganPath: string | null = null;

    // Upload file jika ada
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext =
        path.extname(file.name) || ".png";

      const fileName = `ttd-${Date.now()}${ext}`;

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "ttd"
      );

      // Membuat folder public/ttd jika belum ada
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

      tandaTanganPath = `/ttd/${fileName}`;
    }

    // Cek apakah profil sudah ada
    const [rows] = await db.query(
      `
      SELECT *
      FROM profil_pimpinan
      LIMIT 1
      `
    );

    const profil = (rows as any[])[0];

    // Jika tabel masih kosong
    if (!profil) {
      await db.query(
        `
        INSERT INTO profil_pimpinan
        (
          nama_kepala_desa,
          jabatan,
          tanda_tangan
        )
        VALUES (?, ?, ?)
        `,
        [
          namaKepalaDesa,
          jabatan,
          tandaTanganPath,
        ]
      );
    } else {
      // Jika upload tanda tangan baru
      if (tandaTanganPath) {
        await db.query(
          `
          UPDATE profil_pimpinan
          SET
            nama_kepala_desa = ?,
            jabatan = ?,
            tanda_tangan = ?
          WHERE id = ?
          `,
          [
            namaKepalaDesa,
            jabatan,
            tandaTanganPath,
            profil.id,
          ]
        );
      } else {
        // Update tanpa mengganti tanda tangan
        await db.query(
          `
          UPDATE profil_pimpinan
          SET
            nama_kepala_desa = ?,
            jabatan = ?
          WHERE id = ?
          `,
          [
            namaKepalaDesa,
            jabatan,
            profil.id,
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Profil pimpinan berhasil disimpan.",
    });
  } catch (error) {
    console.error(
      "Gagal menyimpan profil pimpinan:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menyimpan profil pimpinan.",
      },
      {
        status: 500,
      }
    );
  }
}