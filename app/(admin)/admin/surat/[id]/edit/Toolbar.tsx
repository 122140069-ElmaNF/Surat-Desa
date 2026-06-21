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
  Printer,
} from "lucide-react";

type Props = {
  editor: Editor | null;
};

export default function Toolbar({
  editor,
}: Props) {
  if (!editor) {
    return null;
  }

  const buttonStyle = (
    active = false
  ): React.CSSProperties => ({
    width: "40px",
    height: "40px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    background: active
      ? "#dbeafe"
      : "white",
    color: active
      ? "#2563eb"
      : "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        padding: "16px",
        background: "white",
        borderBottom:
          "1px solid #e5e7eb",
      }}
    >
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().undo().run()
        }
        style={buttonStyle()}
      >
        <Undo2 size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().redo().run()
        }
        style={buttonStyle()}
      >
        <Redo2 size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleBold().run()
        }
        style={buttonStyle(
          editor.isActive("bold")
        )}
      >
        <Bold size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleItalic().run()
        }
        style={buttonStyle(
          editor.isActive("italic")
        )}
      >
        <Italic size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleUnderline()
            .run()
        }
        style={buttonStyle(
          editor.isActive(
            "underline"
          )
        )}
      >
        <UnderlineIcon size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign(
              "left"
            )
            .run()
        }
        style={buttonStyle()}
      >
        <AlignLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign(
              "center"
            )
            .run()
        }
        style={buttonStyle()}
      >
        <AlignCenter size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign(
              "right"
            )
            .run()
        }
        style={buttonStyle()}
      >
        <AlignRight size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBulletList()
            .run()
        }
        style={buttonStyle(
          editor.isActive(
            "bulletList"
          )
        )}
      >
        <List size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleOrderedList()
            .run()
        }
        style={buttonStyle(
          editor.isActive(
            "orderedList"
          )
        )}
      >
        <ListOrdered size={18} />
      </button>

      <button
        type="button"
        onClick={() => {
          const url =
            window.prompt(
              "Masukkan URL gambar:"
            );

          if (!url) {
            return;
          }

          editor
            .chain()
            .focus()
            .setImage({
              src: url,
            })
            .run();
        }}
        style={buttonStyle()}
      >
        <ImagePlus size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          window.print()
        }
        style={buttonStyle()}
      >
        <Printer size={18} />
      </button>
    </div>
  );
}