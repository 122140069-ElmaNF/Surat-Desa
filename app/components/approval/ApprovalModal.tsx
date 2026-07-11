"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  suratId: number;
  nomorSurat: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ApprovalModal({
  open,
  suratId,
  nomorSurat,
  onClose,
  onSuccess,
}: Props) {

  const [isEditNomor, setIsEditNomor] = useState(false);
  const [nomorUrut, setNomorUrut] = useState("");

  useEffect(() => {
  if (!open) return;

  const parts = nomorSurat.split("/");

  if (parts.length >= 2) {
    setNomorUrut(parts[1]);
  }
}, [open, nomorSurat]);

const parts = nomorSurat.split("/");

const prefix =
  parts.length > 0
    ? `${parts[0]}/`
    : "";

const suffix =
  parts.length > 2
    ? `/${parts.slice(2).join("/")}`
    : "";

  if (!open) return null;

 async function handleLanjut() {

  const res = await fetch(
    `/api/admin/surat/${suratId}/kirim-approval`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nomorUrut,
      }),
    }
  );

  const result = await res.json();

  if (!result.success) {
    alert(result.message);
    return;
  }

  alert("Surat berhasil dikirim ke Kepala Desa.");

  onSuccess();
}

  console.log("isEditNomor =", isEditNomor);

  return (
    <div className="approval-overlay">

      <div className="approval-modal">

        <h2>
          Nomor Surat Berhasil Dibuat
        </h2>

        <p
          style={{
            marginTop: "10px",
            color: "#64748b",
          }}
        >
          Pastikan nomor surat sudah benar
          sebelum dikirim ke Kepala Desa.
        </p>

        <div className="approval-number">

          <span>{prefix}</span>

          {isEditNomor ? (
            <input
              value={nomorUrut}
              onChange={(e) =>
                setNomorUrut(
                  e.target.value.replace(/\D/g, "")
                )
              }
              maxLength={3}
              style={{
                width: 60,
                textAlign: "center",
                fontSize: 30,
                fontWeight: 700,
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                margin: "0 4px",
              }}
            />
          ) : (
            <span>{nomorUrut}</span>
          )}

          <span>{suffix}</span>

        </div>

        <div className="approval-button-group">

          <button
            className="edit-button"
              onClick={() =>
                setIsEditNomor(true)
              }
          >
            Edit Nomor
          </button>

          <button
            className="approve-button"
            onClick={handleLanjut}
          >
            Lanjut Approval
          </button>

        </div>

        <button
          className="close-button"
          onClick={onClose}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}