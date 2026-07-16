"use client";

import { useEffect } from "react";
import {
  useEditor,
  EditorContent,
} from "@tiptap/react";

import { editorExtensions } from "./extensions";
import Toolbar from "./Toolbar";
import SuratCanvas from "@/app/components/surat/SuratCanvas";
import SuratPaper from "@/app/components/surat/SuratPaper";
import DomisiliTemplate from "@/app/components/surat/templates/DomisiliTemplate";

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
};

export default function SuratEditor({
  suratId,
  content,
  useKop,
  status,
  tanggalSurat,
  profil,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
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
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);
  async function handleSave() {
    if (!editor) return;
    const html = editor.getHTML();
    const res = await fetch(
      `/api/admin/surat/${suratId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isi_surat: html,
        }),
      }
    );

    const json = await res.json();
    if (json.success) {
      alert("Surat berhasil disimpan.");
    } else {
      alert("Gagal menyimpan.");
    }
  }

  if (!editor) {
    return (
      <div
        style={{
          padding: 30,
        }}
      >
        Memuat editor...
      </div>
    );
  }

  return (
    <div className="editor-wrapper">

<Toolbar
    editor={editor}
    onSave={handleSave}
/>
<SuratPaper>
  <DomisiliTemplate
    content={content}
    useKop={useKop}
    status={status}
    profil={profil}
    tanggalSurat={tanggalSurat}
    editable
    editor={editor}
  />
</SuratPaper>

    </div>
  );
}