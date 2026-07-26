type Props = {
  jabatan: string;
  nama: string;
  image?: string;
  showImage?: boolean;
  tanggal?: string;
};

export default function TandaTanganKepalaDesa({
  jabatan,
  nama,
  image,
  showImage = false,
  tanggal,
}: Props) {
  return (
    <div
      style={{
        fontFamily: '"Times New Roman", serif',
        fontSize: "12pt",
        lineHeight: 1.3,
        textAlign: "center",
      }}
    >
      <div
        style={{
          textAlign: "left",
          marginBottom: "8px",
        }}
      >
        <div>Dibuat di&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Sumberejo</div>
        <div>Pada Tanggal : {tanggal}</div>
      </div>

      <div>{jabatan}</div>

      <div
        style={{
          height: "90px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {showImage && image ? (
          <img
            src={image}
            alt="Tanda Tangan"
            style={{
              maxHeight: "80px",
              maxWidth: "150px",
            }}
          />
        ) : null}
      </div>

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