import { Editor } from "@tiptap/react";

import DomisiliTemplate from "./DomisiliTemplate";
import KehilanganTemplate from "./KehilanganTemplate";
import KeramaianTemplate from "./KeramaianTemplate";
import TidakBerlangganTemplate from "./TidakBerlangganTemplate"
import TidakMampuTemplate from "./TidakMampuTemplate"

type Profil = {
  nama_kepala_desa: string;
  jabatan: string;
  tanda_tangan: string;
};

export type SuratTemplateProps = {
  kodeSurat: string;

  content: string;
  useKop: boolean;

  status: string;
  profil: Profil | null;

  tanggalSurat?: string;

  editable?: boolean;
  editor?: Editor | null;
};

export default function SuratTemplate(
  props: SuratTemplateProps
) {
  switch (props.kodeSurat) {
    // ==========================
    // 1 TTD
    // ==========================

    case "SD":
    case "SKU":
    case "SKJ":
    case "SKL":
    case "SKKD":
    case "SKBNI":
    case "SKPHS":
    case "SKM":
    case "STHT":
      return <DomisiliTemplate {...props} />;

    // ==========================
    // 2 TTD
    // ==========================

    case "SKH":
      return <KehilanganTemplate {...props} />;

    case "SKIK":
      return <KeramaianTemplate {...props} />;

    case "SKTBAPT":
      return <TidakBerlangganTemplate {...props} />;

    // ==========================
    // 3 TTD
    // ==========================

    case "SKTM":
      return <TidakMampuTemplate {...props} />;

    default:
      return <DomisiliTemplate {...props} />;
  }
}