"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type EditableBlockProps = {
  blockId: string;
  initialContent: string;
  className?: string;
  placeholder?: string;
  onChange: (content: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
};

/** contentEditable with React children breaks typing; sync DOM only when blockId changes. */
export function EditableBlock({
  blockId,
  initialContent,
  className,
  placeholder,
  onChange,
  onKeyDown,
}: EditableBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.textContent !== initialContent) {
      el.textContent = initialContent;
    }
  }, [blockId, initialContent]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-block-id={blockId}
      data-placeholder={placeholder}
      className={cn(
        className,
        placeholder &&
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
      )}
      onInput={(e) => onChange(e.currentTarget.textContent ?? "")}
      onKeyDown={onKeyDown}
    />
  );
}
