"use client";

import { useState } from "react";
import {
  Image,
  MoreHorizontal,
  MessageSquare,
  Star,
  Clock,
  ChevronRight,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditableBlock } from "@/components/notion/editable-block";
import type { Block } from "@/lib/notion/types";

interface PageEditorProps {
  pageId: string;
  title: string;
  icon: string;
  coverImage?: string;
  blocks: Block[];
  isDirty?: boolean;
  isSaving?: boolean;
  onTitleChange: (title: string) => void;
  onIconChange: (icon: string) => void;
  onBlocksChange: (blocks: Block[]) => void;
  onSave?: () => void;
}

export function PageEditor({
  title,
  icon,
  coverImage,
  blocks,
  isDirty = false,
  isSaving = false,
  onTitleChange,
  onIconChange,
  onBlocksChange,
  onSave,
}: PageEditorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);
  const [breadcrumbs] = useState(["내 워크스페이스"]);

  const commonIcons = [
    "📄",
    "📝",
    "📋",
    "📌",
    "📎",
    "📁",
    "🗂️",
    "💡",
    "🎯",
    "🚀",
    "⭐",
    "❤️",
    "🔥",
    "💪",
    "✨",
    "🎨",
    "🎬",
    "🎵",
    "📚",
    "📖",
    "✏️",
    "🖊️",
    "💻",
    "🔧",
    "⚙️",
    "🛠️",
    "📊",
    "📈",
    "🗓️",
    "⏰",
    "🏠",
    "🌟",
  ];

  const handleBlockChange = (blockId: string, content: string) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, content } : block
    );
    onBlocksChange(newBlocks);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    blockId: string,
    blockIndex: number
  ) => {
    const text = e.currentTarget.textContent ?? "";

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        type: "paragraph",
        content: "",
      };
      const newBlocks = [...blocks];
      newBlocks.splice(blockIndex + 1, 0, newBlock);
      onBlocksChange(newBlocks);

      setTimeout(() => {
        const element = document.querySelector(
          `[data-block-id="${newBlock.id}"]`
        ) as HTMLElement;
        element?.focus();
      }, 0);
    }

    if (e.key === "Backspace" && text === "" && blocks.length > 1) {
      e.preventDefault();
      const newBlocks = blocks.filter((block) => block.id !== blockId);
      onBlocksChange(newBlocks);

      setTimeout(() => {
        const prevBlock = newBlocks[Math.max(0, blockIndex - 1)];
        const element = document.querySelector(
          `[data-block-id="${prevBlock.id}"]`
        ) as HTMLElement;
        element?.focus();
      }, 0);
    }

    if (e.key === "/" && text === "") {
      setShowSlashMenu(true);
      setSlashMenuBlockId(blockId);
    }
  };

  const handleSlashCommand = (
    blockId: string,
    type: Block["type"]
  ) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, type, content: "" } : block
    );
    onBlocksChange(newBlocks);
    setShowSlashMenu(false);
    setSlashMenuBlockId(null);
  };

  const toggleTodo = (blockId: string) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, checked: !block.checked } : block
    );
    onBlocksChange(newBlocks);
  };

  const renderBlock = (block: Block, index: number) => {
    const baseClasses =
      "w-full outline-none resize-none bg-transparent text-[#37352f] leading-[1.5] min-h-[1.5em]";

    const getBlockClasses = () => {
      switch (block.type) {
        case "heading1":
          return "text-[1.875em] font-semibold mt-[2em] mb-[4px] leading-[1.3]";
        case "heading2":
          return "text-[1.5em] font-semibold mt-[1.4em] mb-[1px] leading-[1.3]";
        case "heading3":
          return "text-[1.25em] font-semibold mt-[1em] mb-[1px] leading-[1.3]";
        case "quote":
          return "border-l-[3px] border-[#37352f]/20 pl-4 text-[#37352f]/80";
        case "callout":
          return "bg-[#f7f6f3] rounded px-3 py-2";
        default:
          return "text-base";
      }
    };

    return (
      <div key={block.id} className="notion-block-row group">
        <div className="notion-block-controls">
          <button
            type="button"
            className="p-0.5 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.45)]"
            aria-label="블록 드래그"
          >
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 10 10">
              <path d="M3,2 C3,2.55 2.55,3 2,3 C1.45,3 1,2.55 1,2 C1,1.45 1.45,1 2,1 C2.55,1 3,1.45 3,2 Z M3,5 C3,5.55 2.55,6 2,6 C1.45,6 1,5.55 1,5 C1,4.45 1.45,4 2,4 C2.55,4 3,4.45 3,5 Z M3,8 C3,8.55 2.55,9 2,9 C1.45,9 1,8.55 1,8 C1,7.45 1.45,7 2,7 C2.55,7 3,7.45 3,8 Z M6,2 C6,2.55 5.55,3 5,3 C4.45,3 4,2.55 4,2 C4,1.45 4.45,1 5,1 C5.55,1 6,1.45 6,2 Z M6,5 C6,5.55 5.55,6 5,6 C4.45,6 4,5.55 4,5 C4,4.45 4.45,4 5,4 C5.55,4 6,4.45 6,5 Z M6,8 C6,8.55 5.55,9 5,9 C4.45,9 4,8.55 4,8 C4,7.45 4.45,7 5,7 C5.55,7 6,7.45 6,8 Z" />
            </svg>
          </button>
          <button
            type="button"
            className="p-0.5 rounded hover:bg-[rgba(55,53,47,0.08)] text-[rgba(55,53,47,0.45)]"
            aria-label="블록 추가"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        <div className="min-w-0 pl-0.5">
          {block.type === "todo" ? (
            <div className="flex items-start gap-2">
              <button
                onClick={() => toggleTodo(block.id)}
                className={cn(
                  "mt-1 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                  block.checked
                    ? "bg-[#2383e2] border-[#2383e2] text-white"
                    : "border-[rgba(55,53,47,0.3)]"
                )}
              >
                {block.checked && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <EditableBlock
                blockId={block.id}
                initialContent={block.content}
                className={cn(
                  baseClasses,
                  block.checked && "line-through text-muted-foreground"
                )}
                onChange={(content) => handleBlockChange(block.id, content)}
                onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              />
            </div>
          ) : block.type === "bullet" ? (
            <div className="flex items-start gap-2">
              <span className="mt-[9px] w-[6px] h-[6px] rounded-full bg-[#37352f] flex-shrink-0" />
              <EditableBlock
                blockId={block.id}
                initialContent={block.content}
                className={baseClasses}
                onChange={(content) => handleBlockChange(block.id, content)}
                onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              />
            </div>
          ) : block.type === "numbered" ? (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-foreground flex-shrink-0 w-5">
                {index + 1}.
              </span>
              <EditableBlock
                blockId={block.id}
                initialContent={block.content}
                className={baseClasses}
                onChange={(content) => handleBlockChange(block.id, content)}
                onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              />
            </div>
          ) : block.type === "divider" ? (
            <hr className="my-3 border-border" />
          ) : (
            <EditableBlock
              blockId={block.id}
              initialContent={block.content}
              placeholder="'/'를 입력하여 명령어를 사용하거나, 텍스트를 입력하세요..."
              className={cn(baseClasses, getBlockClasses())}
              onChange={(content) => handleBlockChange(block.id, content)}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
            />
          )}

          {/* Slash Menu */}
          {showSlashMenu && slashMenuBlockId === block.id && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-[rgba(55,53,47,0.09)] rounded-md shadow-[0_0_0_1px_rgba(15,15,15,0.05),0_3px_6px_rgba(15,15,15,0.1),0_9px_24px_rgba(15,15,15,0.2)] z-50 overflow-hidden">
              <div className="px-3 py-2 text-xs text-[rgba(55,53,47,0.45)]">
                기본 블록
              </div>
              <div className="py-1 max-h-80 overflow-y-auto">
                {[
                  { type: "paragraph" as const, icon: "Aa", label: "텍스트", desc: "일반 텍스트 작성" },
                  { type: "heading1" as const, icon: "H1", label: "제목 1", desc: "큰 제목" },
                  { type: "heading2" as const, icon: "H2", label: "제목 2", desc: "중간 제목" },
                  { type: "heading3" as const, icon: "H3", label: "제목 3", desc: "작은 제목" },
                  { type: "bullet" as const, icon: "•", label: "글머리 기호 목록", desc: "간단한 목록" },
                  { type: "numbered" as const, icon: "1.", label: "번호 매기기 목록", desc: "번호가 있는 목록" },
                  { type: "todo" as const, icon: "☐", label: "할 일 목록", desc: "체크박스가 있는 목록" },
                  { type: "quote" as const, icon: "❝", label: "인용", desc: "인용문 작성" },
                  { type: "divider" as const, icon: "—", label: "구분선", desc: "콘텐츠 구분" },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleSlashCommand(block.id, item.type)}
                    className="w-full flex items-center gap-3 px-2 py-1.5 mx-1 rounded hover:bg-[rgba(55,53,47,0.08)] text-left"
                  >
                    <span className="w-10 h-10 bg-[#f7f6f3] border border-[rgba(55,53,47,0.09)] rounded flex items-center justify-center text-sm text-[#37352f]">
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-sm text-[#37352f]">{item.label}</div>
                      <div className="text-xs text-[rgba(55,53,47,0.45)]">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="notion-page-shell flex-1 min-w-0 h-screen overflow-y-auto bg-white">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="notion-topbar flex items-center justify-between py-1.5">
          <div className="flex items-center gap-0.5 text-sm text-[rgba(55,53,47,0.65)] min-w-0 truncate">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-0.5 shrink-0">
                {i > 0 && <ChevronRight className="w-3 h-3 opacity-50" />}
                <span className="hover:bg-[rgba(55,53,47,0.08)] rounded px-1 py-0.5 cursor-pointer truncate">
                  {crumb}
                </span>
              </span>
            ))}
            <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
            <span className="flex items-center gap-1 text-[#37352f] truncate">
              <span className="text-base leading-none">{icon}</span>
              <span className="truncate">{title || "제목 없음"}</span>
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button type="button" className="p-1.5 hover:bg-[rgba(55,53,47,0.08)] rounded text-[rgba(55,53,47,0.45)]">
              <Clock className="w-4 h-4" />
            </button>
            <button type="button" className="p-1.5 hover:bg-[rgba(55,53,47,0.08)] rounded text-[rgba(55,53,47,0.45)]">
              <Star className="w-4 h-4" />
            </button>
            <button type="button" className="p-1.5 hover:bg-[rgba(55,53,47,0.08)] rounded text-[rgba(55,53,47,0.45)]">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button type="button" className="p-1.5 hover:bg-[rgba(55,53,47,0.08)] rounded text-[rgba(55,53,47,0.45)]">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving || !isDirty}
                className="ml-1 px-2.5 py-1 text-sm text-[#37352f] rounded hover:bg-[rgba(55,53,47,0.08)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? "저장 중..." : isDirty ? "저장" : "저장됨"}
              </button>
            )}
            <button
              type="button"
              className="ml-1 px-3 py-1 text-sm font-medium text-white bg-[#2383e2] rounded hover:bg-[#1a6fc9]"
            >
              공유
            </button>
          </div>
        </div>
      </div>

      <div className="notion-page-content">
        {/* Cover Image Area */}
        {coverImage && (
          <div className="relative h-[30vh] min-h-[120px] max-h-[280px] -mx-[var(--notion-page-padding-x)] mb-6 w-[calc(100%+var(--notion-page-padding-x)*2)] group">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <button className="absolute bottom-3 right-3 px-3 py-1.5 bg-background/80 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
              커버 변경
            </button>
          </div>
        )}

        {/* Icon and Title */}
        <div className="mb-2 mt-8">
          <div className="group mb-1">
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="text-[78px] leading-none hover:opacity-80 transition-opacity"
              >
                {icon}
              </button>

              {showIconPicker && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-[rgba(55,53,47,0.09)] rounded-md shadow-[0_9px_24px_rgba(15,15,15,0.2)] z-50 p-3">
                  <div className="text-xs text-[rgba(55,53,47,0.45)] mb-2">
                    아이콘 선택
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {commonIcons.map((emoji, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          onIconChange(emoji);
                          setShowIconPicker(false);
                        }}
                        className="w-8 h-8 text-xl hover:bg-[rgba(55,53,47,0.08)] rounded flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!coverImage && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-[rgba(55,53,47,0.45)] hover:bg-[rgba(55,53,47,0.08)] px-2 py-0.5 rounded"
                >
                  <Smile className="w-3.5 h-3.5" />
                  아이콘 변경
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-[rgba(55,53,47,0.45)] hover:bg-[rgba(55,53,47,0.08)] px-2 py-0.5 rounded"
                >
                  <Image className="w-3.5 h-3.5" />
                  커버 추가
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="제목 없음"
            className="w-full text-[40px] font-bold leading-tight bg-transparent outline-none text-[#37352f] placeholder:text-[rgba(55,53,47,0.35)]"
          />
        </div>

        <div className="py-1">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>
      </div>
    </div>
  );
}
