"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { PageEditor } from "./page-editor";
import { TrashPanel } from "./trash-panel";
import { HomePanel } from "./home-panel";
import { RecentPanel } from "./recent-panel";
import { SearchDialog } from "./search-dialog";
import type { Block, PageDetail, PageSummary } from "@/lib/notion/types";
import { defaultBlocks } from "@/lib/notion/types";
import { buildPageTree } from "@/lib/notion/page-tree";
import {
  createPage,
  deletePage as deletePageApi,
  emptyTrash as emptyTrashApi,
  fetchCurrentUser,
  fetchPage,
  fetchPages,
  fetchTrashedPages,
  logout,
  updatePage,
} from "@/lib/notion/pages-api";

function collectDescendantIds(
  pages: PageSummary[],
  rootId: string
): Set<string> {
  const ids = new Set<string>([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const p of pages) {
      if (p.parentId && ids.has(p.parentId) && !ids.has(p.id)) {
        ids.add(p.id);
        added = true;
      }
    }
  }
  return ids;
}

export function NotionWorkspace() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"workspace" | "trash" | "home" | "recent">(
    "workspace"
  );
  const [trashedPages, setTrashedPages] = useState<PageSummary[]>([]);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const selectedPageIdRef = useRef(selectedPageId);
  selectedPageIdRef.current = selectedPageId;

  const pageTree = useMemo(() => buildPageTree(pages), [pages]);

  const loadTrash = async () => {
    const list = await fetchTrashedPages();
    setTrashedPages(list);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await fetchCurrentUser();
        if (!user) {
          router.replace("/login");
          return;
        }
        if (cancelled) return;
        setUserEmail(user.email);

        const list = await fetchPages();
        if (cancelled) return;
        setPages(list);
        if (list.length > 0) {
          setSelectedPageId(list[0].id);
        }
        try {
          const trash = await fetchTrashedPages();
          if (!cancelled) setTrashedPages(trash);
        } catch {
          /* ignore trash load on init */
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!selectedPageId) {
      setSelectedPage(null);
      return;
    }

    let cancelled = false;
    setPageLoading(true);
    setIsDirty(false);
    (async () => {
      try {
        const page = await fetchPage(selectedPageId);
        if (cancelled || selectedPageIdRef.current !== selectedPageId) return;
        setSelectedPage(page);
        setIsDirty(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "페이지를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedPageId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const markDirty = () => setIsDirty(true);

  const handleSave = async () => {
    if (!selectedPage || isSaving) return;

    setIsSaving(true);
    try {
      await updatePage(selectedPage.id, {
        title: selectedPage.title.trim() || "제목 없음",
        icon: selectedPage.icon,
        blocks: selectedPage.blocks,
      });
      setPages((prev) =>
        prev.map((p) =>
          p.id === selectedPage.id
            ? {
                ...p,
                title: selectedPage.title.trim() || "제목 없음",
                icon: selectedPage.icon,
              }
            : p
        )
      );
      setIsDirty(false);
    } catch {
      setError("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (title: string) => {
    if (!selectedPage) return;
    setSelectedPage({ ...selectedPage, title });
    setPages((prev) =>
      prev.map((p) => (p.id === selectedPage.id ? { ...p, title } : p))
    );
    markDirty();
  };

  const handleIconChange = (icon: string) => {
    if (!selectedPage) return;
    setSelectedPage({ ...selectedPage, icon });
    setPages((prev) =>
      prev.map((p) => (p.id === selectedPage.id ? { ...p, icon } : p))
    );
    markDirty();
  };

  const handleBlocksChange = (blocks: Block[]) => {
    if (!selectedPage) return;
    setSelectedPage({ ...selectedPage, blocks });
    markDirty();
  };

  const addPage = async (parentId?: string) => {
    try {
      const page = await createPage({
        title: "새 페이지",
        icon: "📄",
        parentId: parentId ?? null,
        blocks: defaultBlocks(),
      });
      const summary: PageSummary = {
        id: page.id,
        title: page.title,
        icon: page.icon,
        coverImage: page.coverImage,
        parentId: page.parentId ?? parentId ?? null,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      };
      setPages((prev) => [summary, ...prev]);
      setSelectedPageId(page.id);
      setSelectedPage(page);
      setIsDirty(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "페이지를 만들지 못했습니다.");
    }
  };

  const deletePage = async (id: string) => {
    const previousPages = pages;
    const previousSelectedId = selectedPageId;
    const previousSelectedPage = selectedPage;

    const removeIds = collectDescendantIds(pages, id);
    const nextPages = previousPages.filter((p) => !removeIds.has(p.id));
    const nextSelectedId =
      selectedPageId && removeIds.has(selectedPageId)
        ? (nextPages[0]?.id ?? null)
        : selectedPageId;

    setPages(nextPages);
    setSelectedPageId(nextSelectedId);
    if (selectedPageId && removeIds.has(selectedPageId)) {
      setSelectedPage(null);
      setIsDirty(false);
    }

    try {
      await deletePageApi(id);
      void loadTrash();
    } catch {
      setPages(previousPages);
      setSelectedPageId(previousSelectedId);
      setSelectedPage(previousSelectedPage);
      setError("페이지를 삭제하지 못했습니다.");
    }
  };

  const openHome = () => {
    setView("home");
    setSelectedPageId(null);
    setSelectedPage(null);
    setIsDirty(false);
  };

  const openRecent = () => {
    setView("recent");
    setSelectedPageId(null);
    setSelectedPage(null);
    setIsDirty(false);
  };

  const openTrash = async () => {
    setView("trash");
    setSelectedPageId(null);
    setSelectedPage(null);
    try {
      await loadTrash();
    } catch {
      setError("휴지통을 불러오지 못했습니다.");
    }
  };

  const handleEmptyTrash = async () => {
    setIsEmptyingTrash(true);
    try {
      await emptyTrashApi();
      setTrashedPages([]);
    } catch {
      setError("휴지통을 비우지 못했습니다.");
    } finally {
      setIsEmptyingTrash(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("로그아웃에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        pages={pageTree}
        selectedPageId={selectedPageId}
        userEmail={userEmail}
        isHomeView={view === "home"}
        isRecentView={view === "recent"}
        isTrashView={view === "trash"}
        trashCount={trashedPages.length}
        onSelectPage={(id) => {
          setView("workspace");
          setSelectedPageId(id);
        }}
        onAddPage={addPage}
        onDeletePage={deletePage}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenHome={openHome}
        onOpenRecent={openRecent}
        onOpenTrash={() => {
          void openTrash();
        }}
        onLogout={handleLogout}
      />
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        pages={pages}
        onSelectPage={(id) => {
          setView("workspace");
          setSelectedPageId(id);
        }}
      />
      {error && (
        <div className="fixed bottom-4 right-4 z-50 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => setError(null)}
          >
            닫기
          </button>
        </div>
      )}
      {view === "trash" ? (
        <TrashPanel
          pages={trashedPages}
          onBack={() => setView("workspace")}
          onEmptyTrash={handleEmptyTrash}
          isEmptying={isEmptyingTrash}
        />
      ) : view === "home" ? (
        <HomePanel
          pages={pages}
          userEmail={userEmail}
          onSelectPage={(id) => {
            setView("workspace");
            setSelectedPageId(id);
          }}
          onAddPage={() => void addPage()}
        />
      ) : view === "recent" ? (
        <RecentPanel
          pages={pages}
          onSelectPage={(id) => {
            setView("workspace");
            setSelectedPageId(id);
          }}
        />
      ) : pageLoading && selectedPageId ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          페이지 불러오는 중...
        </div>
      ) : selectedPage ? (
        <PageEditor
          key={selectedPage.id}
          pageId={selectedPage.id}
          title={selectedPage.title}
          icon={selectedPage.icon ?? "📄"}
          coverImage={selectedPage.coverImage ?? undefined}
          blocks={selectedPage.blocks}
          isDirty={isDirty}
          isSaving={isSaving}
          onTitleChange={handleTitleChange}
          onIconChange={handleIconChange}
          onBlocksChange={handleBlocksChange}
          onSave={() => void handleSave()}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg">페이지를 선택하거나 새 페이지를 만들어 주세요</p>
          </div>
        </div>
      )}
    </div>
  );
}
