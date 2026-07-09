export function generateSurat(
  template: string,
  fields: Record<string, string>
) {
  let html = template;

  Object.entries(fields).forEach(([key, value]) => {
    html = html.replaceAll(
      `{{${key}}}`,
      value ?? ""
    );
  });

  return html;
}