import "../surat.css";
import SuratCanvas from "../SuratCanvas";
import TandaTangan from "../TandaTangan";
import LayoutTandaTangan from "../LayoutTandaTangan";
import { Editor, EditorContent } from "@tiptap/react";

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

  tanggalSurat?: string;

  editable?: boolean;
  editor?: Editor | null;

  onChange?: (value: string) => void;
};

export default function DomisiliTemplate({
  content,
  useKop,
  status,
  profil,
  tanggalSurat,

  editable = false,
  editor,

  onChange,
}: Props) {
  return (
    <SuratCanvas useKop={useKop}>

      {/* ===================== ISI SURAT ===================== */}
<div
  className="surat-content"
  style={{
    outline: editable
      ? "1px dashed #9ca3af"
      : "none",

    padding: editable ? 8 : 0,

    minHeight: editable ? "600px" : undefined,
  }}
>
  {editable && editor ? (
    <EditorContent editor={editor} />
  ) : (
    <div
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  )}
</div>

      {/* ===================== TANDA TANGAN ===================== */}
<LayoutTandaTangan columns={1}>
  <TandaTangan
    jabatan={profil?.jabatan ?? "Kepala Desa"}
    nama={profil?.nama_kepala_desa ?? ""}
    image={profil?.tanda_tangan}
    showImage={status === "selesai"}
    tanggal={tanggalSurat}
  />
</LayoutTandaTangan>
    </SuratCanvas>
  );
}