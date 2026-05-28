import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/require-user";
import { emptyTrash, listTrashedPages } from "@/lib/repos/page-repo";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const pages = await listTrashedPages(user.id);
    return NextResponse.json({ pages }, { status: 200 });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load trash" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireCurrentUser();
    const count = await emptyTrash(user.id);
    return NextResponse.json({ ok: true, count }, { status: 200 });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to empty trash" }, { status: 500 });
  }
}
