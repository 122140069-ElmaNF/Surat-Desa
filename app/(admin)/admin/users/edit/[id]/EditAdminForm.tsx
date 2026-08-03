"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  user: {
    id: number;
    nama: string;
    username: string;
    role: string;
  };
};

export default function EditAdminForm({
  user,
}: Props) {
  const router = useRouter();

  const [nama, setNama] = useState(user.nama);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user.role);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleUpdate() {
    if (!nama || !username) {
      alert("Nama dan Username wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            nama,
            username,
            password,
            role,
          }),
        }
      );

      const result =
        await res.json();

      if (result.success) {
        alert("Data berhasil diperbarui.");

        router.push("/admin/users");
        router.refresh();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Edit Admin
          </h1>

          <p className="page-subtitle">
            Perbarui data Admin atau
            Pimpinan
          </p>
        </div>
      </div>

      <section className="card">
        <div className="admin-form">

          <div className="admin-form-group">
            <label>Nama Lengkap</label>

            <input
              type="text"
              value={nama}
              onChange={(e) =>
                setNama(e.target.value)
              }
            />
          </div>

          <div className="admin-form-group">
            <label>Password Baru</label>

            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Kosongkan jika tidak diubah"
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Role</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="admin">
                Admin
              </option>

              <option value="pimpinan">
                Pimpinan
              </option>
            </select>
          </div>
        </div>

        <div className="form-action">
          <button
            className="secondary-btn"
            onClick={() =>
              router.back()
            }
          >
            Batal
          </button>

          <button
            className="primary-btn"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading
              ? "Mengupdate..."
              : "Update"}
          </button>
        </div>
      </section>
    </div>
  );
}