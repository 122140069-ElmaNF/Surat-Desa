import db from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";
import buildSuratHtml from "@/lib/surat/buildSuratHtml";

export async function PATCH(req, context) {
  let connection = null;

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
    // CEK AKSI
    // ==========================

    if (
      action !== "acc" &&
      action !== "tolak"
    ) {
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
    // ==========================

    const [rows] = await db.query(
      `
      SELECT
        id,
        nama,
        role,
        jabatan,
        tanda_tangan
      FROM users
      WHERE id = ?
        AND role = 'kepala_desa'
      LIMIT 1
      `,
      [currentUser.id]
    );

    const kepalaDesa = rows[0];

    // ==========================
    // CEK AKUN KEPALA DESA
    // ==========================

    if (!kepalaDesa) {
      return Response.json(
        {
          success: false,
          message:
            "Akun Kepala Desa tidak ditemukan atau tidak memiliki hak untuk memproses surat.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================
    // CEK TANDA TANGAN
    // ==========================

    if (
      !kepalaDesa.tanda_tangan ||
      String(
        kepalaDesa.tanda_tangan
      ).trim() === ""
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Anda belum mengunggah tanda tangan. Silakan upload tanda tangan terlebih dahulu di menu Profil Pimpinan sebelum memproses surat.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // TOLAK
    // =====================================================

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

    // =====================================================
    // ACC
    // =====================================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // =====================================================
    // AMBIL DATA PENGAJUAN + TEMPLATE SURAT
    // =====================================================
    //
    // template_surat berasal dari tabel jenis_surat,
    // bukan dari pengajuan_surat.
    // =====================================================

    const [suratRows] =
      await connection.query(
        `
        SELECT
          p.id,
          p.nomor_surat,
          p.tanggal_surat,
          p.isi_surat,
          p.status,
          js.template_surat
        FROM pengajuan_surat p
        JOIN jenis_surat js
          ON js.id = p.jenis_surat_id
        WHERE p.id = ?
        LIMIT 1
        `,
        [id]
      );

    const surat = suratRows[0];

    // =====================================================
    // CEK PENGAJUAN
    // =====================================================

    if (!surat) {
      await connection.rollback();

      return Response.json(
        {
          success: false,
          message:
            "Pengajuan surat tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // CEK STATUS
    // =====================================================

    if (surat.status === "selesai") {
      await connection.rollback();

      return Response.json(
        {
          success: false,
          message:
            "Surat sudah selesai dan tidak dapat diproses kembali.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CEK NOMOR SURAT
    // =====================================================

    if (
      !surat.nomor_surat ||
      String(
        surat.nomor_surat
      ).trim() === ""
    ) {
      await connection.rollback();

      return Response.json(
        {
          success: false,
          message:
            "Nomor surat belum tersedia. Silakan pastikan nomor surat sudah dibuat sebelum melakukan ACC.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CEK TANGGAL SURAT
    // =====================================================

    if (!surat.tanggal_surat) {
      await connection.rollback();

      return Response.json(
        {
          success: false,
          message:
            "Tanggal surat belum tersedia. Silakan pastikan tanggal surat sudah dibuat sebelum melakukan ACC.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CEK TEMPLATE
    // =====================================================

    if (
      !surat.template_surat ||
      String(
        surat.template_surat
      ).trim() === ""
    ) {
      await connection.rollback();

      return Response.json(
        {
          success: false,
          message:
            "Template surat tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // GENERATE SNAPSHOT FINAL
    // =====================================================
    //
    // Data yang digunakan:
    //
    // 1. Data kependudukan terbaru
    // 2. Data detail surat
    // 3. Template surat
    // 4. Nomor surat
    // 5. Tanggal surat
    //
    // Hasilnya adalah HTML FINAL.
    //
    // Hasil ini nantinya disimpan ke
    // pengajuan_surat.isi_surat.
    // =====================================================

    const snapshotIsiSurat =
      await buildSuratHtml({
        pengajuanId: Number(id),

        nomorSurat:
          String(
            surat.nomor_surat
          ),

        tanggalSurat:
          new Date(
            surat.tanggal_surat
          ),

        templateSurat:
          String(
            surat.template_surat
          ),
      });

    // =====================================================
    // CEK HASIL SNAPSHOT
    // =====================================================

    if (
      !snapshotIsiSurat ||
      String(
        snapshotIsiSurat
      ).trim() === ""
    ) {
      await connection.rollback();

      return Response.json(
        {
          success: false,
          message:
            "Gagal membuat snapshot isi surat.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // SIMPAN SNAPSHOT + DATA PENANDATANGAN
    // =====================================================

    await connection.query(
      `
      UPDATE pengajuan_surat
      SET
        status = 'selesai',
        isi_surat = ?,
        kepala_desa_id = ?,
        nama_penandatangan = ?,
        jabatan_penandatangan = ?,
        file_ttd = ?
      WHERE id = ?
      `,
      [
        snapshotIsiSurat,

        kepalaDesa.id,

        kepalaDesa.nama ?? "",

        kepalaDesa.jabatan ?? "",

        kepalaDesa.tanda_tangan,

        id,
      ]
    );

    // =====================================================
    // LOG AKTIVITAS
    // =====================================================

    await logActivity({
      conn: connection,
      pengajuanId: Number(id),
      userId: currentUser.id,
      status: "selesai",
      aktivitas:
        "Surat telah disetujui oleh Kepala Desa.",
    });

    // =====================================================
    // COMMIT
    // =====================================================

    await connection.commit();

    return Response.json({
      success: true,
      status: "selesai",
      message:
        "Surat berhasil disetujui dan snapshot surat telah disimpan.",
    });

  } catch (error) {
    console.error(
      "Gagal memproses surat pimpinan:",
      error
    );

    // =====================================================
    // ROLLBACK
    // =====================================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Gagal melakukan rollback:",
          rollbackError
        );
      }
    }

    return Response.json(
      {
        success: false,
        message:
          "Terjadi kesalahan pada server.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );

  } finally {
    // =====================================================
    // RELEASE CONNECTION
    // =====================================================

    if (connection) {
      connection.release();
    }
  }
}