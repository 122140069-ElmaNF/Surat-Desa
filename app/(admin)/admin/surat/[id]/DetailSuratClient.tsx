"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, } from "next/navigation";
import { useEffect, useState } from "react";
import ApprovalModal from "@/app/components/approval/ApprovalModal";
import ActivityTimeline from "@/app/components/activity/ActivityTimeline";

import {
  ArrowLeft,
  Eye,
  SquarePen,
  BadgeCheck,
  CircleX,
  Printer,
} from "lucide-react";

type Props = {
  pengajuan: any;
  detail: any[];
  dokumen: any[];
  activities: any[];
};

export default function DetailSuratClient({
  pengajuan,
  detail,
  dokumen,
  activities,
}: Props){

  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);   
  const [loading, setLoading] = useState(false);
  const [previewNomor, setPreviewNomor] = useState("");
  const [previewTanggal, setPreviewTanggal] = useState("");
  const [loadingApproval, setLoadingApproval] = useState(false);
  
  useEffect(() => {
  if (searchParams.get("autoApproval") === "1") {
    handleOpenApproval();
  }
}, []);

async function handleApproval() {

  try {

    setLoadingApproval(true);

    const res = await fetch(
      `/api/admin/surat/${pengajuan.id}/approval`,
      {
        method: "POST",
      }
    );

    const result = await res.json();

    if (!result.success) {

      alert(result.message);

      return;

    }

    alert(
      "Surat berhasil dikirim ke Kepala Desa."
    );

    router.push("/admin/surat");

    setShowModal(false);

  } catch (err) {

    console.error(err);

    alert("Terjadi kesalahan server.");

  } finally {
    setLoadingApproval(false);
  }

}

async function handleOpenApproval() {
  try {

    const res = await fetch(
      `/api/admin/surat/${pengajuan.id}/preview-nomor`
    );

    const result = await res.json();

    console.log("RESULT API =", result);

    if (!result.success) {
      alert(result.message);
      return;
    }

    setPreviewNomor(result.nomorSurat);

    setPreviewTanggal(
      new Date(result.tanggalSurat).toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
    );

    setShowModal(true);

  } catch (e) {
    console.error(e);
  }
}

