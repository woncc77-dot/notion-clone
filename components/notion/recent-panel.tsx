"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import type { PageSummary } from "@/lib/notion/types";

interface RecentPanelProps {
  pages: PageSummary[];
  onSelectPage: (id: string) => void;
}

function formatUpdatedAt(value: string) {
  try {
    return new Date(value).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function RecentPanel({ pages, onSelectPage }: RecentPanelProps) {
  const recentPages = useMemo(
    () =>
      [...pages].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [pages]
  );

  return (
    <div className="notion-page-shell flex-1 min-w-0 h-screen overflow-y-auto bg-white">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="notion-topbar flex items-center py-2">
          <h1 className="text-lg font-semibold text-[#37352f] flex items-center gap-2">
            <Clock className="w-5 h-5" />
            최근 항목
          </h1>
        </div>
      </div>

      <div className="notion-page-content">
        <p className="mt-6 mb-6 text-sm text-[rgba(55,53,47,0.45)]">
          최근에 수정한 페이지입니다.
        </p>

        {recentPages.length === 0 ? (
          <div className="text-center py-16 text-[rgba(55,53,47,0.45)]">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">최근 항목이 없습니다</p>
            <p className="text-sm mt-2">
              페이지를 편집하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {recentPages.map((page) => (
              <li key={page.id}>
                <button
                  type="button"
                  onClick={() => onSelectPage(page.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] hover:bg-[rgba(55,53,47,0.08)] text-left"
                >
                  <span className="text-xl shrink-0 leading-none">
                    {page.icon ?? "📄"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#37352f] truncate">
                      {page.title || "제목 없음"}
                    </p>
                    <p className="text-xs text-[rgba(55,53,47,0.45)]">
                      {formatUpdatedAt(page.updatedAt)}에 수정됨
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
