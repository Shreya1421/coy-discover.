import { NextResponse } from "next/server";
import { saveState } from "../../../lib/db.js";
import { emptyState } from "../../../lib/logic.js";

export const dynamic = "force-dynamic";

// Demo helper: wipes all swipes and matches. Disabled in production.
export function POST() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Not available" }, { status: 404 });
  saveState(emptyState());
  return NextResponse.json({ ok: true });
}
