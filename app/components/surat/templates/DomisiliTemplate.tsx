import "../surat.css";
import SuratCanvas from "../SuratCanvas";
import TandaTangan from "../TandaTangan";

type Profil = {
  nama_kepala_desa: string;
  jabatan: string;
  tanda_tangan: string;
};

type Props = {
  content: string;
  useKop: boolean;
  status: string;
  profil: Profil | null;

  editable?: boolean;
  onChange?: (value: string) => void;
};

export default function DomisiliTemplate({
  content,
  useKop,
  status,
  profil,

  editable = false,
  onChange,
}: Props) {
  return (
    <SuratCanvas useKop={useKop}>

      {/* ===================== ISI SURAT ===================== */}

     <div
    className="surat-content"
    contentEditable={editable}
    suppressContentEditableWarning
    onInput={(e)=>
        onChange?.(
            (e.target as HTMLDivElement).innerHTML
        )
    }
    style={{
        outline: editable
            ? "1px dashed #9ca3af"
            : "none",

        padding: editable ? 8 : 0,

        minHeight: "600px",
    }}
>
    <div
        dangerouslySetInnerHTML={{
            __html: content,
        }}
    />
</div>

      {/* ===================== TANDA TANGAN ===================== */}
<TandaTangan
  jabatan={
    profil?.jabatan ??
    "Kepala Desa"
  }
  nama={
    profil?.nama_kepala_desa ??
    ""
  }
  image={
    profil?.tanda_tangan
  }
  showImage={
    status === "selesai"
  }
/>
    </SuratCanvas>
  );
}