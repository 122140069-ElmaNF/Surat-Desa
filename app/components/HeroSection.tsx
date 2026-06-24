import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <img
          src="\desa-logo.png"
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