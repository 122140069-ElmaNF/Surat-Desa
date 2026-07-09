"use client";

type Props = {
  jabatan: string;
  nama: string;
  image?: string;
  showImage?: boolean;
  tanggal?: string;
  tempat?: string;
};

export default function TandaTangan({
  jabatan,
  nama,
  image,
  showImage = true,
  tempat = "Sumberejo",
  tanggal,
}: Props) {
  return (
    <div
      style={{
        width: 260,
        marginLeft: "auto",
        marginTop: 48,
        textAlign: "center",
        fontFamily: '"Times New Roman", serif',
        fontSize: 16,
      }}
    >
      {(tempat || tanggal) && (
        <div
          style={{
            marginBottom: 8,
          }}
        >
          {tempat}
          {tanggal ? `, ${tanggal}` : ""}
        </div>
      )}

      <div>{jabatan}</div>

      <div
        style={{
          height: 95,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {showImage &&
          image && (
            <img
              src={image}
              alt="Tanda Tangan"
              style={{
                maxWidth: 170,
                maxHeight: 90,
                objectFit: "contain",
              }}
            />
          )}
      </div>

      <div
        style={{
          fontWeight: 700,
          textDecoration: "underline",
          textTransform: "uppercase",
          marginTop: 6,
        }}
      >
        {nama}
      </div>
    </div>
  );
}