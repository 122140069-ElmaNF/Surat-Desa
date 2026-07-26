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