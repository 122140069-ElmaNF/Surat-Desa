import db from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { generateSurat } from "@/lib/surat/generateSurat";

export async function POST(request: Request) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const formData = await request.formData();

    const nama = formData.get("nama") as string;
    const ttl = formData.get("ttl") as string;
    const nik = formData.get("nik") as string;
    const agama = formData.get("agama") as string;
    const jenis_kelamin = formData.get("jenis_kelamin") as string;
    const pekerjaan = formData.get("pekerjaan") as string;
    const alamat = formData.get("alamat") as string;
    const dusun = formData.get("dusun") as string;
    const rt = formData.get("rt") as string;
    const rw = formData.get("rw") as string;
    const fileKtp = formData.get("file_ktp") as File | null;

    if (!fileKtp) {
    return NextResponse.json(
        {
        success: false,
        message: "File KTP wajib diupload.",
        },
        {
        status: 400,
        }
    );
    }

    const bytes = await fileKtp.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = fileKtp.name.split(".").pop();

    const fileName = `${randomUUID()}.${ext}`;

    const uploadPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "ktp",
    fileName
    );

    await writeFile(uploadPath, buffer);

    // Ambil kode surat
    const [jenisRows]: any = await conn.query(`
      SELECT 
      kode_surat,
      template_surat
      FROM jenis_surat
      WHERE id = 1
    `);

    const kodeSurat = jenisRows[0].kode_surat;
    const templateSurat = jenisRows[0].template_surat ?? "";

    // Generate Tracking
    const sekarang = new Date();

    const tanggal = `${String(sekarang.getDate()).padStart(
      2,
      "0"
    )}${String(sekarang.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(sekarang.getFullYear()).slice(-2)}`;

    const [countRows]: any = await conn.query(`
      SELECT COUNT(*) total
      FROM pengajuan_surat
      WHERE jenis_surat_id = 1
    `);

    const urut = String(countRows[0].total + 1).padStart(4, "0");
    const kode_tracking =`${kodeSurat}-${tanggal}-${urut}`;

    // Insert Pengajuan
    const [result]: any = await conn.query(
      `
      INSERT INTO pengajuan_surat
      (
        jenis_surat_id,
        status,
        kode_tracking
      )
      VALUES
      (?, ?, ?)
      `,
      [1,"draft",kode_tracking,]
    );

    const pengajuan_id = result.insertId;

    // Insert Domisili
    await conn.query(
      `
      INSERT INTO domisili
      (
        pengajuan_id,
        nama,
        ttl,
        nik,
        agama,
        jenis_kelamin,
        pekerjaan,
        alamat,
        dusun,
        rt,
        rw,
        file_ktp
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pengajuan_id,
        nama,
        ttl,
        nik,
        agama,
        jenis_kelamin,
        pekerjaan,
        alamat,
        dusun,
        rt,
        rw,
        fileName,
      ]
    );

// Generate Isi Surat

console.log("templateSurat =", templateSurat);
console.log("typeof =", typeof templateSurat);

const replaceFields: Record<string, string> = {
  nomor_surat: "",
  tanggal: new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }),

  nama,
  ttl,
  nik,
  agama,
  jenis_kelamin,
  pekerjaan,
  alamat,
  dusun,
  rt,
  rw,
};

const isiSurat = generateSurat(
  templateSurat,
  replaceFields
);

// Simpan Isi Surat
await conn.query(
  `
  UPDATE pengajuan_surat
  SET isi_surat = ?
  WHERE id = ?
  `,
  [
    isiSurat,
    pengajuan_id,
  ]
);

    await conn.commit();
    return NextResponse.json({
    success: true,
    pengajuan_id,
    kode_tracking,
    message: "Surat berhasil dibuat.",
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  } finally {
    conn.release();
  }
}