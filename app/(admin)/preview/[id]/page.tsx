"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Preview() {
  const [data, setData] = useState("");
  const [useKop, setUseKop] = useState(true);

  const params = useParams();
  const id = params.id;

  useEffect(() => {
    if (!id) return;

    fetch(`/api/generate/${id}`)
      .then(res => res.json())
      .then(res => {
        setData(res.hasil);
        setUseKop(res.use_kop);
      });
  }, [id]);

  return (
    <div
      style={{
        background: "#e5e7eb",
        minHeight: "100vh",
        padding: "40px"
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "auto",
          background: "white",
          padding: "40px 60px",
          fontFamily: "Times New Roman, serif",
          lineHeight: "1.6",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >

        {/* 🔥 KOP (conditional) */}
        {useKop && (
          <>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/logo.png"
                alt="logo"
                style={{ width: "80px", marginRight: "20px" }}
              />

              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                  PEMERINTAH DESA SUMBEREJO
                </div>
                <div>Kecamatan Way Jepara</div>
                <div>Kabupaten Lampung Timur</div>
              </div>
            </div>

            <hr style={{ border: "2px solid black", margin: "10px 0 20px" }} />
          </>
        )}

        {/* ISI SURAT */}
        <div
          style={{ whiteSpace: "pre-line" }}
          dangerouslySetInnerHTML={{
            __html: data,
          }}
        />

      </div>
    </div>
  );
}