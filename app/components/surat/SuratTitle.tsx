"use client";

type Props = {
  title: string;
  nomor?: string;
};

export default function SuratTitle({
  title,
  nomor,
}: Props) {
  return (
    <div
      style={{
        marginTop: "12px",
        marginBottom: "28px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: '"Times New Roman", serif',
          fontSize: "18px",
          fontWeight: 700,
          textTransform: "uppercase",
          textDecoration: "underline",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </div>

      {nomor && (
        <div
          style={{
            marginTop: "8px",
            fontFamily: '"Times New Roman", serif',
            fontSize: "16px",
          }}
        >
          Nomor : {nomor}
        </div>
      )}
    </div>
  );
}