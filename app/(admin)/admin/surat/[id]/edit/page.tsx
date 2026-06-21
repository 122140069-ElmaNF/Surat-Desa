import Link from "next/link";
import db from "@/lib/db";
import SuratEditor from "./SuratEditor";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DetailRow = {
  nama_field: string;
  value: string | null;
};

export default async function AdminEditSuratPage({
  params,
}: PageProps) {
  const { id } = await params;

  const [rows] = await db.query(
    `
      SELECT
        ps.id,
        ps.kode_tracking,
        ps.status,
        js.nama_surat,
        js.template_surat,
        js.use_kop
      FROM pengajuan_surat ps
      LEFT JOIN jenis_surat js
        ON js.id = ps.jenis_surat_id
      WHERE ps.id = ?
      LIMIT 1
    `,
    [id]
  );

  const surat = (rows as any[])[0];

  if (!surat) {
    return (
      <div style={{ color: "#991b1b" }}>
        Data surat tidak ditemukan.
      </div>
    );
  }

  const [details] = await db.query(
    `
      SELECT
        fs.nama_field,
        dp.value
      FROM detail_pengajuan dp
      JOIN field_surat fs
        ON fs.id = dp.field_id
      WHERE dp.pengajuan_id = ?
    `,
    [id]
  );

  let content = surat.template_surat || "";

  (details as DetailRow[]).forEach((detail) => {
    const value = detail.value || "";

    content = content.replaceAll(
      `{{${detail.nama_field}}}`,
      value
    );
  });

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
              {surat.nama_surat}
            </strong>{" "}
            (
            {surat.kode_tracking}
            )
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
        suratId={surat.id}
        content={content}
        useKop={Boolean(surat.use_kop)}
      />
    </div>
  );
}