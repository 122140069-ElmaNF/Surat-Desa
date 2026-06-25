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
      role
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  const user = (rows as any[])[0];

  if (!user) {
    return (
      <div className="card">
        <h2>User tidak ditemukan.</h2>
      </div>
    );
  }

  return (
    <EditAdminForm user={user} />
  );
}