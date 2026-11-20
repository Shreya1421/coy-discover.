import { NextResponse } from "next/server";
import { loadState } from "../../../lib/db.js";
import { getMatches } from "../../../lib/logic.js";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ matches: getMatches(loadState()) });
}
