export function plainTextToHtml(text: string) {

  return text
    .split("\n")
    .map((line) => {

      if (line.trim() === "") {
        return "<p><br></p>";
      }

      return `<p>${line}</p>`;

    })
    .join("");

}