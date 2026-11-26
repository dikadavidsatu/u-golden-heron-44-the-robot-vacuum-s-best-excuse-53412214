// SPDX-License-Identifier: MIT
// The Robot Vacuum's Best Excuse — re-authored entry program.
//
// Premise in one breath: a robot vacuum is accused of skipping a spot
// on the floor. It pleads not guilty on a technicality only a machine
// could love — according to its own floor map, the crumb sitting in
// that spot is structural. Taking the crumb away would not be cleaning
// at all; it would be demolition, and demolition is work the little
// appliance is quite sensibly not licensed to perform.
//
// This file builds that single excuse line out of three named pieces,
// checks the finished line against the competition gate, writes it to
// the grader's output directory, and then reads the file back to prove
// the bytes on disk are exactly the bytes that were intended.
//
// Step 1 of the rewrite: constants and the excuse-composition helpers,
// plus a minimal entry point so the program already runs end to end.
import { chmodSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

// --- The three beats of the joke -------------------------------------
//
// Beat one is the flat denial: nothing was missed. Beat two is the
// machine's evidence, stated in mapping vocabulary: the crumb is on
// the map and the map calls it load-bearing. Beat three is the turn:
// a licensing excuse that treats a snack crumb like a support beam.
const DENIAL = "I didn't miss that spot";
const MAP_EVIDENCE = "my map lists that crumb as load-bearing";
const LICENCE_TURN = "I am not licensed for structural demolition.";

// An em dash joins the denial to the evidence; a comma and "and" join
// the evidence to the turn. Keeping the joiners in named constants
// makes the punctuation part of the composition, not an accident.
const DASH_JOIN = " \u2014 ";
const AND_JOIN = ", and ";

/**
 * Assemble the excuse from its three beats. The result is a single
 * deterministic line: same fragments in, same line out, every run.
 */
export function composeExcuse(): string {
  return DENIAL + DASH_JOIN + MAP_EVIDENCE + AND_JOIN + LICENCE_TURN;
}

/** The one line this entry exists to deliver. */
export const EXCUSE_LINE: string = composeExcuse();

/** Count characters the way a reader does: Unicode code points. */
export function measureLine(text: string): number {
  let total = 0;
  for (const _ch of text) total += 1;
  return total;
}

// --- The competition gate --------------------------------------------
//
// The bounty accepts exactly one line of text: between 1 and 140
// characters long, not blank, and containing no line breaks at all.
// Those limits live here as named bounds so the checks below read as
// the rules themselves rather than as unexplained magic numbers.
export const SHORTEST_ALLOWED = 1;
export const LONGEST_ALLOWED = 140;

/**
 * Return every reason a candidate line would be rejected, in plain
 * words. An empty list means the line passes the gate. Collecting all
 * of the problems at once (instead of failing on the first one) makes
 * a broken entry much easier to diagnose from a single error message.
 */
export function gateProblemsFor(candidate: unknown): string[] {
  const found: string[] = [];
  if (typeof candidate !== "string") {
    found.push("the entry is not text");
    return found;
  }
  const size = measureLine(candidate);
  if (size < SHORTEST_ALLOWED) {
    found.push(`the entry is empty (needs at least ${SHORTEST_ALLOWED} character)`);
  }
  if (size > LONGEST_ALLOWED) {
    found.push(`the entry runs to ${size} characters, past the ${LONGEST_ALLOWED} limit`);
  }
  if (candidate.trim() === "") {
    found.push("the entry is nothing but whitespace");
  }
  if (candidate.includes("\n") || candidate.includes("\r")) {
    found.push("the entry breaks across more than one line");
  }
  return found;
}

/** True exactly when the gate has no complaints about the line. */
export function passesGate(candidate: unknown): boolean {
  return gateProblemsFor(candidate).length === 0;
}

/**
 * Guard used by the entry point: refuse to write anything that the
 * gate would reject, and say precisely why when refusing.
 */
export function demandGatePass(candidate: string): void {
  const problems = gateProblemsFor(candidate);
  if (problems.length > 0) {
    throw new Error(`Entry refused by the gate: ${problems.join("; ")}`);
  }
}

// --- Where the finished line goes ------------------------------------
//
// The grader names a writable folder through the MAKEFUN_OUTPUT_DIR
// environment variable. When that variable is missing or blank, the
// documented fallback folder is "/output". Either way the answer has
// to be absolute: a relative folder would drop the file inside this
// repository, and the entry must never write into its own repo.
export const ENTRY_FILENAME = "entry.txt";
export const FALLBACK_OUTPUT_DIR = "/output";

/** Work out which folder the entry file belongs in. */
export function pickOutputDir(env: NodeJS.ProcessEnv = process.env): string {
  const requested = (env.MAKEFUN_OUTPUT_DIR ?? "").trim();
  const chosen = requested === "" ? FALLBACK_OUTPUT_DIR : requested;
  if (!isAbsolute(chosen)) {
    throw new Error(
      `Output folder must be an absolute path, received ${JSON.stringify(chosen)}`,
    );
  }
  return resolve(chosen);
}

/** Create the folder if needed and confirm it really is a folder. */
export function prepareOutputDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
  if (!statSync(dir).isDirectory()) {
    throw new Error(`Output path ${JSON.stringify(dir)} exists but is not a folder`);
  }
  // The grader may collect the results running as a different user,
  // so the folder stays traversable by everyone (0755).
  chmodSync(dir, 0o755);
}

