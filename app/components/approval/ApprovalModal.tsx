"use client";

import { useRouter } from "next/navigation";

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
  const router = useRouter();

  if (!open) return null;

  async function handleLanjut() {
    const res = await fetch(
      `/api/admin/surat/${suratId}/kirim-approval`,
      {
        method: "POST",
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
          {nomorSurat}
        </div>

        <div className="approval-button-group">

          <button
            className="edit-button"
            onClick={() =>
              router.push(
                `/admin/surat/${suratId}/edit`
              )
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