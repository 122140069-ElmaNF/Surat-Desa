import StarterKit from "@tiptap/starter-kit";

import Underline from "@tiptap/extension-underline";

import TextAlign from "@tiptap/extension-text-align";

import Image from "@tiptap/extension-image";

import { Table } from "@tiptap/extension-table";

import TableRow from "@tiptap/extension-table-row";

import TableCell from "@tiptap/extension-table-cell";

import TableHeader from "@tiptap/extension-table-header";

import { TextStyle } from "@tiptap/extension-text-style";

import Color from "@tiptap/extension-color";

import FontFamily from "@tiptap/extension-font-family";

import HardBreak from "@tiptap/extension-hard-break";

export const editorExtensions = [

  StarterKit.configure({

    hardBreak: false,

  }),

  Underline,

  TextStyle,

  Color,

  FontFamily,

  HardBreak,

  Image,

  Table.configure({

    resizable: true,

  }),

  TableRow,

  TableCell,

  TableHeader,

  TextAlign.configure({

    types: [

      "heading",

      "paragraph",

    ],

  }),

];