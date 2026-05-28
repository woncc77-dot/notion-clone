import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/require-user";
import { createPage, listPages } from "@/lib/repos/page-repo";

const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  content: z.string(),
  checked: z.boolean().optional(),
});

const CreatePageSchema = z.object({
  title: z.string().min(1).max(200),
  icon: z.string().optional(),
  parentId: z.string().optional().nullable(),
  coverImage: z.string().url().optional(),
  blocks: z.array(BlockSchema).optional(),
  blocksJson: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const pages = await listPages(user.id);
    return NextResponse.json({ pages }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentUser();
    const body = await req.json().catch(() => null);
    const parsed = CreatePageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const blocksJson =
      parsed.data.blocksJson ??
      JSON.stringify(
        parsed.data.blocks ?? [
          { id: `block-${Date.now()}`, type: "paragraph", content: "" },
        ]
      );

    const page = await createPage(user.id, {
      title: parsed.data.title,
      icon: parsed.data.icon ?? null,
      parentId: parsed.data.parentId ?? null,
      coverImage: parsed.data.coverImage ?? null,
      blocksJson,
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/pages failed:", e);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}

