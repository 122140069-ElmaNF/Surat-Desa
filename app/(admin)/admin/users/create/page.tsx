"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function CreateAdminPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("staff_admin");

  const [jabatan, setJabatan] = useState("");
  const [periode, setPeriode] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    // =========================================
    // VALIDASI FIELD DASAR
    // =========================================

    if (!nama || !username || !password) {
      toast.warning("Semua field wajib diisi.");
      return;
    }

    // =========================================
    // VALIDASI KHUSUS KEPALA DESA
    // =========================================

    if (role === "kepala_desa") {
      if (!jabatan.trim()) {
        toast.warning("Jabatan Kepala Desa wajib diisi.");
        return;
      }

      if (!periode.trim()) {
        toast.warning("Periode jabatan Kepala Desa wajib diisi.");
        return;
      }

      // Validasi format periode
      if (!/^\d{4}-\d{4}$/.test(periode)) {
        toast.warning(
          "Format periode harus seperti 2026-2027."
        );
        return;
      }

      const [tahunAwal, tahunAkhir] =
        periode.split("-").map(Number);

      if (tahunAkhir <= tahunAwal) {
        toast.warning(
          "Tahun akhir periode harus lebih besar dari tahun awal."
        );
        return;
      }
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/users", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          nama,
          username,
          password,
          role,

          // Jabatan hanya dikirim untuk Kepala Desa
          jabatan:
            role === "kepala_desa"
              ? jabatan.trim()
              : null,

          // Periode hanya dikirim untuk Kepala Desa
          periode:
            role === "kepala_desa"
              ? periode.trim()
              : null,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(
          "Akun berhasil ditambahkan."
        );

        router.push("/admin/users");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(
        "ERROR TAMBAH AKUN:",
        error
      );

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
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 className="page-title">
            Tambah Akun
          </h1>

          <p className="page-subtitle">
            Tambahkan akun Staff Admin atau Kepala Desa
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
                setNama(e.target.value)
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
                setUsername(e.target.value)
              }
              placeholder="Masukkan username"
            />
          </div>

          {/* =========================
              PASSWORD
          ========================= */}

          <div className="admin-form-group">
            <label>
              Password
            </label>

            <div className="password-input">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Masukkan password"
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
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
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
              onChange={(e) => {
                const newRole =
                  e.target.value;

                setRole(newRole);

                // Kalau bukan Kepala Desa,
                // kosongkan data khusus Kepala Desa
                if (
                  newRole !==
                  "kepala_desa"
                ) {
                  setJabatan("");
                  setPeriode("");
                }
              }}
            >
              <option value="staff_admin">
                Staff Admin
              </option>

              <option value="kepala_desa">
                Kepala Desa
              </option>
            </select>
          </div>

          {/* =========================
              JABATAN
              HANYA KEPALA DESA
          ========================= */}

          {role === "kepala_desa" && (
            <div
              className="admin-form-group"
              style={{
                marginTop: "-4px",
              }}
            >
              <label>
                Jabatan
              </label>

              <input
                type="text"
                value={jabatan}
                onChange={(e) =>
                  setJabatan(
                    e.target.value
                  )
                }
                placeholder="Contoh: Kepala Desa"
              />

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Masukkan jabatan Kepala Desa yang
                akan ditampilkan pada surat.
              </small>
            </div>
          )}

          {/* =========================
              PERIODE
              HANYA KEPALA DESA
          ========================= */}

          {role === "kepala_desa" && (
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
                Masukkan periode masa jabatan,
                contoh 2026-2027.
              </small>
            </div>
          )}
        </div>

        {/* =========================
            ACTION
        ========================= */}

        <div className="form-action">
          <button
            className="btn btn-outline"
            onClick={() =>
              router.back()
            }
            disabled={loading}
          >
            Batal
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Menyimpan..."
              : "Simpan"}
          </button>
        </div>
      </section>
    </div>
  );
}