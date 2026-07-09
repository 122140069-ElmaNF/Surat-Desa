export function generateSurat(
  template: string,
  fields: Record<string, string>
) {
  let hasil = template ?? "";

  Object.entries(fields).forEach(([key, value]) => {
    hasil = hasil.replaceAll(
      `{{${key}}}`,
      value ?? ""
    );
  });

  return hasil;
}