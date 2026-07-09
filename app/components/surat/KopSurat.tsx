"use client";

export default function KopSurat() {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <img
          src="/logo.png"
          alt="Logo Desa"
          style={{
            width: 82,
            height: 82,
            objectFit: "contain",
          }}
        />

        <div
          style={{
            flex: 1,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            PEMERINTAH KABUPATEN LAMPUNG TIMUR
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            KECAMATAN WAY JEPARA
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            DESA SUMBEREJO
          </div>

          <div
            style={{
              fontSize: 13,
            }}
          >
            Jl. ................. Kode Pos ..........
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "3px solid black",
          marginTop: 14,
        }}
      />

      <div
        style={{
          borderTop: "1px solid black",
          marginTop: 2,
          marginBottom: 30,
        }}
      />
    </>
  );
}