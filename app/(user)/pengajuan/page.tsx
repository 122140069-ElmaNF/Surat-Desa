"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type JenisSurat = {
  id: number;
  nama_surat: string;
};

export default function PengajuanPage() {
  const router = useRouter();

  const [jenisSurat, setJenisSurat] = useState<JenisSurat[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    async function loadJenisSurat() {
      try {
        const res = await fetch("/api/jenis-surat");
        const result = await res.json();

        if (result.success) {
          setJenisSurat(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadJenisSurat();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    setSelected(value);

    switch (value) {
      case "Surat Keterangan Domisili":
        router.push("/pengajuan/domisili");
        break;

      case "Surat Keterangan Izin Keramaian":
        router.push("/pengajuan/izin-keramaian");
        break;

      case "Surat Keterangan Pindah Agama":
        router.push("/pengajuan/pindah-agama");
        break;

      case "Surat Keterangan Listrik":
        router.push("/pengajuan/listrik");
        break;

      case "Surat Keterangan Tidak Mampu":
        router.push("/pengajuan/tidak-mampu");
        break;

      case "Surat Keterangan Usaha":
        router.push("/pengajuan/usaha");
        break;

      case "Surat Keterangan Jalan":
        router.push("/pengajuan/jalan");
        break;

      case "Surat Keterangan Kehilangan":
        router.push("/pengajuan/kehilangan");
        break;

      case "Surat Pengantar SKCK":
        router.push("/pengajuan/skck");
        break;

      case "Surat Keterangan Kebenaran Data":
        router.push("/pengajuan/kebenaran-data");
        break;

      case "Surat Keterangan Beda Nama dan Identitas":
        router.push("/pengajuan/beda-nama-identitas");
        break;

      case "Surat Kuasa Penuh":
        router.push("/pengajuan/kuasa-penuh");
        break;

      case "Surat Keterangan Tidak Berlanggan Air PDAM dan Telpon":
        router.push("/pengajuan/tidak-berlanggan-air");
        break;

      case "Surat Keterangan Penghasilan":
        router.push("/pengajuan/penghasilan");
        break;

      case "Surat Keterangan Kematian":
        router.push("/pengajuan/kematian");
        break;
    }
  }

  return (
    <div className="pengajuan-page">
      <section className="pengajuan-hero">
        <div className="pengajuan-hero-content">
          <h1>Pengajuan Surat Desa</h1>

          <p>
            Lengkapi data pemohon dan ajukan surat secara online tanpa perlu
            datang ke kantor desa.
          </p>
        </div>
      </section>

      <section className="pengajuan-content">
        <div className="pengajuan-card">
          <h2>Form Pengajuan Surat</h2>

          <p>
            Pilih jenis surat terlebih dahulu kemudian isi data sesuai kebutuhan
            surat.
          </p>

          <div style={{ marginTop: 30 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Jenis Surat
            </label>

            <select
              value={selected}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
              }}
            >
              <option value="">
                -- Pilih Jenis Surat --
              </option>

              {jenisSurat.map((item) => (
                <option
                  key={item.id}
                  value={item.nama_surat}
                >
                  {item.nama_surat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}