const SYSTEM_FIELDS = [
  "nomor_surat",
  "tanggal",
  "jabatan",
  "nama_penandatangan",
];

type GenerateOptions = {
  preserveSystemFields?: boolean;
};

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// ==========================================
// FORMAT TANGGAL INDONESIA
// ==========================================

function formatTanggalIndonesia(value: string) {
  if (!value) {
    return "";
  }

  // ==========================================
  // YYYY-MM-DD
  // ==========================================

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (match) {
    const [, year, month, day] = match;

    const monthIndex =
      Number(month) - 1;

    if (
      monthIndex >= 0 &&
      monthIndex < BULAN.length
    ) {
      return `${day} ${BULAN[monthIndex]} ${year}`;
    }
  }

  // ==========================================
  // JS Date string
  // Contoh:
  // Thu Aug 04 2026 ...
  // ==========================================

  if (
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s/.test(
      value
    )
  ) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return `${String(
        date.getDate()
      ).padStart(2, "0")} ${
        BULAN[date.getMonth()]
      } ${date.getFullYear()}`;
    }
  }

  return value;
}

// ==========================================
// FORMAT FIELD
// ==========================================

function formatFieldValue(
  key: string,
  value: string
) {
  if (!value) {
    return "";
  }

  const keyLower = key.toLowerCase();

  // ==========================================
  // TTL
  //
  // Menangani:
  // ttl
  // ttl_kepala_keluarga
  // ttl_anak
  // ttl_pertama
  // ttl_kedua
  // ttl_lama
  // ttl_baru
  //
  // Contoh:
  // Lampung, 2026-08-04
  //
  // Menjadi:
  // Lampung, 04 Agustus 2026
  // ==========================================

  if (
    keyLower === "ttl" ||
    keyLower.startsWith("ttl_") ||
    keyLower.includes("tempat_tgl_lahir") ||
    keyLower.includes("tempat_tanggal_lahir")
  ) {
    const parts = value
      .split(",")
      .map((item) => item.trim());

    if (parts.length === 2) {
      const tempat = parts[0];
      const tanggal = parts[1];

      return `${tempat}, ${formatTanggalIndonesia(
        tanggal
      )}`;
    }
  }

  // ==========================================
  // TANGGAL
  // ==========================================

  if (
    keyLower.includes("tanggal") ||
    keyLower.includes("tgl")
  ) {
    return formatTanggalIndonesia(value);
  }

  return value;
}

// ==========================================
// GENERATE SURAT
// ==========================================

export function generateSurat(
  template: string,
  fields: Record<string, string>,
  options: GenerateOptions = {}
) {
  let hasil = template ?? "";

  Object.entries(fields).forEach(
    ([key, value]) => {

      // ==========================================
      // SYSTEM FIELDS
      // ==========================================

      if (
        options.preserveSystemFields &&
        SYSTEM_FIELDS.includes(key)
      ) {
        return;
      }

      // ==========================================
      // FORMAT NILAI FIELD
      // ==========================================

      const formattedValue =
        formatFieldValue(
          key,
          value ?? ""
        );

      // ==========================================
      // GANTI PLACEHOLDER
      // ==========================================

      hasil = hasil.replaceAll(
        `{{${key}}}`,
        formattedValue
      );
    }
  );

  return hasil;
}