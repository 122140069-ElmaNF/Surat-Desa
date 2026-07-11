import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function SuratPaper({
  children,
}: Props) {
  return (
    <div
      style={{
        background: "#e5e7eb",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "32px",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          width: "210mm",
          minHeight: "297mm",
          background: "#ffffff",
          boxSizing: "border-box",

          /* Margin Word Normal */
          padding: "2.54cm",
          boxShadow: "0 8px 20px rgba(0,0,0,.15)",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}