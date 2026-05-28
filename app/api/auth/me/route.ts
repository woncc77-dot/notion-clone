import { NextResponse } from "next/server";
import { getCurrentUserOrNull } from "@/lib/auth/require-user";

export async function GET() {
  const user = await getCurrentUserOrNull();
  return NextResponse.json({ user }, { status: 200 });
}
