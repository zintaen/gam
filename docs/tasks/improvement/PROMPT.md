# Trigger prompts

Two prompts. Stephen pastes Prompt A into an agent session to run a wave, and works through Prompt B himself afterward. Both assume the repo at ~/Projects/CyberSkill/gam (github.com/cyberskill-official/gam).

---

## Prompt A - agent implementation trigger

Copy everything in the block. Replace <N> with a wave number, or delete the sentence to let the agent pick the lowest incomplete wave. Add "Push is authorized." only if you want the agent to push.

```text
You are executing the GAM improvement program in ~/Projects/CyberSkill/gam.

Setup, in order:
1. Read docs/improvement/README.md, docs/improvement/BACKLOG.md, docs/improvement/LEDGER.md, then docs/improvement/tasks/wave-<N>.md. Execute wave <N>. If no wave is given, pick the lowest wave that still has todo tasks.
2. Detect your environment. If you have a working git + pnpm + cargo toolchain in this session (Claude Code on the Mac): sync main, create or reuse branch auto/improve-gam-w<N>, work there. If you are in a sandbox that cannot run git or the toolchain against this folder (Cowork): author files directly on the mounted folder, and run every gate and every git command on the Mac through Desktop Commander, prefixing each command with `source ~/.zshrc` (pnpm and node live there). Commit hooks are active: commitlint config-conventional, body lines max 100 chars.
3. Never work on main directly.

Execution loop, per task, strictly in the wave file's order except where Deps force otherwise:
1. Read the task card fully. If the task is gated(D<n>) and my message does not say that decision is closed, skip it: mark it skipped(D<n> open) in BACKLOG.md, one-line ledger entry, move on.
2. Implement completely - code, tests, and the docs the card names. Acceptance criteria are the definition of done; do not stop at "compiles".
3. Run the full gate: pnpm lint && pnpm vite:build && pnpm test, then in src-tauri/: cargo clippy --locked -- -D warnings && cargo test --lib --locked && cargo deny check. All green or the task is not done.
4. On green: set the task to done in BACKLOG.md, append a LEDGER.md entry in the documented format with real evidence (commands and key output), then make exactly one conventional commit for the task including the BACKLOG/LEDGER updates, with the task id in the body (e.g. "Implements GAM-012.").
5. On failure after two honest, different attempts: revert to a clean state, mark the task blocked(<one-line diagnosis>) in BACKLOG.md, write the full diagnosis in the ledger, and continue with the next task.

Hard rules, no exceptions:
- Never create, read, move, or enter secret or key material. Where a card touches secrets or certificates, do the config/docs half, then record a "Human follow-ups" ledger line and stop that task at done-except-secrets.
- Never weaken a gate, skip a failing test, loosen a lint, or delete a test to get green. If a gate change is genuinely required, it needs its own justification paragraph in the ledger.
- No new runtime dependency without a ledger justification line (what, why, license, alternatives considered).
- Do not push, tag, or release. Commit locally only - unless my triggering message explicitly contains "Push is authorized."
- Documentation you write follows repo conventions: plain ASCII, hyphens for dashes, no emoji in docs/.
- If you hit a genuine design fork the card does not answer, record the options and your recommendation in the ledger, leave the task in_progress or blocked, and continue elsewhere. Do not invent product decisions - D1-D7 belong to Stephen.

When the wave is exhausted, finish with a summary: tasks done / blocked / skipped with one line each, total commits, final gate status, human follow-ups collected from the ledger, and which wave or unblocked stragglers should run next. Then stop. Do not start the next wave in the same session.
```

---

## Prompt B - human review protocol (Stephen)

Work through this after a wave run. Nothing merges on agent say-so; the ledger is a claim, this is the check.

```text
1. Fetch and inspect the branch:
   cd ~/Projects/CyberSkill/gam && git fetch --all && git switch auto/improve-gam-w<N>
   git log --oneline main..HEAD        # one commit per task, ids in bodies

2. Read docs/improvement/LEDGER.md for this wave top to bottom. Note every
   "Human follow-ups" line - these are your action items (secrets, repo
   settings, decisions).

3. Re-run the full gate yourself, trust nothing:
   pnpm install && pnpm lint && pnpm vite:build && pnpm test
   cd src-tauri && cargo clippy --locked -- -D warnings && cargo test --lib --locked && cargo deny check

4. Review per task, against the card's acceptance criteria, not the diff aesthetics:
   git show <sha>            # for each task commit
   Extra scrutiny anywhere the diff touches:
   - .github/workflows/ (pipeline integrity: pinned SHAs kept? permissions minimal?)
   - src-tauri/capabilities/, tauri.conf.json CSP/updater (security posture)
   - package.json / Cargo.toml dependency additions (ledger justification exists?)
   - anything near backups, exports, logging (no alias bodies or history content leaking)
   Spot-run one or two Verify commands from the cards.

5. Decide per task:
   - Accept: leave status done.
   - Bounce: set the task back to in_progress in BACKLOG.md with a reason,
     and note it in a REVIEW ledger entry. Re-trigger Prompt A later with
     "Rework the bounced tasks of wave <N> per the REVIEW entry."

6. Close the loop:
   - Complete your follow-up items (secrets, repo settings runbook, D-decisions).
   - Push the branch, open the PR, merge on green CI.
   - Flip accepted tasks done -> verified in BACKLOG.md (commit on main or the PR).
   - Append the REVIEW entry to LEDGER.md (accepted/partial/rejected, notes).

7. Sanity check the public surface before merge: docs/improvement/ is written
   to be publishable, but skim the diff for anything that should not be public
   (internal URLs, names, unpublished plans). Move such content to .agent/ if found.
```

---

## Decision quick-reference (blockers you own)

D1 Apple Developer Program -> unlocks GAM-050. D2 Azure Artifact Signing -> GAM-051. D3 bundle-id migration -> GAM-080. D4 open-core boundary -> GAM-090/091/092/094. D5 telemetry stance -> GAM-099. D6 product scope -> wave-5 shape. D7 org accounts (homebrew tap, winget publisher, npm 2FA) -> GAM-052/053. Closing a decision: state it in the Prompt A trigger message ("D1 is closed: secrets are set"), and the agent will pick up the gated tasks.
