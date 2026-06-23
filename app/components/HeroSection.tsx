import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero">
        <img
          src="/logo.png"
          alt="Logo Desa"
          style={{
            width: 90,
            margin: "0 auto 30px",
          }}
        />

        <h1>
          LAYANAN SURAT MENYURAT DESA
        </h1>

        <p>
          Pelayanan administrasi desa
          secara online, mudah, cepat,
          dan transparan tanpa perlu
          datang ke kantor desa.
        </p>

        <div className="hero-buttons">
          <Link
            href="/pengajuan"
            className="primary-btn"
          >
            Pengajuan Surat
          </Link>

          <Link
            href="/tracking"
            className="secondary-btn"
          >
            Cek Status Surat
          </Link>
        </div>
      </div>
    </section>
  );
}