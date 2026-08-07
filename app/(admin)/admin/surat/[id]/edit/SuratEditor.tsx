"use client";

import { useEffect } from "react";
import { useEditor } from "@tiptap/react";

import { editorExtensions } from "./extensions";

import SuratPaper from "@/app/components/surat/SuratPaper";
import SuratTemplate from "@/app/components/surat/templates/SuratTemplate";

import "./editor.css";

type Profil = {
  nama_kepala_desa: string;
  jabatan: string;
  tanda_tangan: string;
};

type Props = {
  suratId: number;
  content: string;
  useKop: boolean;

  status: string;
  tanggalSurat?: string;

  profil: Profil | null;

  kodeSurat: string;
};

export default function SuratEditor({
  content,
  useKop,
  status,
  tanggalSurat,
  profil,
  kodeSurat,
}: Props) {

  const editor = useEditor({
    immediatelyRender: false,

    editable: false,

    extensions: editorExtensions,

    content,

    editorProps: {
      attributes: {
        class: "surat-editor",
      },
    },
  });

  useEffect(() => {

    if (!editor) return;

    if (editor.getHTML() !== content) {

      editor.commands.setContent(content);

    }

  }, [editor, content]);

  if (!editor) {

    return (
      <div
        style={{
          padding: 30,
        }}
      >
        Memuat Preview...
      </div>
    );

  }

  return (
    <div className="editor-wrapper">

      <SuratPaper>

        <SuratTemplate
          kodeSurat={kodeSurat}
          content={content}
          useKop={useKop}
          status={status}
          profil={profil}
          tanggalSurat={tanggalSurat}
          editable={false}
          editor={editor}
        />

      </SuratPaper>

    </div>
  );
}