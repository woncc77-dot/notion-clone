export type SidebarPage = {
  id: string;
  title: string;
  icon?: string;
  parentId?: string | null;
  children?: SidebarPage[];
};

export function buildPageTree(
  pages: { id: string; title: string; icon: string | null; parentId?: string | null }[]
): SidebarPage[] {
  const map = new Map<string, SidebarPage>();
  const roots: SidebarPage[] = [];

  for (const p of pages) {
    map.set(p.id, {
      id: p.id,
      title: p.title,
      icon: p.icon ?? "📄",
      parentId: p.parentId ?? null,
      children: [],
    });
  }

  for (const p of pages) {
    const node = map.get(p.id)!;
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
