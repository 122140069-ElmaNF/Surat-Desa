"use client";

import { Editor } from "@tiptap/react";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  ImagePlus,
} from "lucide-react";

type Props = {
  editor: Editor | null;
  onSave: () => void;
};

export default function Toolbar({
  editor,
  onSave,
}: Props) {
  if (!editor) return null;

  const buttonStyle = (
    active = false
  ): React.CSSProperties => ({
    width: 40,
    height: 40,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: active ? "#dbeafe" : "#fff",
    color: active ? "#2563eb" : "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: ".2s",
  });

  const actionButton: React.CSSProperties = {
    height: 40,
    padding: "0 18px",
    border: "none",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        padding: 16,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* Undo */}
      <button
        type="button"
        style={buttonStyle()}
        onClick={() =>
          editor.chain().focus().undo().run()
        }
      >
        <Undo2 size={18} />
      </button>

      {/* Redo */}
      <button
        type="button"
        style={buttonStyle()}
        onClick={() =>
          editor.chain().focus().redo().run()
        }
      >
        <Redo2 size={18} />
      </button>

      {/* Bold */}
      <button
        type="button"
        style={buttonStyle(
          editor.isActive("bold")
        )}
        onClick={() =>
          editor.chain().focus().toggleBold().run()
        }
      >
        <Bold size={18} />
      </button>

      {/* Italic */}
      <button
        type="button"
        style={buttonStyle(
          editor.isActive("italic")
        )}
        onClick={() =>
          editor.chain().focus().toggleItalic().run()
        }
      >
        <Italic size={18} />
      </button>

      {/* Underline */}
      <button
        type="button"
        style={buttonStyle(
          editor.isActive("underline")
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleUnderline()
            .run()
        }
      >
        <UnderlineIcon size={18} />
      </button>

      {/* Align Left */}
      <button
        type="button"
        style={buttonStyle(
          editor.isActive({
            textAlign: "left",
          })
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign("left")
            .run()
        }
      >
        <AlignLeft size={18} />
      </button>

      {/* Align Center */}
      <button
        type="button"
        style={buttonStyle(
          editor.isActive({
            textAlign: "center",
          })
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign("center")
            .run()
        }
      >
        <AlignCenter size={18} />
      </button>

      {/* Align Right */}
      <button
        type="button"
        style={buttonStyle(
          editor.isActive({
            textAlign: "right",
          })
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign("right")
            .run()
        }
      >
        <AlignRight size={18} />
      </button>

      {/* Bullet */}
      <button
        type="button"
        style={buttonStyle(
          editor.isActive("bulletList")
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBulletList()
            .run()
        }
      >
        <List size={18} />
      </button>

      {/* Numbering */}
      <button
        type="button"
        style={buttonStyle(
          editor.isActive("orderedList")
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleOrderedList()
            .run()
        }
      >
        <ListOrdered size={18} />
      </button>

      {/* Insert Image */}
      <button
        type="button"
        style={buttonStyle()}
        onClick={() => {
          const url = window.prompt(
            "Masukkan URL gambar"
          );

          if (!url) return;

          editor
            .chain()
            .focus()
            .setImage({
              src: url,
            })
            .run();
        }}
      >
        <ImagePlus size={18} />
      </button>

      <div
        style={{
          flex: 1,
        }}
      />

      {/* Simpan */}
      <button
        type="button"
        onClick={onSave}
        style={actionButton}
      >
        💾 Simpan
      </button>

      {/* Print */}
      <button
        type="button"
        onClick={() => window.print()}
        style={{
          ...actionButton,
          background: "#16a34a",
        }}
      >
        🖨 Print
      </button>
    </div>
  );
}