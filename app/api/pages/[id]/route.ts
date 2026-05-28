import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/require-user";
import { getPageById, softDeletePageById, updatePageById } from "@/lib/repos/page-repo";

const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  content: z.string(),
  checked: z.boolean().optional(),
});

const UpdatePageSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    icon: z.string().nullable().optional(),
    coverImage: z.string().url().nullable().optional(),
    blocks: z.array(BlockSchema).optional(),
    blocksJson: z.string().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No updates" });

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser();
    const { id } = await ctx.params;
    const page = await getPageById(user.id, id);
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(
      { page: { ...page, blocks: JSON.parse(page.blocksJson) } },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = UpdatePageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.icon !== undefined) updates.icon = parsed.data.icon;
    if (parsed.data.coverImage !== undefined) updates.coverImage = parsed.data.coverImage;
    if (parsed.data.blocksJson !== undefined) updates.blocksJson = parsed.data.blocksJson;
    if (parsed.data.blocks !== undefined) updates.blocksJson = JSON.stringify(parsed.data.blocks);

    const page = await updatePageById(user.id, id, updates as any);
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ page }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser();
    const { id } = await ctx.params;
    const ok = await softDeletePageById(user.id, id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

