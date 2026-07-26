import { ReactNode } from "react";

type Props = {
  jabatan: ReactNode;
  nama?: string;
};

export default function TandaTanganManual({
  jabatan,
  nama = "(............................)",
}: Props) {
  return (
    <div
      style={{
        width: "100%",
        fontFamily: '"Times New Roman", serif',
        fontSize: "12pt",
        lineHeight: 1.3,
        textAlign: "center",
      }}
    >
      {/* Area Judul */}
        <div
        style={{
            height: "62px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            textAlign: "center",
        }}
        >
        {jabatan}
        </div>

      {/* Ruang tanda tangan */}
      <div
        style={{
          height: "90px",
        }}
      />

      {/* Nama */}
      <div
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
        }}
      >
        {nama}
      </div>
    </div>
  );
}