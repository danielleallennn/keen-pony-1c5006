// SessionStart hook: injects the i-have-adhd ruleset into context automatically,
// every session, in this project. Unlike the upstream plugin's opt-in flag file,
// this fires unconditionally since the ruleset is meant to always be on here.
// Never blocks session start: any failure exits 0.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

try {
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
