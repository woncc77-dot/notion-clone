"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PageSummary } from "@/lib/notion/types";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pages: PageSummary[];
  onSelectPage: (id: string) => void;
}

export function SearchDialog({
  open,
  onOpenChange,
  pages,
  onSelectPage,
}: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...pages].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    if (!q) return sorted.slice(0, 20);
    return sorted.filter((p) =>
      (p.title || "제목 없음").toLowerCase().includes(q)
    );
  }, [pages, query]);

  const handleSelect = (id: string) => {
    onSelectPage(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[560px] p-0 gap-0 overflow-hidden border-[rgba(55,53,47,0.09)] shadow-[0_0_0_1px_rgba(15,15,15,0.05),0_3px_6px_rgba(15,15,15,0.1),0_9px_24px_rgba(15,15,15,0.2)]"
      >
        <DialogTitle className="sr-only">페이지 검색</DialogTitle>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(55,53,47,0.09)]">
          <Search className="w-4 h-4 shrink-0 text-[rgba(55,53,47,0.45)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="페이지 검색..."
            className="flex-1 bg-transparent outline-none text-[15px] text-[#37352f] placeholder:text-[rgba(55,53,47,0.35)]"
          />
          <kbd className="hidden sm:inline text-[11px] text-[rgba(55,53,47,0.35)] bg-[#f7f6f3] px-1.5 py-0.5 rounded border border-[rgba(55,53,47,0.09)]">
            ESC
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[rgba(55,53,47,0.45)]">
              {query.trim() ? "검색 결과가 없습니다" : "페이지가 없습니다"}
            </p>
          ) : (
            <ul>
              {!query.trim() && (
                <li className="px-4 py-1.5 text-xs text-[rgba(55,53,47,0.45)]">
                  최근 페이지
                </li>
              )}
              {results.map((page) => (
                <li key={page.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(page.id)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[rgba(55,53,47,0.08)] text-left"
                  >
                    <span className="text-lg leading-none shrink-0">
                      {page.icon ?? "📄"}
                    </span>
                    <span className="flex-1 truncate text-[15px] text-[#37352f]">
                      {page.title || "제목 없음"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
