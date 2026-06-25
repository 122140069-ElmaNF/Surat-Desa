import Link from "next/link";
import db from "@/lib/db";
import DeleteUserButton from "@/app/components/DeleteUserButton";

export default async function AdminUsersPage() {
  const [rows] = await db.query(`
    SELECT
      id,
      nama,
      username,
      role,
      created_at
    FROM users
    ORDER BY created_at DESC
  `);

  const users = rows as any[];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Manajemen Admin
          </h1>

          <p className="page-subtitle">
            Kelola akun Admin dan Pimpinan
          </p>
        </div>

        <Link href="/admin/users/create">
          <button className="primary-btn">
            + Tambah Admin
          </button>
        </Link>
      </div>

      {/* Card */}
      <section className="card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b",
                  }}
                >
                  Belum ada data admin.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>

                  <td>{user.nama}</td>

                  <td>{user.username}</td>

                  <td>
                    <span
                      className={`role-badge ${user.role}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      user.created_at
                    ).toLocaleDateString("id-ID")}
                  </td>

                  <td>
                    <div className="table-action">
                      <Link
                        href={`/admin/users/edit/${user.id}`}
                      >
                        <button className="edit-btn">
                          Edit
                        </button>
                      </Link>

                      <DeleteUserButton
                          id={user.id}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}