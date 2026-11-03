// UserPromptSubmit hook: records a per-session opt-out when the reader says
// "stop adhd mode" or "normal mode", so the SessionStart hook can skip
// re-injecting the ruleset after `/compact` or `--resume` continues the same
// session. Without this, compaction silently re-enabled always-on mode even
// after the reader turned it off, breaking the "off for this session" promise.
// Never blocks the prompt: any failure exits 0 silently.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

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
  const prompt = input.prompt || "";
  if (sessionId && /stop adhd mode|normal mode/i.test(prompt)) {
    fs.mkdirSync(MARKER_DIR, { recursive: true });
    fs.writeFileSync(path.join(MARKER_DIR, sessionId), "");
  }
} catch {
  // Never block the prompt.
}
process.exit(0);
