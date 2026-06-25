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

  async function handleLogin() {
    if (!username || !password) {
      alert(
        "Username dan Password wajib diisi."
      );
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

      if (!result.success) {
        alert(result.message);
        return;
      }

      // Redirect berdasarkan role
      if (result.role === "admin") {
        router.push("/admin");
      } else if (
        result.role === "pimpinan"
      ) {
        router.push("/pimpinan");
      } else {
        alert(
          "Role tidak dikenali."
        );
      }
    } catch (err) {
      console.error(err);

      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
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

        {/* Form */}
        <div className="login-form">
          {/* Username */}
          <div className="login-group">
            <label>
              Username
            </label>

            <div className="login-input">
              <User size={18} />

              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-group">
            <label>
              Password
            </label>

            <div className="login-input">
              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Masukkan password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
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
          </div>

          {/* Button */}
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

        {/* Footer */}
        <div className="login-footer">
          © {new Date().getFullYear()}{" "}
          Pemerintah Desa
        </div>
      </div>
    </div>
  );
}