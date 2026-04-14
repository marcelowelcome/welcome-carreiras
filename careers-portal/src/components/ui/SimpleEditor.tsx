"use client";

import { useRef, useCallback } from "react";
import { Bold, Italic, List, Link, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleEditorProps {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
}

export function SimpleEditor({
  name,
  label,
  required,
  defaultValue = "",
  error,
}: SimpleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLTextAreaElement>(null);

  const syncHidden = useCallback(() => {
    if (hiddenRef.current && editorRef.current) {
      hiddenRef.current.value = editorRef.current.innerHTML;
    }
  }, []);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    syncHidden();
  }

  function handleLink() {
    const url = prompt("URL do link:");
    if (url) exec("createLink", url);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-error">*</span>}
      </label>

      {/* Toolbar */}
      <div className="mt-1 flex items-center gap-1 rounded-t-lg border border-b-0 border-border bg-gray-50 px-2 py-1.5">
        <ToolbarButton onClick={() => exec("bold")} title="Negrito">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} title="Italico">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Lista">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} title="Lista numerada">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton onClick={handleLink} title="Inserir link">
          <Link className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "min-h-[150px] rounded-b-lg border border-border bg-white px-3 py-2.5 text-sm text-primary",
          "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
          "prose prose-sm max-w-none prose-li:marker:text-accent"
        )}
        dangerouslySetInnerHTML={{ __html: defaultValue }}
        onInput={syncHidden}
        onBlur={syncHidden}
      />

      {/* Hidden field for form submission */}
      <textarea
        ref={hiddenRef}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="hidden"
        aria-hidden="true"
      />

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded p-1.5 text-muted transition-colors hover:bg-white hover:text-primary"
    >
      {children}
    </button>
  );
}
