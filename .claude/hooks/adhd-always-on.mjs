// SessionStart hook: injects the i-have-adhd ruleset into context automatically,
// every session, in this project. Unlike the upstream plugin's opt-in flag file,
// this fires unconditionally since the ruleset is meant to always be on here —
// except when the reader opted out earlier in a session that "resume" or
// "compact" is continuing (see adhd-opt-out-tracker.mjs); "startup" and "clear"
// are fresh starts, so the project default re-asserts itself there.
// Never blocks session start: any failure exits 0.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MARKER_DIR = path.join(os.tmpdir(), ".i-have-adhd-sessions");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

try {
  const input = JSON.parse(readStdin() || "{}");
  const sessionId = input.session_id;
  const source = input.source;
  const markerPath = sessionId ? path.join(MARKER_DIR, sessionId) : null;

  if (markerPath && (source === "clear" || source === "startup")) {
    fs.rmSync(markerPath, { force: true });
  }
  if (markerPath && fs.existsSync(markerPath)) {
    process.exit(0);
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const skillPath = path.join(scriptDir, "..", "skills", "i-have-adhd", "SKILL.md");
  if (!fs.existsSync(skillPath)) process.exit(0);

  // Strip a leading YAML frontmatter block (--- ... --- at the very top of file).
  const body = fs
    .readFileSync(skillPath, "utf8")
    .replace(
      /^---[^\S\r\n]*\r?\n[\s\S]*?\r?\n---[^\S\r\n]*(?:\r?\n|$)/,
      "",
    )
    .replace(/(?:\r?\n)+$/, "");

  process.stdout.write(
    "ADHD MODE ACTIVE (always-on for this project). The ruleset below applies to every response. " +
      '"stop adhd mode" turns it off for this session only.\n\n' +
      `${body}\n`,
  );
} catch {
  process.exit(0);
}
