import db from "@/lib/db";
import ProfilForm from "./ProfilForm";

export default async function ProfilPimpinanPage() {
  const [rows] = await db.query(`
    SELECT
      u.id,
      u.nama,
      u.tanda_tangan,
      u.periode,
      u.jabatan
    FROM users u
    WHERE u.role = 'kepala_desa'
    LIMIT 1
  `);

  const profil = (rows as any[])[0];

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="page-title">
          Profil Kepala Desa
        </h1>

        <p className="page-subtitle">
          Kelola data Kepala Desa, periode jabatan,
          dan tanda tangan yang digunakan untuk
          pengesahan surat.
        </p>
      </div>

      <div className="card">
        {profil ? (
          <ProfilForm
            nama={profil.nama}
            jabatan={
              profil.jabatan ??
              "Kepala Desa Sumberejo"
            }
            periode={profil.periode}
            tanda_tangan={
              profil.tanda_tangan
            }
          />
        ) : (
          <p>
            Belum terdapat Kepala Desa aktif.
          </p>
        )}
      </div>
    </div>
  );
}