type Props = {
  title: string;
  nomor?: string;
};

export default function SuratTitle({
  title,
  nomor,
}: Props) {
  return (
    <>
      {/* ================= JUDUL ================= */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "4pt",
        }}
      >
        <div
          style={{
            fontFamily: '"Times New Roman", serif',
            fontSize: "14pt",
            fontWeight: 700,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
      </div>

      {/* ================= NOMOR ================= */}

      <div
        style={{
          textAlign: "center",
          fontFamily: '"Times New Roman", serif',
          fontSize: "12pt",
          lineHeight: 1,
          marginBottom: "24pt", // ≈ 1 baris kosong
        }}
      >
        Nomor : {nomor || "-"}
      </div>
    </>
  );
}