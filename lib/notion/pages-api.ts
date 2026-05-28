import type { Block, PageDetail, PageSummary } from "@/lib/notion/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data as { error?: string };
    if (res.status === 401) throw new Error("로그인이 필요합니다.");
    if (res.status === 400) throw new Error(err.error ?? "입력값이 올바르지 않습니다.");
    if (res.status === 500) throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    throw new Error(err.error ?? "Request failed");
  }
  return data as T;
}

export async function fetchPages(): Promise<PageSummary[]> {
  const data = await parseJson<{ pages: PageSummary[] }>(
    await fetch("/api/pages", { credentials: "include" })
  );
  return data.pages;
}

export async function fetchPage(id: string): Promise<PageDetail> {
  const data = await parseJson<{ page: PageDetail & { blocksJson?: string } }>(
    await fetch(`/api/pages/${id}`, { credentials: "include" })
  );
  const page = data.page;
  if (!page.blocks && (page as { blocksJson?: string }).blocksJson) {
    page.blocks = JSON.parse((page as { blocksJson: string }).blocksJson);
  }
  return page as PageDetail;
}

export async function createPage(payload: {
  title: string;
  icon?: string;
  parentId?: string | null;
  blocks?: Block[];
}): Promise<PageDetail> {
  const data = await parseJson<{
    page: PageSummary & { blocksJson: string };
  }>(
    await fetch("/api/pages", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
  const blocks = JSON.parse(data.page.blocksJson) as Block[];
  const { blocksJson: _omit, ...rest } = data.page;
  return {
    ...rest,
    parentId: rest.parentId ?? null,
    blocks,
  };
}

export async function updatePage(
  id: string,
  payload: Partial<{
    title: string;
    icon: string | null;
    coverImage: string | null;
    blocks: Block[];
  }>
): Promise<void> {
  await parseJson(
    await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function deletePage(id: string): Promise<void> {
  await parseJson(
    await fetch(`/api/pages/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
  );
}

export async function fetchTrashedPages(): Promise<PageSummary[]> {
  const data = await parseJson<{ pages: PageSummary[] }>(
    await fetch("/api/pages/trash", { credentials: "include" })
  );
  return data.pages;
}

export async function emptyTrash(): Promise<number> {
  const data = await parseJson<{ count: number }>(
    await fetch("/api/pages/trash", {
      method: "DELETE",
      credentials: "include",
    })
  );
  return data.count;
}

export async function fetchCurrentUser(): Promise<{ id: string; email: string } | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  const data = await res.json().catch(() => ({ user: null }));
  return data.user ?? null;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}
