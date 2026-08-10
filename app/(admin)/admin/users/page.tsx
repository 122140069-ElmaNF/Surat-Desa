import Link from "next/link";
import db from "@/lib/db";
import DeleteUserButton from "@/app/components/DeleteUserButton";
import { requireSuperAdminPage } from "@/lib/auth";

export default async function AdminUsersPage() {
  const currentUser =
  await requireSuperAdminPage();
  const [rows] = await db.query(`
    SELECT
      id,
      nama,
      username,
      role,
      periode,
      is_super_admin,
      created_at
    FROM users
    ORDER BY created_at DESC
  `);

  const users = rows as any[];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Manajemen Admin</h1>

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

      <div className="responsive-table-wrap">
        <table className="responsive-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>No</th>
              <th>Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>Dibuat</th>
              <th style={{ width: 180 }}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
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
                  {user.is_super_admin ? (
                    <span className="status-badge status-super-admin">
                      Super Admin
                    </span>
                  ) : (
                    <div>
                      <span
                        className={`status-badge status-${user.role}`}
                      >
                        {user.role === "staff_admin"
                          ? "Staff Admin"
                          : user.role === "kepala_desa"
                          ? "Kepala Desa"
                          : user.role === "ex_kepala_desa"
                          ? "Ex Kepala Desa"
                          : user.role}
                      </span>

                      {user.periode && (
                        <div className="role-period">
                          {user.periode}
                        </div>
                      )}
                    </div>
                  )}
                </td>

                  <td>
                    {new Date(user.created_at).toLocaleDateString("id-ID")}
                  </td>

                  <td>
                    <div className="table-actions">

                      <Link href={`/admin/users/edit/${user.id}`}>
                          <button className="btn btn-primary btn-sm">
                              Edit
                          </button>
                      </Link>

                      {currentUser.id !== user.id && (
                          <DeleteUserButton
                              id={user.id}
                          />
                      )}
                  </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}