import Link from "next/link";
import { getPengajuanDetail } from "@/lib/queries/getPengajuanDetail";
import SuratEditor from "./SuratEditor";
import { generateSurat } from "@/lib/surat/generateSurat";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditSuratPage({
  params,
}: PageProps) {
  const { id } = await params;

  const data = await getPengajuanDetail(id);

  if (!data) {
    return (
      <div style={{ color: "#991b1b" }}>
        Data surat tidak ditemukan.
      </div>
    );
  }

  const { pengajuan, detail } = data;

  const fields: Record<string, string> = {};

  // ==========================
  // Field dari detail surat
  // ==========================
  detail.forEach((item) => {
    fields[item.key] = String(item.value ?? "");
  });

  // ==========================
  // Field sistem
  // ==========================
  fields.nomor_surat =
    pengajuan.nomor_surat ?? "";

  fields.tanggal =
    pengajuan.tanggal_surat
      ? new Date(
          pengajuan.tanggal_surat
        ).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "";

  fields.nama_penandatangan =
    pengajuan.nama_penandatangan ?? "";

  fields.jabatan =
    pengajuan.jabatan ?? "";

// ==========================
// Generate isi surat
// ==========================

const content =
  pengajuan.status === "draft"
    ? generateSurat(
        pengajuan.template_surat || "",
        fields,
        {
          preserveSystemFields: true,
        }
      )
    : (pengajuan.isi_surat ||
        pengajuan.template_surat ||
        "");

  return (
    <div>
      <div
        className="page-header"
        style={{
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 className="page-title">
            Edit Surat
          </h1>

          <p className="page-subtitle">
            Edit isi surat{" "}
            <strong>
              {pengajuan.nama_surat}
            </strong>{" "}
            ({pengajuan.kode_tracking})
          </p>
        </div>

        <Link href="/admin/surat">
          <button
            style={{
              padding: "10px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Kembali
          </button>
        </Link>
      </div>

      <SuratEditor
        suratId={pengajuan.id}
        content={content}
        useKop={Boolean(
          pengajuan.use_kop
        )}
      />
    </div>
  );
}