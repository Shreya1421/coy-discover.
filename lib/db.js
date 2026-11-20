// Tiny JSON-file persistence. Fine for a single-user demo.
import fs from "node:fs";
import path from "node:path";
import { emptyState } from "./logic.js";

const FILE = path.join(process.cwd(), "data", "state.json");

export function loadState() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return emptyState(); }
}

export function saveState(state) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE); // atomic replace
}
