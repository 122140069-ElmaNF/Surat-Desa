import db from "@/lib/db";
import ProfilForm from "./ProfilForm";

export default async function ProfilPimpinanPage() {
  const [rows] = await db.query(`
    SELECT *
    FROM profil_pimpinan
    LIMIT 1
  `);

  const profil = (rows as any[])[0];

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="page-title">
          Profil Pimpinan
        </h1>

        <p className="page-subtitle">
          Kelola jabatan, nama kepala desa, dan tanda tangan pimpinan.
        </p>
      </div>

      <div className="card">
        <ProfilForm
          jabatan={profil?.jabatan}
          nama_kepala_desa={
            profil?.nama_kepala_desa
          }
          tanda_tangan={
            profil?.tanda_tangan
          }
        />
      </div>
    </div>
  );
  
}