"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================================
  // ERROR
  // =========================================

  const [usernameError, setUsernameError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [generalError, setGeneralError] =
    useState("");

  // =========================================
  // LOGIN
  // =========================================

  async function handleLogin() {
    // Reset error sebelumnya
    setUsernameError("");
    setPasswordError("");
    setGeneralError("");

    // =========================================
    // VALIDASI FORM
    // =========================================

    if (!username.trim()) {
      setUsernameError(
        "Username wajib diisi."
      );
    }

    if (!password) {
      setPasswordError(
        "Password wajib diisi."
      );
    }

    if (
      !username.trim() ||
      !password
    ) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const result =
        await res.json();

      // =========================================
      // LOGIN GAGAL
      // =========================================

      if (!result.success) {
        if (res.status === 404) {
          setUsernameError(
            "Username tidak ditemukan."
          );
        } else if (res.status === 401) {
          setPasswordError(
            "Password salah."
          );
        } else {
          setGeneralError(
            result.message ||
              "Login gagal."
          );
        }

        return;
      }

      // =========================================
      // REDIRECT BERDASARKAN ROLE
      // =========================================

      if (
        result.role === "super_admin" ||
        result.role === "staff_admin"
      ) {
        router.push("/admin");
      } else if (
        result.role === "kepala_desa"
      ) {
        router.push("/pimpinan");
      } else if (
        result.role === "ex_kepala_desa"
      ) {
        setGeneralError(
          "Masa jabatan Anda telah berakhir. Akun ini tidak dapat digunakan untuk mengakses dashboard."
        );
      } else {
        setGeneralError(
          "Role akun tidak dikenali."
        );
      }
    } catch (err) {
      console.error(err);

      setGeneralError(
        "Terjadi kesalahan saat menghubungi server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* =========================================
            LOGO
        ========================================= */}

        <div className="login-logo">
          <div className="logo-circle">
            <ShieldCheck size={42} />
          </div>

          <h1>
            Sistem Informasi Surat Desa
          </h1>

          <p>
            Pemerintah Desa
          </p>
        </div>

        {/* =========================================
            FORM
        ========================================= */}

        <div className="login-form">

          {/* =========================================
              USERNAME
          ========================================= */}

          <div className="login-group">
            <label>
              Username
            </label>

            <div
              className={`login-input ${
                usernameError
                  ? "login-input-error"
                  : ""
              }`}
            >
              <User size={18} />

              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => {
                  setUsername(
                    e.target.value
                  );

                  // Hapus error saat user mengetik
                  if (usernameError) {
                    setUsernameError("");
                  }

                  if (generalError) {
                    setGeneralError("");
                  }
                }}
              />
            </div>

            {/* ERROR USERNAME */}

            {usernameError && (
              <p className="login-error">
                {usernameError}
              </p>
            )}
          </div>

          {/* =========================================
              PASSWORD
          ========================================= */}

          <div className="login-group">
            <label>
              Password
            </label>

            <div
              className={`login-input ${
                passwordError
                  ? "login-input-error"
                  : ""
              }`}
            >
              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => {
                  setPassword(
                    e.target.value
                  );

                  // Hapus error saat user mengetik
                  if (passwordError) {
                    setPasswordError("");
                  }

                  if (generalError) {
                    setGeneralError("");
                  }
                }}
              />

              <button
                type="button"
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

            {/* ERROR PASSWORD */}

            {passwordError && (
              <p className="login-error">
                {passwordError}
              </p>
            )}
          </div>

          {/* =========================================
              GENERAL ERROR
          ========================================= */}

          {generalError && (
            <p className="login-general-error">
              {generalError}
            </p>
          )}

          {/* =========================================
              BUTTON
          ========================================= */}

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading
              ? "Memproses..."
              : "Masuk ke Sistem"}
          </button>
        </div>

        {/* =========================================
            FOOTER
        ========================================= */}

        <div className="login-footer">
          © {new Date().getFullYear()}{" "}
          Pemerintah Desa
        </div>
      </div>
    </div>
  );
}