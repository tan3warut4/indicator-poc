import React, { useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Token from "./Token";

// Mock APIs — replace with your real endpoints
async function fetchPositions(q: string) {
  const items = [
    { id: "P_0001", label: "Energy consumption" },
    { id: "P_0002", label: "Labour cost" },
    { id: "P_0003", label: "Water usage" },
  ];
  return items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));
}
async function fetchImpacts(q: string) {
  const items = [
    { id: "I_0001", label: "GHG Scope 1" },
    { id: "I_0002", label: "GHG Scope 2" },
  ];
  return items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));
}

type Props = {
  value?: string;
  onChange?: (html: string) => void;
};

export const FormulaEditor: React.FC<Props> = ({ value, onChange }) => {
  const extensions = useMemo(
    () => [
      StarterKit.configure({ bold: false, italic: false }),
      Token.configure({ fetchPositions, fetchImpacts }),
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: value ?? "",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "minh-140 w-full rounded-xl border bg-white px-4 py-3 focus:outline-none focus:ring-2 ring-blue-300",
      },
    },
  });

  const insert = (s: string) => editor?.chain().focus().insertContent(s).run();

  return (
    <div className="space-y-3">
      <EditorContent editor={editor} />
      <div className="flex flex-wrap gap-2">
        {["(", ")", "%", "&", "+", "-", "×", "÷", "=", "≠", "#NULL"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() =>
              insert(k === "×" ? "*" : k === "÷" ? "/" : k)
            }
            className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
          >
            {k}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Tip: type <b>$</b> to search positions, <b>#</b> to search impact profiles. Press
        Enter to insert as a chip.
      </p>
    </div>
  );
};