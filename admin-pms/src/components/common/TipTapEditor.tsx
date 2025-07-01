"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect } from "react";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
interface TiptapEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function TiptapEditor({
  value,
  onChange,
  placeholder,
  style,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false, // hoặc true tùy mục đích
      }),
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Đồng bộ lại value từ ngoài nếu cần
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value]);

  return (
    <div style={{ backgroundColor: "#f1f1f1", padding: 10 }}>
      {/* Toolbar */}
      <div style={{ marginBottom: 10 }}>
        {editor && (
          <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-2 rounded-md shadow-sm">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="px-2 py-1 rounded hover:bg-gray-300 font-bold">
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="px-2 py-1 rounded hover:bg-gray-300 italic">
              I
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className="px-2 py-1 rounded hover:bg-gray-300 underline">
              U
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className="px-2 py-1 rounded hover:bg-gray-300 line-through">
              S
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className="px-2 py-1 rounded bg-yellow-200 hover:bg-yellow-300">
              Highlight
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className="px-2 py-1 rounded hover:bg-gray-300">
              ⬅
            </button>
            <button
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className="px-2 py-1 rounded hover:bg-gray-300">
              ⬍
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className="px-2 py-1 rounded hover:bg-gray-300">
              ➡
            </button>
            <button
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleLink({ href: "https://github.com", target: "_blank" })
                  .run()
              }
              className="px-2 py-1 rounded hover:bg-blue-100 text-blue-600 underline">
              🔗 Link
            </button>
          </div>
        )}
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        style={{ minHeight: 150, backgroundColor: "#fff", padding: 10 }}
      />
    </div>
  );
}
