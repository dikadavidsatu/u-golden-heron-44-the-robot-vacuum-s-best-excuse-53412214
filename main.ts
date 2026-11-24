// The Robot Vacuum's Best Excuse
// make.fun entry — writes one original excuse to /output/entry.txt.
//
// The joke: the vacuum insists it did not miss the spot at all. Its map
// has the crumb registered as load-bearing, so removing it would be
// structural demolition — and a small household appliance is, very
// reasonably, not licensed for that. Vacuum-world vocabulary (map,
// load-bearing), a straight-faced machine voice, and the turn lands in
// the last clause.
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const EXCUSE =
  "I didn't miss that spot \u2014 my map lists that crumb as load-bearing, and I am not licensed for structural demolition.";

export const MAX_CHARS = 140;
export const OUTPUT_PATH = "/output/entry.txt";

/** The competition gate: 1-140 characters of UTF-8 text, not only whitespace. */
export function isValidEntry(text: string): boolean {
  if (typeof text !== "string") return false;
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) return false;
  if (text.trim().length === 0) return false;
  if (text.includes("\n") || text.includes("\r")) return false;
  return true;
}

function main(): void {
  if (!isValidEntry(EXCUSE)) {
    throw new Error(
      `Excuse fails the gate: ${[...EXCUSE].length} chars (limit ${MAX_CHARS})`,
    );
  }
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, EXCUSE, "utf8");
  // The grader collects /output as another user, so leave the file
  // world-readable (0644) and the folder world-traversable (0755).
  chmodSync(dirname(OUTPUT_PATH), 0o755);
  chmodSync(OUTPUT_PATH, 0o644);
  // Read it back and re-check the gate on exactly what was written,
  // so a partial write or encoding slip fails loudly instead of
  // silently shipping an invalid entry.
  const written = readFileSync(OUTPUT_PATH, "utf8");
  if (written !== EXCUSE || !isValidEntry(written)) {
    throw new Error("Read-back check failed: /output/entry.txt is not the excuse");
  }
  console.log(`Wrote ${[...EXCUSE].length} chars to ${OUTPUT_PATH}`);
  console.log(EXCUSE);
}

main();
