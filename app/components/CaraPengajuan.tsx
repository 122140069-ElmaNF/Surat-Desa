const steps = [
  {
    no: 1,
    title: "Pilih Surat",
    desc:
      "Pilih jenis surat yang ingin diajukan.",
  },
  {
    no: 2,
    title: "Isi Data",
    desc:
      "Lengkapi data sesuai formulir.",
  },
  {
    no: 3,
    title: "Verifikasi",
    desc:
      "Admin akan memverifikasi data.",
  },
  {
    no: 4,
    title: "Unduh Surat",
    desc:
      "Surat dapat diunduh setelah disetujui.",
  },
];

export default function CaraPengajuan() {
  return (
    <section className="cara-section">
      <div className="container">
        <h2>
          Cara Pengajuan
        </h2>

        <div className="step-grid">
          {steps.map((step) => (
            <div
              key={step.no}
              className="step-card"
            >
              <div className="step-number">
                {step.no}
              </div>

              <h3>{step.title}</h3>

              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}