"use client";

import SuccessClient from "../SuccessClient";
import { useParams } from "next/navigation";

export default function SuccessPage() {
  const params = useParams();
  const rawKode = params?.kode;
  const kode = Array.isArray(rawKode) ? rawKode[0] : rawKode || "";

  return (
    <div className="public-page">
      <div className="public-card">
        <div style={{ marginBottom: "12px" }}>
          <h1 className="page-title">Pengajuan Berhasil</h1>
          <p style={{ margin: 0, color: "#4b5563" }}>
            Terima kasih, pengajuan Anda berhasil. Simpan kode tracking berikut
            untuk melacak status pengajuan.
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ maxWidth: 560 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#6b7280", fontWeight: 600 }}>Kode Tracking</label>
            <input
              readOnly
              value={kode}
              aria-readonly
              style={{
                width: "100%",
                padding: "16px 18px",
                borderRadius: 8,
                background: "#f3f4f6",
                border: "none",
                fontWeight: 900,
                fontSize: 24,
                color: "#000000",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace",
                outline: "none",
                textAlign: "center",
                letterSpacing: "0.6px",
              }}
            />

            <SuccessClient kode={kode} />
          </div>
        </div>
      </div>
    </div>
  );
}
