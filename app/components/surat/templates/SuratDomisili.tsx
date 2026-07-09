"use client";

import SuratPaper from "../SuratPaper";
import SuratCanvas from "../SuratCanvas";
import SuratTitle from "../SuratTitle";
import Paragraph from "../Paragraph";
import IdentitasTable from "../IdentitasTable";
import TandaTangan from "../TandaTangan";

type Props = {
  nomorSurat: string;

  nama: string;
  nik: string;
  ttl: string;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  alamat: string;

  tanggal: string;

  useKop?: boolean;

  profil: {
    jabatan: string;
    nama: string;
    tandaTangan?: string;
  };

  showTtd?: boolean;
};

export default function SuratDomisili({
  nomorSurat,

  nama,
  nik,
  ttl,
  jenisKelamin,
  agama,
  pekerjaan,
  alamat,

  tanggal,

  useKop = true,

  profil,

  showTtd = true,
}: Props) {
  return (
    <SuratPaper>

      <SuratCanvas useKop={useKop}>

        <SuratTitle
          title="SURAT KETERANGAN DOMISILI"
          nomor={nomorSurat}
        />

        <Paragraph>
          Yang bertanda tangan di bawah ini Kepala Desa
          Sumberejo Kecamatan Way Jepara Kabupaten
          Lampung Timur menerangkan dengan sebenarnya
          bahwa :
        </Paragraph>

        <IdentitasTable
          items={[
            {
              label: "Nama Lengkap",
              value: nama,
            },
            {
              label: "NIK",
              value: nik,
            },
            {
              label: "Tempat / Tgl Lahir",
              value: ttl,
            },
            {
              label: "Jenis Kelamin",
              value: jenisKelamin,
            },
            {
              label: "Agama",
              value: agama,
            },
            {
              label: "Pekerjaan",
              value: pekerjaan,
            },
            {
              label: "Alamat",
              value: alamat,
            },
          ]}
        />

        <Paragraph>
          Adalah benar-benar Penduduk Desa Sumberejo
          tepatnya di alamat tersebut di atas dan selama
          ini berkelakuan baik.
        </Paragraph>

        <Paragraph>
          Demikian Surat Keterangan Domisili ini dibuat
          dengan sebenar-benarnya untuk dipergunakan
          sebagaimana mestinya.
        </Paragraph>

        <TandaTangan
          tempat="Sumberejo"
          tanggal={tanggal}
          jabatan={profil.jabatan}
          nama={profil.nama}
          image={profil.tandaTangan}
          showImage={showTtd}
        />

      </SuratCanvas>

    </SuratPaper>
  );
}