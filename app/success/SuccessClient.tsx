"use client";

import Link from "next/link";
import { useState } from "react";

export default function SuccessClient({ kode }: { kode: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(kode);
      setCopied(true);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <button
        onClick={copy}
        style={{ padding: "10px 14px", borderRadius: 6, border: "none", backgroundColor: "#2563eb", color: "white", fontWeight: 700 }}
      >
        {copied ? "Tersalin" : "Salin Kode"}
      </button>

      <Link href={`/tracking`}>
        <button
          style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #111827", background: "white", color: "#111827", fontWeight: 700 }}
        >
          Lihat Status
        </button>
      </Link>
    </div>
  );
}
