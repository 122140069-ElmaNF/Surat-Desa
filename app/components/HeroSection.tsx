"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="hero">
      {/* MENU LOGIN */}
      <div className="hero-menu">
        <button
          type="button"
          className="hero-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Buka menu"
        >
          ☰
        </button>

        {menuOpen && (
          <div className="hero-menu-dropdown">
            <Link href="/login">
              Login Pengelola
            </Link>
          </div>
        )}
      </div>

      <div className="hero-content">
        <img
          src="\logoSurat.png"
          alt="Logo Desa"
          className="hero-logo"
        />

        <h1>
          LAYANAN SURAT MENYURAT DESA SUMBEREJO
        </h1>

        <p>
          Pelayanan administrasi desa secara
          online, mudah, cepat, dan transparan
          tanpa perlu datang ke kantor desa.
        </p>

        <div className="hero-buttons">
          <Link href="/pengajuan">
            Pengajuan Surat
          </Link>

          <Link href="/tracking">
            Cek Status Surat
          </Link>
        </div>
      </div>
    </section>
  );
}