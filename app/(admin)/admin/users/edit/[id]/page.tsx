import db from "@/lib/db";
import EditAdminForm from "./EditAdminForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAdminPage({
  params,
}: Props) {
  const { id } = await params;

  const [rows] = await db.query(
    `
    SELECT
      id,
      nama,
      username,
      role,
      periode,
      is_super_admin
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  const user = (rows as any[])[0];

  if (!user) {
    return (
      <div style={{ color: "#991b1b" }}>
        User tidak ditemukan.
      </div>
    );
  }

  return (
    <EditAdminForm
      user={{
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
        periode: user.periode ?? null,
        jabatan: user.jabatan ?? null,
        is_super_admin:
          Boolean(user.is_super_admin),
      }}
    />
  );
}