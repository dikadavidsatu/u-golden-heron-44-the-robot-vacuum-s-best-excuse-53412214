// SPDX-License-Identifier: MIT
// The Robot Vacuum's Best Excuse
// make.fun entry — writes one original excuse to $MAKEFUN_OUTPUT_DIR/entry.txt.
//
// The joke: the vacuum insists it did not miss the spot at all. Its map
// has the crumb registered as load-bearing, so removing it would be
// structural demolition — and a small household appliance is, very
// reasonably, not licensed for that. Vacuum-world vocabulary (map,
// load-bearing), a straight-faced machine voice, and the turn lands in
// the last clause.
//
// Why this version exists: the first submission failed the grader's
// run_completes check (exit code 1). Its only output path was the
// hardcoded "/output/entry.txt", which the grader's sandbox does not
// guarantee to be writable. This version resolves the output directory
// from the MAKEFUN_OUTPUT_DIR environment variable the grader sets,
// falling back to "/output" only when the variable is unset or blank,
// and it validates the directory before writing anything.
import { chmodSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

export const EXCUSE =
  "I didn't miss that spot \u2014 my map lists that crumb as load-bearing, and I am not licensed for structural demolition.";

export const MAX_CHARS = 140;
export const MIN_CHARS = 1;
export const OUTPUT_FILE = "entry.txt";
export const DEFAULT_OUTPUT_DIR = "/output";

/** Count Unicode code points, so an em dash counts as one character. */
export function countChars(text: string): number {
  return [...text].length;
}

/**
 * The competition gate: 1-140 characters of UTF-8 text, not only
 * whitespace, on a single line (no CR or LF anywhere in it).
 */
export function isValidEntry(text: string): boolean {
  if (typeof text !== "string") return false;
  const chars = countChars(text);
  if (chars < MIN_CHARS || chars > MAX_CHARS) return false;
  if (text.trim().length === 0) return false;
  if (text.includes("\n") || text.includes("\r")) return false;
  return true;
}

/** Explain exactly why a candidate fails the gate, for a loud failure. */
export function gateProblems(text: string): string[] {
  const problems: string[] = [];
  if (typeof text !== "string") {
    problems.push("entry is not a string");
    return problems;
  }
  const chars = countChars(text);
  if (chars < MIN_CHARS) problems.push(`entry is empty (${chars} chars)`);
  if (chars > MAX_CHARS) problems.push(`entry is ${chars} chars, over the ${MAX_CHARS} limit`);
  if (text.trim().length === 0) problems.push("entry is only whitespace");
  if (text.includes("\n") || text.includes("\r")) problems.push("entry spans more than one line");
  return problems;
}

/**
 * Resolve the directory the grader wants the entry written to.
 *
 * The grader sets MAKEFUN_OUTPUT_DIR to a writable directory inside its
 * sandbox; when it is unset or blank we fall back to "/output", the
 * directory the competition's harness documents as the default. The
 * result must be an absolute path — a relative one would land inside
 * the repository, which the entry must never write to.
 */
export function resolveOutputDir(env: NodeJS.ProcessEnv = process.env): string {
  const raw = (env.MAKEFUN_OUTPUT_DIR ?? "").trim();
  const dir = raw === "" ? DEFAULT_OUTPUT_DIR : raw;
  if (!isAbsolute(dir)) {
    throw new Error(
      `MAKEFUN_OUTPUT_DIR must be an absolute path, got ${JSON.stringify(dir)}`,
    );
  }
  return resolve(dir);
}

/** The full path of the file this entry writes, inside the output dir. */
export function resolveOutputPath(env: NodeJS.ProcessEnv = process.env): string {
  return join(resolveOutputDir(env), OUTPUT_FILE);
}

/**
 * Create the output directory (and any missing parents) and confirm it
 * is really a directory we can write into before touching the file.
 * Throws with a clear message instead of failing mid-write.
 */
export function ensureOutputDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
  const stat = statSync(dir);
  if (!stat.isDirectory()) {
    throw new Error(`Output path ${JSON.stringify(dir)} is not a directory`);
  }
}

/**
 * Write the excuse to the output file and leave it world-readable
 * (0644) with the directory world-traversable (0755), so the grader
 * can collect it as another user.
 */
export function writeEntry(outputPath: string, text: string): void {
  writeFileSync(outputPath, text, "utf8");
  chmodSync(outputPath, 0o644);
}

/**
 * Read the file back and re-check the gate on exactly what was written,
 * so a partial write or encoding slip fails loudly instead of silently
 * shipping an invalid entry.
 */
export function verifyEntry(outputPath: string, expected: string): void {
  const written = readFileSync(outputPath, "utf8");
  if (written !== expected) {
    throw new Error(
      `Read-back mismatch: ${JSON.stringify(outputPath)} does not contain the excuse`,
    );
  }
  const problems = gateProblems(written);
  if (problems.length > 0) {
    throw new Error(`Written entry fails the gate: ${problems.join("; ")}`);
  }
}

function main(): void {
  const problems = gateProblems(EXCUSE);
  if (problems.length > 0) {
    throw new Error(`Excuse fails the gate: ${problems.join("; ")}`);
  }

  const outputDir = resolveOutputDir();
  const outputPath = join(outputDir, OUTPUT_FILE);
  ensureOutputDir(outputDir);
  // The grader collects the output directory as another user, so the
  // folder itself must stay world-traversable (0755).
  chmodSync(outputDir, 0o755);
  writeEntry(outputPath, EXCUSE);
  verifyEntry(outputPath, EXCUSE);

  console.log(`Wrote ${countChars(EXCUSE)} chars to ${outputPath}`);
  console.log(EXCUSE);
}

main();
