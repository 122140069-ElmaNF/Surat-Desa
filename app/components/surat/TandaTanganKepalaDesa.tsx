type Props = {
  jabatan: string;
  nama: string;
  image?: string;
  showImage?: boolean;
  tanggal?: string;
};

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatTanggalIndonesia(
  value?: string
) {
  if (!value) {
    return "";
  }

  // =========================================
  // FORMAT YYYY-MM-DD
  // =========================================

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (match) {
    const [, year, month, day] = match;

    const monthIndex =
      Number(month) - 1;

    if (
      monthIndex >= 0 &&
      monthIndex < BULAN.length
    ) {
      return `${day} ${BULAN[monthIndex]} ${year}`;
    }
  }

  // =========================================
  // FORMAT ISO / DATE STRING
  // Contoh:
  // 2026-09-02T17:00:00.000Z
  // =========================================

  const date = new Date(value);

  if (
    !Number.isNaN(
      date.getTime()
    )
  ) {
    return date.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  // =========================================
  // JIKA FORMAT TIDAK DIKENALI
  // =========================================

  return value;
}

export default function TandaTanganKepalaDesa({
  jabatan,
  nama,
  image,
  showImage = false,
  tanggal,
}: Props) {
  const tanggalFormat =
    formatTanggalIndonesia(
      tanggal
    );

  return (
    <div
      style={{
        fontFamily:
          '"Times New Roman", serif',
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
        <div>
          Dibuat di&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Sumberejo
        </div>

        <div>
          Pada Tanggal : {tanggalFormat}
        </div>
      </div>

      <div>
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