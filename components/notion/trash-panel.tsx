"use client";

import { useState } from "react";
import { Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { PageSummary } from "@/lib/notion/types";

interface TrashPanelProps {
  pages: PageSummary[];
  onBack: () => void;
  onEmptyTrash: () => Promise<void>;
  isEmptying?: boolean;
}

function formatDeletedAt(value: string | null | undefined) {
  if (!value) return "";
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

export function TrashPanel({
  pages,
  onBack,
  onEmptyTrash,
  isEmptying = false,
}: TrashPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="notion-page-shell flex-1 min-w-0 h-screen overflow-y-auto bg-white">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
        <div className="notion-topbar flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 hover:bg-[rgba(55,53,47,0.08)] rounded text-[rgba(55,53,47,0.45)]"
              aria-label="워크스페이스로 돌아가기"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[#37352f] flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                휴지통
              </h1>
              <p className="text-sm text-[rgba(55,53,47,0.45)]">
                {pages.length}개의 삭제된 페이지
              </p>
            </div>
          </div>

          {pages.length > 0 && (
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isEmptying}>
                  {isEmptying ? "비우는 중..." : "휴지통 비우기"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>휴지통을 비울까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    휴지통에 있는 {pages.length}개의 페이지가 영구 삭제됩니다.
                    이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      void onEmptyTrash().then(() => setOpen(false));
                    }}
                  >
                    영구 삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="notion-page-content">
        {pages.length === 0 ? (
          <div className="text-center py-16 text-[rgba(55,53,47,0.45)]">
            <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">휴지통이 비어 있습니다</p>
            <p className="text-sm mt-2">
              삭제한 페이지가 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {pages.map((page) => (
              <li
                key={page.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[4px] hover:bg-[rgba(55,53,47,0.08)]"
              >
                <span className="text-xl shrink-0">{page.icon ?? "📄"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {page.title || "제목 없음"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    삭제됨 · {formatDeletedAt(page.deletedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
