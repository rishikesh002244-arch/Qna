"use client";

import dynamic from "next/dynamic";
import React from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

interface RTEProps {
  value?: string;
  onChange?: (value?: string) => void;
}

const RTE = ({ value = "", onChange }: RTEProps) => {
  return (
    <div className="w-full text-slate-900" data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={onChange}
        height={300}
        preview="live"
        aria-label="Rich Text Editor"
      />
    </div>
  );
};

export default RTE;