/** Write the line, leaving the file readable by everyone (0644). */
export function storeEntry(filePath: string, line: string): void {
  writeFileSync(filePath, line, "utf8");
  chmodSync(filePath, 0o644);
}

/**
 * Read the stored file back and hold it up against the intended line.
 * A short write, a stray newline, or an encoding slip all surface here
 * as a loud error instead of as a silently invalid submission.
 */
export function confirmStoredEntry(filePath: string, expected: string): void {
  const onDisk = readFileSync(filePath, "utf8");
  if (onDisk !== expected) {
    throw new Error(`Read-back from ${JSON.stringify(filePath)} does not match the excuse`);
  }
  demandGatePass(onDisk);
}

// --- Self-check --------------------------------------------------------
//
// Before anything touches disk, run the helpers against known inputs:
// the composed line must rebuild itself from its beats, the counter
// must agree with a manual count, and the gate must accept a short
// line while rejecting an empty one and a two-line one. If any of
// these ever fail, the program stops before writing a bad entry.
export function runSelfCheck(): void {
  const rebuilt = composeExcuse();
  if (rebuilt !== EXCUSE_LINE) {
    throw new Error("Self-check failed: recomposing the excuse changed the line");
  }
  if (measureLine("a\u2014b") !== 3) {
    throw new Error("Self-check failed: character counting is off");
  }
  if (!passesGate("One clean line.")) {
    throw new Error("Self-check failed: the gate rejected a plainly valid line");
  }
  if (passesGate("") || passesGate("two\nlines")) {
    throw new Error("Self-check failed: the gate accepted an invalid line");
  }
}

/**
 * Entry point: self-check, gate-check the excuse, resolve and prepare
 * the output folder, write the line, then verify what landed on disk.
 */
function main(): void {
  runSelfCheck();
  demandGatePass(EXCUSE_LINE);

  const outputDir = pickOutputDir();
  const outputPath = join(outputDir, ENTRY_FILENAME);
  prepareOutputDir(outputDir);
  storeEntry(outputPath, EXCUSE_LINE);
  confirmStoredEntry(outputPath, EXCUSE_LINE);

  console.log(`Wrote ${measureLine(EXCUSE_LINE)} chars to ${outputPath}`);
  console.log(EXCUSE_LINE);
}

main();
