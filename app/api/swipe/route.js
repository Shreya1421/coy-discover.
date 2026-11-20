import { NextResponse } from "next/server";
import { loadState, saveState } from "../../../lib/db.js";
import { applySwipe, HttpError } from "../../../lib/logic.js";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const state = loadState();
    const result = applySwipe(state, body.profileId, body.direction);
    saveState(state);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
