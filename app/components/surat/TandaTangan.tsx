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
        width: "280px",
        marginLeft: "auto",
        marginTop: "24px",
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

            <td>{tanggal}</td>
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

      <div
        style={{
          height: "90px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {showImage && image && (
          <img
            src={image}
            alt="Tanda Tangan"
            style={{
              maxWidth: "170px",
              maxHeight: "85px",
              objectFit: "contain",
            }}
          />
        )}
      </div>

      <div
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {nama}
      </div>
    </div>
  );
}