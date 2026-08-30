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
  const tanggalFormat = tanggal
    ? new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div
      style={{
        width: "280px",
        fontFamily: '"Times New Roman", serif',
        fontSize: "12pt",
        lineHeight: 1.3,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "6px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "95px",
                verticalAlign: "top",
              }}
            >
              Dibuat di
            </td>

            <td
              style={{
                width: "12px",
                textAlign: "center",
              }}
            >
              :
            </td>

            <td>{tempat}</td>
          </tr>

          <tr>
            <td>Pada Tanggal</td>

            <td
              style={{
                textAlign: "center",
              }}
            >
              :
            </td>

            <td>{tanggalFormat}</td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          marginBottom: "4px",
        }}
      >
        {jabatan}
      </div>

      {/* =========================
          AREA TANDA TANGAN
      ========================= */}
      <div
        style={{
          height: "70px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
        {showImage && image && (
          <img
            src={image}
            alt="Tanda Tangan"
            style={{
              maxWidth: "170px",
              maxHeight: "70px",
              objectFit: "contain",
              marginLeft: "30px",
            }}
          />
        )}
      </div>

      {/* =========================
          NAMA
      ========================= */}
      <div
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          textTransform: "uppercase",
          textAlign: "left",
        }}
      >
        {nama}
      </div>
    </div>
  );
}