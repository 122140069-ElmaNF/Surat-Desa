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

    return `${day} ${
      BULAN[Number(month) - 1]
    } ${year}`;
  }

  // ==========================================
  // JS Date string
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

function formatFieldValue(
  key: string,
  value: string
) {
  if (!value) {
    return "";
  }

  // ==========================================
  // TTL
  // contoh:
  // lampung, 2026-08-04
  // menjadi:
  // lampung, 04 Agustus 2026
  // ==========================================

  if (
    key === "ttl" ||
    key.includes("tempat_tgl_lahir") ||
    key.includes("tempat_tanggal_lahir")
  ) {
    const parts = value
      .split(",")
      .map((item) => item.trim());

    if (parts.length === 2) {
      return `${parts[0]}, ${formatTanggalIndonesia(
        parts[1]
      )}`;
    }
  }

  // ==========================================
  // TANGGAL
  // ==========================================

  if (
    key.includes("tanggal") ||
    key.includes("tgl")
  ) {
    return formatTanggalIndonesia(value);
  }

  return value;
}

export function generateSurat(
  template: string,
  fields: Record<string, string>,
  options: GenerateOptions = {}
) {
  let hasil = template ?? "";

  Object.entries(fields).forEach(
    ([key, value]) => {
      if (
        options.preserveSystemFields &&
        SYSTEM_FIELDS.includes(key)
      ) {
        return;
      }

      const formattedValue =
        formatFieldValue(
          key,
          value ?? ""
        );

      hasil = hasil.replaceAll(
        `{{${key}}}`,
        formattedValue
      );
    }
  );

  return hasil;
}