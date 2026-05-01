"use client";

import { useEffect, useMemo, useRef } from "react";

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function ToolbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="rounded border border-gold/35 px-2 py-1 text-[11px] text-gold hover:bg-gold/10"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Write here...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isEmpty = useMemo(() => {
    const text = value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    return text.length === 0;
  }, [value]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  function runCommand(command: string, commandValue?: string) {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current.innerHTML);
  }

  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className="rounded border border-gold/35 bg-black/20 p-2">
        <div className="mb-2 flex flex-wrap gap-1">
          <ToolbarButton label="Bold" onClick={() => runCommand("bold")} />
          <ToolbarButton label="Italic" onClick={() => runCommand("italic")} />
          <ToolbarButton label="H3" onClick={() => runCommand("formatBlock", "h3")} />
          <ToolbarButton label="Bullets" onClick={() => runCommand("insertUnorderedList")} />
          <ToolbarButton label="Numbers" onClick={() => runCommand("insertOrderedList")} />
          <ToolbarButton label="Clear" onClick={() => runCommand("removeFormat")} />
        </div>
        <div className="relative">
          {isEmpty ? (
            <p className="pointer-events-none absolute left-3 top-2 text-sm text-muted/80">{placeholder}</p>
          ) : null}
          <div
            ref={editorRef}
            contentEditable
            className="min-h-32 rounded border border-gold/25 bg-black/35 p-3 text-sm text-foreground outline-none"
            onInput={() => onChange(editorRef.current?.innerHTML || "")}
          />
        </div>
      </div>
    </div>
  );
}
