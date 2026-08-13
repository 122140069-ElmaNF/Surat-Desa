"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type Props = {
  user: {
    id: number;
    nama: string;
    username: string;
    role: string;
    periode: string | null;
    is_super_admin: boolean;
  };
};

export default function EditAdminForm({
  user,
}: Props) {
  const router = useRouter();

  const [nama, setNama] = useState(
    user.nama
  );

  const [username, setUsername] =
    useState(user.username);

  const [password, setPassword] =
    useState("");

  /*
   * Kalau Super Admin,
   * role UI dibuat "super_admin".
   *
   * Ini hanya untuk tampilan.
   * Database tetap menggunakan role aslinya
   * + is_super_admin = 1.
   */
  const [role, setRole] = useState(
    user.is_super_admin
      ? "super_admin"
      : user.role
  );

  const [periode, setPeriode] =
    useState(user.periode ?? "");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  // =========================================
  // UPDATE
  // =========================================

  async function handleUpdate() {
    if (
      !nama.trim() ||
      !username.trim()
    ) {
      toast.warning(
        "Nama dan Username wajib diisi."
      );
      return;
    }

    // =========================================
    // VALIDASI PERIODE
    //
    // Super Admin tidak menggunakan periode.
    // =========================================

    if (
      !user.is_super_admin &&
      (role === "kepala_desa" ||
        role === "ex_kepala_desa") &&
      !periode.trim()
    ) {
      toast.warning(
        "Periode jabatan wajib diisi."
      );
      return;
    }

    if (
      !user.is_super_admin &&
      (role === "kepala_desa" ||
        role === "ex_kepala_desa") &&
      !/^\d{4}-\d{4}$/.test(
        periode.trim()
      )
    ) {
      toast.warning(
        "Format periode harus seperti 2026-2027."
      );
      return;
    }

    // =========================================
    // VALIDASI TAHUN
    // =========================================

    if (
      !user.is_super_admin &&
      (role === "kepala_desa" ||
        role === "ex_kepala_desa")
    ) {
      const [
        tahunAwal,
        tahunAkhir,
      ] = periode
        .trim()
        .split("-")
        .map(Number);

      if (
        tahunAkhir <= tahunAwal
      ) {
        toast.warning(
          "Tahun akhir periode harus lebih besar dari tahun awal."
        );
        return;
      }
    }

    try {
      setLoading(true);

      /*
       * Untuk Super Admin:
       *
       * Jangan kirim "super_admin" ke API.
       *
       * Kirim role database aslinya.
       * API sudah melindungi is_super_admin.
       */
      const roleForApi =
        user.is_super_admin
          ? user.role
          : role;

      const res = await fetch(
        `/api/admin/users/${user.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            nama: nama.trim(),
            username: username.trim(),
            password,
            role: roleForApi,

            periode:
              !user.is_super_admin &&
              (role === "kepala_desa" ||
                role === "ex_kepala_desa")
                ? periode.trim()
                : null,
          }),
        }
      );

      const result =
        await res.json();

      if (result.success) {
        toast.success(
          "Data berhasil diperbarui."
        );

        router.push(
          "/admin/users"
        );

        router.refresh();
      } else {
        toast.error(
          result.message ||
            "Gagal memperbarui data."
        );
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Terjadi kesalahan pada server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* =========================
          HEADER
      ========================= */}

      <div
        className="page-header"
        style={{
          marginBottom: 24,
        }}
      >
        <div>
          <h1 className="page-title">
            Edit Admin
          </h1>

          <p className="page-subtitle">
            Perbarui data Staff Admin
            atau Kepala Desa
          </p>
        </div>
      </div>

      {/* =========================
          FORM
      ========================= */}

      <section className="card">
        <div className="admin-form">

          {/* =========================
              NAMA
          ========================= */}

          <div className="admin-form-group">
            <label>
              Nama Lengkap
            </label>

            <input
              type="text"
              value={nama}
              onChange={(e) =>
                setNama(
                  e.target.value
                )
              }
              placeholder="Masukkan nama lengkap"
            />
          </div>

          {/* =========================
              USERNAME
          ========================= */}

          <div className="admin-form-group">
            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Masukkan username"
            />
          </div>

          {/* =========================
              PASSWORD
          ========================= */}

          <div className="admin-form-group">
            <label>
              Password Baru
            </label>

            <div className="password-input">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                placeholder="Kosongkan jika tidak diubah"
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye
                    size={18}
                  />
                )}
              </button>

            </div>
          </div>

          {/* =========================
              ROLE
          ========================= */}

          <div className="admin-form-group">

            <label>
              Role
            </label>

            <select
              value={role}
              disabled={
                user.is_super_admin
              }
              onChange={(e) => {
                const newRole =
                  e.target.value;

                setRole(newRole);

                if (
                  newRole ===
                  "staff_admin"
                ) {
                  setPeriode("");
                }
              }}
            >

              {/* SUPER ADMIN */}
              {user.is_super_admin && (
                <option value="super_admin">
                  Super Admin
                </option>
              )}

              {/* USER BIASA */}

              {!user.is_super_admin && (
                <>
                  <option value="staff_admin">
                    Staff Admin
                  </option>

                  <option value="kepala_desa">
                    Kepala Desa
                  </option>

                  <option value="ex_kepala_desa">
                    Ex Kepala Desa
                  </option>
                </>
              )}

            </select>

            {/* INFO SUPER ADMIN */}

            {user.is_super_admin && (
              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Role Super Admin tidak
                dapat diubah.
              </small>
            )}

          </div>

          {/* =========================
              PERIODE
          ========================= */}

          {!user.is_super_admin &&
            (role ===
              "kepala_desa" ||
              role ===
                "ex_kepala_desa") && (
              <div
                className="admin-form-group"
                style={{
                  marginTop: "-4px",
                }}
              >

                <label>
                  Periode Jabatan
                </label>

                <input
                  type="text"
                  value={periode}
                  onChange={(e) =>
                    setPeriode(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: 2026-2027"
                  maxLength={9}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Masukkan periode masa
                  jabatan, contoh
                  2026-2027.
                </small>

              </div>
            )}

        </div>

        {/* =========================
            ACTION
        ========================= */}

        <div className="form-action">

          <button
            className="secondary-btn"
            onClick={() =>
              router.back()
            }
            disabled={loading}
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