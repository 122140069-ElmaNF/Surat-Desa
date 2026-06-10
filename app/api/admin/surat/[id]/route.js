import { redirect } from "next/navigation";
import db from "@/lib/db";

export async function PATCH(req, context) {
  const { id } = await context.params;
  const body = await req.json();
  const status = body.status || "menunggu tanda tangan";

  await db.query("UPDATE pengajuan_surat SET status = ? WHERE id = ?", [
    status,
    id,
  ]);

  return Response.json({
    success: true,
    message: "Status surat berhasil diubah",
  });
}

export async function POST(req, context) {
  const { id } = await context.params;
  const formData = await req.formData();
  const tempatTanggal = new Map();

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("detail_")) {
      continue;
    }

    if (key.endsWith("_tempat") || key.endsWith("_tanggal")) {
      const detailId = key.replace("detail_", "").replace("_tempat", "").replace("_tanggal", "");
      const current = tempatTanggal.get(detailId) || {};

      if (key.endsWith("_tempat")) {
        current.tempat = String(value);
      } else {
        current.tanggal = String(value);
      }

      tempatTanggal.set(detailId, current);
      continue;
    }

    const detailId = key.replace("detail_", "");

    await db.query(
      `UPDATE detail_pengajuan
      SET value = ?
      WHERE id = ? AND pengajuan_id = ?`,
      [String(value), detailId, id]
    );
  }

  for (const [detailId, value] of tempatTanggal.entries()) {
    await db.query(
      `UPDATE detail_pengajuan
      SET value = ?
      WHERE id = ? AND pengajuan_id = ?`,
      [`${value.tempat || ""}, ${value.tanggal || ""}`, detailId, id]
    );
  }

  redirect("/admin/surat");
}

export async function DELETE(req, context) {
  const { id } = await context.params;

  await db.query("DELETE FROM detail_pengajuan WHERE pengajuan_id = ?", [id]);
  await db.query("DELETE FROM pengajuan_surat WHERE id = ?", [id]);

  return Response.json({
    success: true,
    message: "Surat berhasil dihapus",
  });
}
