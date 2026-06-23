const suratList = [
  {
    title: "Surat Keterangan Domisili",
    desc: "Pelayanan pembuatan surat domisili.",
  },
  {
    title: "Surat Keterangan Usaha",
    desc: "Pelayanan pembuatan surat usaha.",
  },
  {
    title: "Surat Keterangan Tidak Mampu",
    desc: "Pelayanan pembuatan surat tidak mampu.",
  },
];

export default function JenisSuratSection() {
  return (
    <section className="surat-section">
      <div className="container">
        <h2>
          Jenis Surat yang Tersedia
        </h2>

        <div className="surat-grid">
          {suratList.map((surat) => (
            <div
              key={surat.title}
              className="surat-card"
            >
              <div
                style={{
                  fontSize: "40px",
                  marginBottom: "20px",
                }}
              >
                📄
              </div>

              <h3>{surat.title}</h3>
              <p>{surat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}