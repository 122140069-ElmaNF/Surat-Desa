import { ReactNode } from "react";
import "./SuratPaper.css";

type Props = {
  children: ReactNode;
  mode?: "preview" | "print";
};

export default function SuratPaper({
  children,
  mode = "preview",
}: Props) {
  return (
    <div className={`surat-wrapper ${mode}`}>
      <div className={`surat-paper ${mode}`}>
        {children}
      </div>
    </div>
  );
}