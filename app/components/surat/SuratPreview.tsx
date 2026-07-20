import SuratPaper from "./SuratPaper";
import DomisiliTemplate from "./templates/DomisiliTemplate";

type Profil = {
  nama_kepala_desa: string;
  jabatan: string;
  tanda_tangan: string;
};

type Props = {
  mode?: "preview" | "print";

  content: string;
  useKop: boolean;
  status: string;
  profil: Profil | null;
  tanggalSurat?: string;
};

export default function SuratPreview({
  mode = "preview",
  content,
  useKop,
  status,
  profil,
  tanggalSurat,
}: Props) {
  return (
    <SuratPaper mode={mode}>
      <DomisiliTemplate
        content={content}
        useKop={useKop}
        status={status}
        profil={profil}
        tanggalSurat={tanggalSurat}
      />
    </SuratPaper>
  );
}