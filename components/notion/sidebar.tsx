"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  Plus,
  MoreHorizontal,
  Star,
  Clock,
  Trash2,
  Home,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarPage } from "@/lib/notion/page-tree";

interface SidebarProps {
  pages: SidebarPage[];
  selectedPageId: string | null;
  userEmail?: string | null;
  isHomeView?: boolean;
  isRecentView?: boolean;
  isTrashView?: boolean;
  trashCount?: number;
  onSelectPage: (id: string) => void;
  onAddPage: (parentId?: string) => void;
  onDeletePage: (id: string) => void;
  onOpenSearch: () => void;
  onOpenHome: () => void;
  onOpenRecent: () => void;
  onOpenTrash: () => void;
  onLogout: () => void;
}

export function Sidebar({
  pages,
  selectedPageId,
  userEmail,
  isHomeView = false,
  isRecentView = false,
  isTrashView = false,
  trashCount = 0,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onOpenSearch,
  onOpenHome,
  onOpenRecent,
  onOpenTrash,
  onLogout,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["workspace", "favorites"])
  );
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderPageItem = (page: SidebarPage, depth: number = 0) => {
    const isExpanded = expandedFolders.has(page.id);
    const isSelected = selectedPageId === page.id;
    const isHovered = hoveredItem === page.id;
    const hasChildren = page.children && page.children.length > 0;

    return (
      <div key={page.id}>
        <div
          className={cn(
            "group flex items-center gap-1 pr-2 py-[3px] rounded-[3px] cursor-pointer text-[14px] leading-tight transition-colors",
            isSelected
              ? "bg-[rgba(55,53,47,0.08)] text-[#37352f] font-medium"
              : "hover:bg-[rgba(55,53,47,0.06)] text-[#37352f]",
            depth > 0 && "ml-0"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => onSelectPage(page.id)}
          onMouseEnter={() => setHoveredItem(page.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(page.id);
              }}
              className="p-0.5 hover:bg-sidebar-accent rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-sidebar-foreground/60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-sidebar-foreground/60" />
              )}
            </button>
          ) : (
            <span className="w-4.5 shrink-0" />
          )}

          <span className="text-[16px] leading-none shrink-0 w-5 text-center">{page.icon || "📄"}</span>
          <span className="flex-1 truncate">{page.title || "제목 없음"}</span>

          {isHovered && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void onDeletePage(page.id);
                }}
                className="p-1 hover:bg-sidebar-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="페이지 삭제"
              >
                <Trash2 className="w-3.5 h-3.5 text-sidebar-foreground/60" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void onAddPage(page.id);
                }}
                className="p-1 hover:bg-sidebar-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="하위 페이지 추가"
              >
                <Plus className="w-3.5 h-3.5 text-sidebar-foreground/60" />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-sidebar-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="더보기"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-sidebar-foreground/60" />
              </button>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {page.children!.map((child) => renderPageItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[240px] h-screen bg-[#f7f6f3] flex flex-col shrink-0">
      <div className="p-2">
        <div className="flex items-center justify-between group cursor-pointer hover:bg-[rgba(55,53,47,0.08)] rounded-[4px] px-2 py-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-[22px] h-[22px] bg-[#37352f] rounded-[3px] flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
              N
            </div>
            <span className="font-medium text-[14px] text-[#37352f] truncate">
              내 워크스페이스
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[rgba(55,53,47,0.45)] opacity-0 group-hover:opacity-100 shrink-0" />
        </div>
      </div>

      <div className="px-2 space-y-0.5">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 px-2 py-[5px] text-[14px] text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.08)] rounded-[4px]"
        >
          <Search className="w-4 h-4" />
          <span>검색</span>
          <span className="ml-auto text-[12px] text-[rgba(55,53,47,0.35)]">⌘K</span>
        </button>
        <button
          type="button"
          onClick={onOpenHome}
          className={cn(
            "w-full flex items-center gap-2.5 px-2 py-[5px] text-[14px] rounded-[4px]",
            isHomeView
              ? "bg-[rgba(55,53,47,0.08)] text-[#37352f] font-medium"
              : "text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.08)]"
          )}
        >
          <Home className="w-4 h-4 opacity-70" />
          <span>홈</span>
        </button>
        <button
          type="button"
          onClick={onOpenRecent}
          className={cn(
            "w-full flex items-center gap-2.5 px-2 py-[5px] text-[14px] rounded-[4px]",
            isRecentView
              ? "bg-[rgba(55,53,47,0.08)] text-[#37352f] font-medium"
              : "text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.08)]"
          )}
        >
          <Clock className="w-4 h-4 opacity-70" />
          <span>최근 항목</span>
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-2.5 px-2 py-[5px] text-[14px] text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.08)] rounded-[4px]"
        >
          <Settings className="w-4 h-4 opacity-70" />
          <span>설정</span>
        </button>
      </div>

      <div className="px-2 pt-3 pb-1">
        <div
          className="flex items-center gap-1 px-2 py-0.5 text-[12px] font-medium text-[rgba(55,53,47,0.45)] hover:text-[#37352f] cursor-pointer"
          onClick={() => toggleFolder("favorites")}
        >
          {expandedFolders.has("favorites") ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          <Star className="w-3 h-3" />
          <span>즐겨찾기</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1">
        <div className="flex items-center justify-between px-2 py-0.5 group">
          <div
            className="flex items-center gap-1 text-[12px] font-medium text-[rgba(55,53,47,0.45)] hover:text-[#37352f] cursor-pointer"
            onClick={() => toggleFolder("workspace")}
          >
            {expandedFolders.has("workspace") ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <span>워크스페이스</span>
          </div>
          <button
            type="button"
            onClick={() => void onAddPage()}
            className="p-1 hover:bg-sidebar-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="새 페이지"
          >
            <Plus className="w-3.5 h-3.5 text-sidebar-foreground/60" />
          </button>
        </div>

        {expandedFolders.has("workspace") && (
          <div className="space-y-0.5">
            {pages.map((page) => renderPageItem(page))}
          </div>
        )}
      </div>

      <div className="p-2 mt-auto space-y-0.5">
        {userEmail && (
          <p className="px-2 py-1 text-[12px] text-[rgba(55,53,47,0.45)] truncate">
            {userEmail}
          </p>
        )}
        <button
          type="button"
          onClick={() => void onAddPage()}
          className="w-full flex items-center gap-2.5 px-2 py-[5px] text-[14px] text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.08)] rounded-[4px]"
        >
          <Plus className="w-4 h-4 opacity-70" />
          <span>새 페이지</span>
        </button>
        <button
          type="button"
          onClick={onOpenTrash}
          className={cn(
            "w-full flex items-center gap-2.5 px-2 py-[5px] text-[14px] rounded-[4px]",
            isTrashView
              ? "bg-[rgba(55,53,47,0.08)] text-[#37352f] font-medium"
              : "text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.08)]"
          )}
        >
          <Trash2 className="w-4 h-4 opacity-70" />
          <span>휴지통</span>
          {trashCount > 0 && (
            <span className="ml-auto text-[11px] text-[rgba(55,53,47,0.45)] bg-[rgba(55,53,47,0.08)] px-1.5 py-0.5 rounded">
              {trashCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="w-full flex items-center gap-2.5 px-2 py-[5px] text-[14px] text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.08)] rounded-[4px]"
        >
          <LogOut className="w-4 h-4" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}
