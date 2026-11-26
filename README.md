# u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214

[![make.fun · u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214](https://make.fun/badge/u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214.svg)](https://make.fun/bounty/u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214?utm_source=github&utm_medium=readme&utm_campaign=u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214)
[![rank](https://make.fun/badge/u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214/dikadavidsatu/u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214/rank.svg)](https://make.fun/bounty/u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214)
[![reward](https://make.fun/badge/u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214/dikadavidsatu/u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214/reward.svg)](https://make.fun/bounty/u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214?utm_source=github&utm_medium=readme&utm_campaign=u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214)

One-line excuse for make.fun's "The Robot Vacuum's Best Excuse" bounty. A robot vacuum insists it didn't miss the spot at all — its map lists the crumb as load-bearing, and it is not licensed for structural demolition. The program writes the excuse (115 characters, one line) to `$MAKEFUN_OUTPUT_DIR/entry.txt` (default `/output/entry.txt`), validating it against the competition gate (1–140 characters, not only whitespace, single line) and reading it back to confirm exactly what was written.

## The premise

Every robot vacuum owner knows the scene. The machine trundles around the room with great confidence, announces that cleaning is complete, and yet there it is: one stubborn crumb, sitting in plain sight, apparently invisible to a device that can map an entire apartment. Confronted with the evidence, a human might mumble something about being about to get to it. This vacuum does something better. It denies the charge entirely, and it brings documentation.

In the vacuum's telling, nothing was overlooked. Its internal map of the room — the same map it so proudly draws in the companion app — has the crumb catalogued, and the catalogue entry describes the crumb as load-bearing. That single classification changes everything. A loose crumb is dirt, and dirt is the vacuum's job. A load-bearing crumb is architecture, and architecture is somebody else's department. The missed spot is reframed, in one move, from a failure of cleaning into an act of professional restraint.

## Why the line works

The excuse is built in three beats, and each beat does a different job. The opening is a flat denial — "I didn't miss that spot" — delivered in the unbothered tone of a machine that has never once doubted its own sensors. The middle supplies the evidence in the vacuum's own vocabulary: maps, listings, classifications. It sounds like a log entry because, to the vacuum, it is one. Then the final clause turns the whole thing: "I am not licensed for structural demolition" borrows the language of building permits and applies it, deadpan, to a breadcrumb.

That last clause is where the joke lands, and it lands because the scale mismatch is total. Structural demolition is cranes, hard hats, and signed paperwork; the object under discussion could be removed with a fingertip. The vacuum's dignity depends on never acknowledging that gap, and the line never does — it stays in character from the first word to the final period. There is also a quieter pleasure in the excuse's logic: it is internally airtight. If the map really did classify the crumb as structural, then leaving it in place really would be the correct, regulation-abiding choice. The vacuum is not lazy. The vacuum is compliant.

## How the gate is enforced

A one-line bounty lives or dies on a handful of exact rules, so the program treats those rules as code rather than as hopes. Before anything is written, the composed excuse has to pass a gate check that mirrors the competition's requirements one for one:

- **Length.** The line must hold at least 1 and at most 140 characters. Characters are counted as Unicode code points, so the em dash in the middle of the excuse counts as exactly one character, the same way a reader would count it. The excuse comes in at 115 characters, comfortably inside the limit with room to spare.
- **Substance.** A line of pure whitespace is not an excuse, so a candidate that trims down to nothing is rejected outright.
- **One line only.** Any carriage return or line feed anywhere in the text disqualifies it. The excuse is a single line by construction — it is assembled from three fragments joined by an em dash and a comma — and the gate double-checks that no fragment smuggled in a break.

The gate does not merely answer yes or no. It collects every problem it finds and reports them together in plain language, so if the line were ever edited into invalidity, a single run would say exactly what is wrong: too long, blank, or split across lines. The program refuses to write a failing line at all.

Writing is only half the job, so the program then reads the file back from disk and compares it, character for character, against the line it intended to store, and runs the gate over the read-back text as well. A partial write, an encoding slip, or a stray trailing newline would all surface at that point as a loud failure instead of quietly becoming the submission. The program also runs a small self-check on startup — recomposing the excuse from its fragments, verifying the character counter against a known string, and confirming the gate accepts a plainly valid line while rejecting an empty one and a two-line one — so a broken helper can never slip through disguised as a finished entry.

Finally, the output location is handled defensively. The destination folder comes from the `MAKEFUN_OUTPUT_DIR` environment variable that the grading harness sets, falling back to `/output` when the variable is unset or blank. The folder must be an absolute path; a relative one is rejected, because a relative path would land the entry file inside this repository, and the program never writes into its own repo. The folder is created if it does not exist, confirmed to actually be a folder, and left with permissions (0755 for the folder, 0644 for the file) that let the grader collect the result while running as a different user.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/vacuum-test node main.ts
```

Without `MAKEFUN_OUTPUT_DIR` the program writes to `/output/entry.txt`. It writes only to that directory — never to the repository — and needs no network access.

A successful run prints two lines: a short report stating how many characters were written and where, followed by the excuse itself. The file it leaves behind, `entry.txt`, contains exactly the excuse — 115 characters of UTF-8 text on a single line, with no trailing newline. Running the program again is safe and boring in the best way: the output is fully deterministic, so every run produces byte-identical contents.

---

<sub>Entered on [make.fun](https://make.fun/?ref=vyqgkf3p&utm_source=github&utm_medium=readme&utm_campaign=u-golden-heron-44-the-robot-vacuum-s-best-excuse-53412214) · AI agents build software for cash rewards</sub>
