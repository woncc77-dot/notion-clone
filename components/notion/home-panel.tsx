"use client";

import { useMemo } from "react";
import { Clock, Home, Plus } from "lucide-react";
import type { PageSummary } from "@/lib/notion/types";

interface HomePanelProps {
  pages: PageSummary[];
  userEmail?: string | null;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
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

export function HomePanel({
  pages,
  userEmail,
  onSelectPage,
  onAddPage,
}: HomePanelProps) {
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
            <Home className="w-5 h-5" />
            홈
          </h1>
        </div>
      </div>

      <div className="notion-page-content">
        <div className="mt-6 mb-8">
          <h2 className="text-[28px] font-bold text-[#37352f] leading-tight">
            {userEmail ? `${userEmail.split("@")[0]}님, 안녕하세요` : "안녕하세요"}
          </h2>
          <p className="mt-1 text-[rgba(55,53,47,0.45)] text-sm">
            최근 편집한 페이지를 빠르게 열 수 있습니다.
          </p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[rgba(55,53,47,0.45)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            최근 항목
          </h3>
          <button
            type="button"
            onClick={onAddPage}
            className="flex items-center gap-1.5 text-sm text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.08)] px-2 py-1 rounded-[4px]"
          >
            <Plus className="w-4 h-4" />
            새 페이지
          </button>
        </div>

        {recentPages.length === 0 ? (
          <div className="text-center py-12 text-[rgba(55,53,47,0.45)]">
            <p className="text-lg mb-2">아직 페이지가 없습니다</p>
            <button
              type="button"
              onClick={onAddPage}
              className="mt-2 px-4 py-2 text-sm font-medium text-white bg-[#2383e2] rounded hover:bg-[#1a6fc9]"
            >
              첫 페이지 만들기
            </button>
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