console.log("previewNomor =", previewNomor);
console.log("previewTanggal =", previewTanggal);

  return (

    <div>
        
      {/* ================= HEADER ================= */}

        <div className="page-header">

        <div>

            <h1 className="page-title">
            Detail Surat
            </h1>

            <p className="page-subtitle">
            {pengajuan.kode_tracking}
            </p>

        </div>
          <Link href="/admin/surat">
            <button className="btn btn-outline">
              <ArrowLeft size={18} />
              Kembali
            </button>
          </Link>
        </div>


<div className="detail-grid">

  <div className="detail-column">
  

      {/* ================= INFORMASI SURAT ================= */}

<section className="detail-card">

  <h2 className="detail-title">
    Informasi Surat
  </h2>

  <table className="detail-table">

    <tbody>

      <tr>

        <td className="detail-label">
          Tracking
        </td>

        <td className="detail-colon">
          :
        </td>

        <td className="detail-value">
          {pengajuan.kode_tracking}
        </td>

      </tr>

      <tr>

        <td className="detail-label">
          Jenis Surat
        </td>

        <td className="detail-colon">
          :
        </td>

        <td className="detail-value">
          {pengajuan.nama_surat}
        </td>

      </tr>

      <tr>

        <td className="detail-label">
          Status
        </td>

        <td className="detail-colon">
          :
        </td>

        <td className="detail-value">
          {pengajuan.status}
        </td>

      </tr>

      <tr>

        <td className="detail-label">
          Nomor Surat
        </td>

        <td className="detail-colon">
          :
        </td>

        <td className="detail-value">
          {pengajuan.nomor_surat ?? "-"}
        </td>

      </tr>

      <tr>

        <td className="detail-label">
          Tanggal Pengajuan
        </td>

        <td className="detail-colon">
          :
        </td>

        <td className="detail-value">
          {new Date(
            pengajuan.created_at
          ).toLocaleString("id-ID")}
        </td>

      </tr>

    </tbody>

  </table>

</section>

      {/* ================= DATA PEMOHON ================= */}

<section className="detail-card">

  <h2 className="detail-title">
    Data Pemohon
  </h2>

  <table className="detail-table">

    <tbody>

      {detail.map((item) => (

        <tr key={item.key}>

          <td className="detail-label">
            {item.label}
          </td>

          <td className="detail-colon">
            :
          </td>

          <td className="detail-value">
            {item.value}
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</section>

</div>

<div className="detail-column">

      {/* ================= DOKUMEN ================= */}

<section className="detail-card">
  <h2 className="detail-title">
    Dokumen Persyaratan
  </h2>
  {dokumen.length === 0 && (
    <p className="empty-text">
      Tidak ada dokumen.
    </p>
  )}

  <div className="dokumen-grid">
    {dokumen.map((file) => {
      const isImage =
        /\.(jpg|jpeg|png|webp)$/i.test(
          file.file
        );

      return (
        <div
          key={file.key}
          className="dokumen-item"
        >
          {isImage ? (

            <Image
              src={file.url}
              alt={file.label}
              width={240}
              height={180}
              className="dokumen-image"
            />

          ) : (
            <div className="dokumen-file">
              📄
            </div>
          )}
          <div className="dokumen-footer">

            <strong>
              {file.label}
            </strong>
            <br />
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="dokumen-link"
            >
              Lihat Dokumen
            </a>
          </div>
        </div>
      );
    })}
  </div>
</section>

{/* ================= RIWAYAT AKTIVITAS ================= */}

<section className="detail-card">

  <h2 className="detail-title">
    Riwayat Aktivitas
  </h2>

  <ActivityTimeline
    activities={activities}
    showUserInfo
    showTitle={false}
  />

</section>

        {/* ================= ACTION ================= */}

<section className="detail-card">

  <h2 className="detail-title">
    Aksi
  </h2>
  <div className="action-group">

    <button
      className="btn btn-outline btn-block"
      onClick={() =>
        router.push(`/admin/preview/${pengajuan.id}`)
      }
    >
      <Eye size={18} />
      Preview Surat
    </button>

    {["draft", "pending"].includes(pengajuan.status) && (
      <>
        <button
          className="btn btn-primary btn-block"
          onClick={() =>
            router.push(`/admin/surat/${pengajuan.id}/edit`)
          }
        >
          <SquarePen size={18} />
          Edit Surat
        </button>

        <button
          className="btn btn-success btn-block"
          onClick={handleOpenApproval}
        >
          <BadgeCheck size={18} />
          Kirim Approval
        </button>

        <button
          className="btn btn-danger btn-block"
          onClick={() =>
            router.push(`/admin/surat/${pengajuan.id}/tolak`)
          }
        >
          <CircleX size={18} />
          Tolak Surat
        </button>
      </>
    )}

    {pengajuan.status === "menunggu_persetujuan" && (
      <div className="status-info">
        Surat sedang menunggu
        persetujuan Kepala Desa.
      </div>
    )}

    {pengajuan.status ==="disetujui" && (
      <>
        <button
          className="btn btn-primary btn-block"
          onClick={() =>
            router.push(`/admin/preview/${pengajuan.id}`)
          }
        >
          <Printer size={18} />
          Cetak PDF
        </button>

        <div className="status-success">
          Surat telah disetujui.
        </div>
      </>
    )}

    {pengajuan.status ===
      "ditolak" && (
      <div className="status-reject">
        <strong>
          Surat Ditolak
        </strong>
        <br />
        <br />
        {pengajuan.alasan_penolakan}
      </div>
    )}
  </div>
</section>
</div>
</div>
  <ApprovalModal
  open={showModal}
  suratId={pengajuan.id}
  nomorSurat={previewNomor}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    router.refresh();
  }}
/>
    </div>
  );
}
