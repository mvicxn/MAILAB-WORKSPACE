"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Relato({ texto }: { texto: string }) {
  if (!texto.trim()) {
    return null;
  }
  return (
    <div className="relato">
      <Markdown remarkPlugins={[remarkGfm]}>{texto}</Markdown>
    </div>
  );
}
