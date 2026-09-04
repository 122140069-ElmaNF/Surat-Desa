const suratList = [
  {
    no: "01",
    title: "Surat Keterangan Domisili",
    desc: "Pelayanan pembuatan surat domisili.",
  },
  {
    no: "02",
    title: "Surat Keterangan Usaha",
    desc: "Pelayanan pembuatan surat usaha.",
  },
  {
    no: "03",
    title: "Surat Keterangan Tidak Mampu",
    desc: "Pelayanan pembuatan surat tidak mampu.",
  },
  {
    no: "04",
    title: "Dan Lainnya",
    desc: "Tersedia berbagai jenis surat lainnya sesuai kebutuhan pelayanan desa.",
  },
];

export default function JenisSuratSection() {
  return (
    <section className="surat-section">
      <div className="container">
        <h2>
          Jenis Surat yang Tersedia
        </h2>

        <div className="surat-list">
          {suratList.map((surat) => (
            <div
              key={surat.title}
              className="surat-item"
            >
              <div className="surat-number">
                {surat.no}
              </div>

              <div className="surat-content">
                <h3>{surat.title}</h3>
                <p>{surat.desc}</p>
              </div>

              <div className="surat-arrow">
                →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}