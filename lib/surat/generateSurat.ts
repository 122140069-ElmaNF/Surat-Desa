const SYSTEM_FIELDS = [
  "nomor_surat",
  "tanggal",
  "jabatan",
  "nama_penandatangan",
];

type GenerateOptions = {
  preserveSystemFields?: boolean;
};

export function generateSurat(
  template: string,
  fields: Record<string, string>,
  options: GenerateOptions = {}
) {
  let hasil = template ?? "";

  Object.entries(fields).forEach(([key, value]) => {
    if (
      options.preserveSystemFields &&
      SYSTEM_FIELDS.includes(key)
    ) {
      return;
    }

    hasil = hasil.replaceAll(
      `{{${key}}}`,
      value ?? ""
    );
  });

  return hasil;
}