import db from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";

export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const action = body.action;

    // ==========================
    // CEK SESSION
    // ==========================
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    const currentUser = session
      ? JSON.parse(session.value)
      : null;

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          message: "Anda belum login.",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================
    // TOLAK
    // ==========================
    if (action === "tolak") {
      await db.query(
        `
        UPDATE pengajuan_surat
        SET status = 'ditolak'
        WHERE id = ?
        `,
        [id]
      );

      await logActivity({
        pengajuanId: Number(id),
        userId: currentUser.id,
        status: "ditolak",
        aktivitas:
          "Pengajuan surat ditolak oleh Kepala Desa.",
      });

      return Response.json({
        success: true,
        status: "ditolak",
      });
    }

    // ==========================
    // ACC
    // ==========================

    if (action !== "acc") {
      return Response.json(
        {
          success: false,
          message: "Aksi tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================
    // AMBIL DATA KEPALA DESA
    // DARI USERS
    // ==========================

    const [rows] = await db.query(
      `
      SELECT
        id,
        nama,
        role,
        tanda_tangan
      FROM users
      WHERE id = ?
        AND role = 'kepala_desa'
      LIMIT 1
      `,
      [currentUser.id]
    );

    const kepalaDesa = rows[0];

    if (!kepalaDesa) {
      return Response.json(
        {
          success: false,
          message:
            "Akun Kepala Desa tidak ditemukan atau tidak memiliki hak untuk menyetujui surat.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================
    // UPDATE SURAT
    // ==========================

    await db.query(
      `
      UPDATE pengajuan_surat
      SET
        status = 'selesai',
        kepala_desa_id = ?,
        nama_penandatangan = ?,
        jabatan_penandatangan = ?,
        file_ttd = ?
      WHERE id = ?
      `,
      [
        kepalaDesa.id,
        kepalaDesa.nama,
        "Kepala Desa Sumberejo",
        kepalaDesa.tanda_tangan ?? null,
        id,
      ]
    );

    // ==========================
    // LOG AKTIVITAS
    // ==========================

    await logActivity({
      pengajuanId: Number(id),
      userId: currentUser.id,
      status: "selesai",
      aktivitas:
        "Surat telah disetujui oleh Kepala Desa.",
    });

    return Response.json({
      success: true,
      status: "selesai",
    });
  } catch (error) {
    console.error(
      "Gagal memproses surat pimpinan:",
      error
    );

    return Response.json(
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