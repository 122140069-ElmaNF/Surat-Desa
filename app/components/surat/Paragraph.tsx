import { ReactNode } from "react";

type Props = {
  children: ReactNode;

  align?: "left" | "center" | "right" | "justify";
  indent?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  marginTop?: number;
  marginBottom?: number;
};

export default function Paragraph({
  children,
  align = "justify",
  indent = true,
  bold = false,
  italic = false,
  underline = false,
  marginTop = 0,
  marginBottom = 12,
}: Props) {
  return (
    <p
      style={{
        fontFamily: '"Times New Roman", serif',
        fontSize: "12pt",
        lineHeight: 1,
        textAlign: align,
        textIndent: indent ? "1.25cm" : 0,
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? "italic" : "normal",
        textDecoration: underline
          ? "underline"
          : "none",
        marginTop,
        marginBottom,
      }}
    >
      {children}
    </p>
  );
}