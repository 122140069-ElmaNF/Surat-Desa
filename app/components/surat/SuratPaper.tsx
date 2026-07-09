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
        padding: "40px 0",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "210mm",
          minHeight: "297mm",
          background: "#fff",

          paddingTop: "25mm",
          paddingRight: "25mm",
          paddingBottom: "25mm",
          paddingLeft: "30mm",

          boxSizing: "border-box",

          boxShadow:
            "0 8px 20px rgba(0,0,0,.15)",

          position: "relative",

          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}