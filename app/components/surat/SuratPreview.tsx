import SuratPaper from "./SuratPaper";
import SuratTemplate from "./templates/SuratTemplate";

type Profil = {
  nama_kepala_desa: string;
  jabatan: string;
  tanda_tangan: string;
};

type Props = {
  mode?: "preview" | "print";

  kodeSurat: string;
  content: string;
  useKop: boolean;
  status: string;
  profil: Profil | null;
  tanggalSurat?: string;
};

// ========================================
// FORMAT TANGGAL SURAT
// ========================================

function formatTanggalSurat(
  value?: string
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export default function SuratPreview({
  mode = "preview",
  kodeSurat,
  content,
  useKop,
  status,
  profil,
  tanggalSurat,
}: Props) {

  return (
    <SuratPaper mode={mode}>
      <SuratTemplate
        kodeSurat={kodeSurat}
        content={content}
        useKop={useKop}
        status={status}
        profil={profil}
        tanggalSurat={tanggalSurat}
      />
    </SuratPaper>
  );
}