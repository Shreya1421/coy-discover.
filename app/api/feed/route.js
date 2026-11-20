import { NextResponse } from "next/server";
import { loadState } from "../../../lib/db.js";
import { getFeed } from "../../../lib/logic.js";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ profiles: getFeed(loadState()) });
}
