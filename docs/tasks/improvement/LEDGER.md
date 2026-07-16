# GAM improvement ledger

Append-only execution log. Every completed, blocked, or skipped task gets an entry. Newest entries at the top of its wave section. Never edit past entries; corrections get a new entry referencing the old one.

Entry format:

```
### GAM-XXX <title> - <status: done|blocked|skipped>
- Date: YYYY-MM-DD
- Branch/commits: auto/improve-gam-wN / <shas>
- Gate: lint <pass> | build <pass> | vitest <n>/<n> | clippy <pass> | cargo test <n> | deny <pass>
- Evidence: <verification commands run and their key output>
- Deviations: <anything done differently from the card, and why; "none" otherwise>
- Human follow-ups: <secrets to set, settings to flip, decisions surfaced; "none">
```

Review entries (Prompt B) use:

```
### REVIEW wave <N> - <accepted|partial|rejected>
- Date, reviewer, PR link
- Tasks verified: GAM-...
- Tasks bounced: GAM-... (reason, status reset to in_progress)
- Notes
```

---

## Wave 0

(no entries yet)

## Wave 1

(no entries yet)

## Wave 2

(no entries yet)

## Wave 3

(no entries yet)

## Wave 4

(no entries yet)

## Wave 5

(no entries yet)
