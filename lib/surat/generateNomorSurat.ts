import db from "@/lib/db";

const KODE_PEMERINTAH = "100";
const KODE_DESA = "07.2009";

const BULAN_ROMAWI = [
  "",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

export default async function generateNomorSurat() {
  const sekarang = new Date();

  const tahun = sekarang.getFullYear();
  const bulan = BULAN_ROMAWI[sekarang.getMonth() + 1];

  // ===========================
  // Cari nomor urut terakhir
  // tahun berjalan
  // ===========================

  const [rows] = await db.query(
    `
    SELECT
      MAX(nomor_urut) AS nomorTerakhir
    FROM pengajuan_surat
    WHERE YEAR(tanggal_surat)=?
    `,
    [tahun]
  );

  const nomorTerakhir =
    Number((rows as any[])[0]?.nomorTerakhir ?? 0);

  const nomorUrut = nomorTerakhir + 1;

  const nomorSurat =
  `${KODE_PEMERINTAH}/${String(nomorUrut).padStart(3, "0")}/${KODE_DESA}/${bulan}/${tahun}`;

  return {
    nomorUrut,
    nomorSurat,
    tanggalSurat: sekarang,
  };
}