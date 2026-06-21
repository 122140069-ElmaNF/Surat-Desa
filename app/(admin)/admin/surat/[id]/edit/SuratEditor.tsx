"use client";

import { useMemo } from "react";
import {
  useEditor,
  EditorContent,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";

import Toolbar from "./Toolbar";

type Props = {
  suratId: number;
  content: string;
  useKop: boolean;
};

export default function SuratEditor({
  suratId,
  content,
  useKop,
}: Props) {
  const initialContent = useMemo(() => {
    return `
      ${
        useKop
          ? `
          <div style="text-align:center; margin-bottom:24px;">
            <h3 style="margin:0;">
              PEMERINTAH DESA SUMBEREJO
            </h3>

            <div>
              Kecamatan Way Jepara
            </div>

            <div>
              Kabupaten Lampung Timur
            </div>

            <hr
              style="
                border:1px solid black;
                margin-top:15px;
              "
            />
          </div>
        `
          : ""
      }

      ${content}
    `;
  }, [content, useKop]);

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,

      Underline,

      Image,

      TextAlign.configure({
        types: [
          "heading",
          "paragraph",
        ],
      }),
    ],

    content: initialContent,

    editorProps: {
      attributes: {
        class: "surat-editor-content",
      },
    },
  });

  if (!editor) {
    return (
      <div style={{ padding: 30 }}>
        Memuat editor...
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const html = editor.getHTML();

    console.log("ID Surat:", suratId);
    console.log("Isi Surat:", html);

    alert(
      "Fitur simpan ke database akan dibuat selanjutnya."
    );
  };

  return (
    <div
      style={{
        background: "#f3f4f6",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Toolbar editor={editor} />

      <div
        style={{
          padding: "30px",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            width: "210mm",
            minHeight: "297mm",
            background: "white",
            margin: "0 auto",
            padding: "50px 60px",
            borderRadius: "8px",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #e5e7eb",
          background: "#fff",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={handlePrint}
          style={buttonStyle}
        >
          Cetak
        </button>

        <button
          type="button"
          onClick={handleSave}
          style={saveButtonStyle}
        >
          Simpan
        </button>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const saveButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#2563eb",
  color: "white",
  border: "none",
};