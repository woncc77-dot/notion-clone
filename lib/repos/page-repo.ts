import { createClient } from "@/lib/supabase/server";

export type PageRecord = {
  id: string;
  ownerId: string;
  parentId: string | null;
  title: string;
  icon: string | null;
  coverImage: string | null;
  blocksJson: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type PageListItem = {
  id: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type PageRow = {
  id: string;
  owner_id: string;
  parent_id: string | null;
  title: string;
  icon: string | null;
  cover_image: string | null;
  blocks_json: unknown;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type PageListRow = Omit<PageRow, "owner_id" | "blocks_json">;

function blocksJsonToString(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? []);
}

function toPageRecord(row: PageRow): PageRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    parentId: row.parent_id,
    title: row.title,
    icon: row.icon,
    coverImage: row.cover_image,
    blocksJson: blocksJsonToString(row.blocks_json),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  };
}

function toPageListItem(row: PageListRow): PageListItem {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    coverImage: row.cover_image,
    parentId: row.parent_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  };
}

function collectDescendantIds(
  pages: { id: string; parentId: string | null }[],
  rootId: string
): string[] {
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
  return [...ids];
}

const listSelect =
  "id, title, icon, cover_image, parent_id, created_at, updated_at, deleted_at";

const detailSelect =
  "id, owner_id, parent_id, title, icon, cover_image, blocks_json, created_at, updated_at, deleted_at";

export async function listPages(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select(listSelect)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as PageListRow[]).map(toPageListItem);
}

export async function listTrashedPages(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select(listSelect)
    .eq("owner_id", ownerId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data as PageListRow[]).map(toPageListItem);
}

export async function createPage(
  ownerId: string,
  data: {
    title: string;
    icon?: string | null;
    coverImage?: string | null;
    blocksJson: string;
    parentId?: string | null;
  }
) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("pages")
    .insert({
      owner_id: ownerId,
      parent_id: data.parentId ?? null,
      title: data.title,
      icon: data.icon ?? null,
      cover_image: data.coverImage ?? null,
      blocks_json: JSON.parse(data.blocksJson),
    })
    .select(detailSelect)
    .single();

  if (error) throw error;
  return toPageRecord(row as PageRow);
}

export async function getPageById(ownerId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select(detailSelect)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toPageRecord(data as PageRow);
}

export async function updatePageById(
  ownerId: string,
  id: string,
  data: Partial<{
    title: string;
    icon: string | null;
    coverImage: string | null;
    blocksJson: string;
    parentId: string | null;
  }>
) {
  const existing = await getPageById(ownerId, id);
  if (!existing) return null;

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.title !== undefined) payload.title = data.title;
  if (data.icon !== undefined) payload.icon = data.icon;
  if (data.coverImage !== undefined) payload.cover_image = data.coverImage;
  if (data.parentId !== undefined) payload.parent_id = data.parentId;
  if (data.blocksJson !== undefined) {
    payload.blocks_json = JSON.parse(data.blocksJson);
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("pages")
    .update(payload)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select(detailSelect)
    .single();

  if (error) throw error;
  return toPageRecord(row as PageRow);
}

export async function softDeletePageById(ownerId: string, id: string) {
  const supabase = await createClient();
  const { data: activePages, error: listError } = await supabase
    .from("pages")
    .select("id, parent_id")
    .eq("owner_id", ownerId)
    .is("deleted_at", null);

  if (listError) throw listError;

  const normalized = (activePages ?? []).map((p) => ({
    id: p.id as string,
    parentId: p.parent_id as string | null,
  }));

  const target = normalized.find((p) => p.id === id);
  if (!target) return false;

  const ids = collectDescendantIds(normalized, id);
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("pages")
    .update({ deleted_at: now, updated_at: now })
    .eq("owner_id", ownerId)
    .in("id", ids);

  if (error) throw error;
  return true;
}

export async function emptyTrash(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .delete()
    .eq("owner_id", ownerId)
    .not("deleted_at", "is", null)
    .select("id");

  if (error) throw error;
  return data?.length ?? 0;
}
