"use client";

export default function KopSurat() {
  return (
    <div
      style={{
        fontFamily: '"Times New Roman", serif',
        marginBottom: "28px",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          <tr>
            {/* LOGO */}
            <td
              style={{
                width: "105px",
                verticalAlign: "middle",
                textAlign: "center",
                paddingTop: "12px",
              }}
            >
              <img
                src="/logoSurat.png"
                alt="Logo Desa"
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "contain",
                }}
              />
            </td>

            {/* JUDUL */}
            <td
              style={{
                verticalAlign: "middle",
                textAlign: "center",
                paddingRight: "40px",
              }}
            >
              <div
                style={{
                  fontSize: "16pt",
                  fontWeight: "bold",
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                }}
              >
                PEMERINTAH KABUPATEN LAMPUNG TIMUR
              </div>

              <div
                style={{
                  fontSize: "16pt",
                  fontWeight: "bold",
                  lineHeight: 1.15,
                }}
              >
                KECAMATAN WAY JEPARA
              </div>

              <div
                style={{
                  fontSize: "16pt",
                  fontWeight: "bold",
                  lineHeight: 1.15,
                }}
              >
                DESA SUMBEREJO
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* GARIS ATAS */}
      <div
        style={{
          borderTop: "2.5px solid black",
          marginTop: "8px",
        }}
      />

      {/* ALAMAT */}
      <div
        style={{
          textAlign: "center",
          fontSize: "10pt",
          fontWeight: "bold",
          padding: "4px 0",
          lineHeight: 1.1,
        }}
      >
        Alamat : Jln. Danau Indah Desa Sumberejo Kec. Way Jepara
        Kab. Lampung Timur Kode Pos 34196
      </div>

      {/* GARIS BAWAH */}
      <div
        style={{
          borderTop: "2.5px solid black",
        }}
      />

      <div
        style={{
          borderTop: "1px solid black",
          marginTop: "2px",
        }}
      />
    </div>
  );
}