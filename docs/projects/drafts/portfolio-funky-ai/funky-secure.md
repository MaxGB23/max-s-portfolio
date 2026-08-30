# funky secure — Dependency Hardening for pnpm Projects

*A per-repo "hardened project" standard: diagnostics, idempotent policy application, and a CI-ready compliance gate.*

## The problem

Modern supply-chain attacks do not steal code — they steal credentials, and they do it at install time. Malicious lifecycle scripts (`preinstall`/`postinstall`) in dependencies run the moment you run `pnpm install`, in exactly the window `npm audit` does not cover: by the time you audit, the script already ran. The ChainDrop / Shai-Hulud campaign (August 2026) is the reference threat: poisoned versions of widely-used packages, credential stealers, and hooks injected into editor configs (`keyv`, `flat-cache`, `file-entry-cache` and +440 packages, ~2,000 M installs/month). Freshly-published versions are the classic infection window, and committed secrets are the credential leak that does not even need a malicious package.

## What it does

funky secure hardens the dependency posture of a pnpm repository with three commands, assuming pnpm as the standard package manager:

- **`doctor`** — read-only diagnostics of the current hardening state, with actionable recommendations.
- **`init`** — applies the standard policy idempotently (safe to re-run).
- **`check`** — a CI-ready compliance gate with exit 0/1.

The philosophy is defense-in-depth centered on the person: a minimal global layer on the user's machine, plus the full standard applied uniformly per-repo. The design rationale and decisions live in the RFC `docs/funky-ai/feature-secure.md`; the CLI behavior is documented in `docs/funky-ai/secure.md`.

### Two planes of defense

| Plane | Scope | Principle |
|-------|-------|-----------|
| **Minimal global layer** | The user's machine | Only defenses no repo needs to disable: pure benefit, zero friction. Applied and verified by the user, never mutated by the CLI. |
| **Hardened project** | Each repo | The full standard, applied consistently by `funky secure init` and kept honest by `check`. |

The rule of thumb: the only thing that may be global is what no repository would ever want to turn off.

## How it works

### `funky secure doctor`

Writes nothing. Runs read-only probes and recommends exact commands:

```bash
funky secure doctor
# info: pnpm active: 11.5.0
# warn: Quarantine INACTIVE: nothing blocks deps <72h. Apply: pnpm config set minimum-release-age 4320 --location=global.
```

Detects: active pnpm version (read *behaviorally* via `pnpm config list --json`, since `config get` is blind for workspace keys on pnpm v10/11), quarantine status, duplicate pnpm installs on PATH, and repo signals — `package-lock.json` presence, floating `^`/`~` ranges, `.env*` tracked by git, hook baseline drift, and a funky-secure marker in `AGENTS.md`.

### `funky secure init`

Applies the policy idempotently:

1. **`pnpm-workspace.yaml`** — merges the posture seed (7 standard keys): `ignoreScripts: true`, `minimumReleaseAge: 4320`, `engineStrict: true`, `blockExoticSubdeps: true`, `trustPolicy: no-downgrade`, `verifyStoreIntegrity: true`, `allowBuilds: []`. The merge preserves existing keys, comments, and `packages:`; a conflicting existing value is kept and reported.
2. **`AGENTS.md`** — appends a package-manager block behind a `<!-- funky-secure -->` marker; never overwrites content, never duplicates.
3. **Hooks baseline** — snapshots `.vscode/tasks.json` and `.claude/settings.json` into `.funky/secure-state.json` to catch injected hooks by drift.
4. **`.gitignore`** — adds `.funky/` once.
5. **`packageManager` pin** — `"packageManager": "pnpm@<active version>"` in `package.json`.

The posture is a mandatory choice: with a TTY it is asked with no default; without a TTY, `--posture` is required. **`fail-silent`** seeds the 7 keys (nothing runs, including root scripts — opaque but total). **`fail-fast`** adds `strictDepBuilds: true` plus empty allow/ignore build lists (install fails on dependency build scripts until you decide; it does not cover root scripts and demands list maintenance).

### `funky secure check`

```bash
funky secure check    # CI gate: exit 0 conformant, exit 1 violations, fail-closed on probe failure
```

Reports violations by code: `missing-lockfile`, `package-lock` (npm/pnpm mixing), `floating-ranges` (`^`/`~`), `config-mismatch`, `quarantine-inactive`, `pending-approval`, `env-tracked`, `env-unignored`, `hook-drift`, and fail-closed `pnpm-probe`/`git-probe`. `--rebaseline` re-seeds the hook baseline explicitly; rebaseline is never automatic.

## Key decisions & tradeoffs

- **Per-repo policy over global settings.** The golden rule: the only global layer is what no repo needs to disable; anything a repo might want to override goes per-repo. Global mandates get bypassed and then protect nobody.
- **Never mutate the user's machine.** funky secure diagnoses, recommends the exact command, and verifies the user applied it — it never sets env vars or global config. A security tool that writes to the environment expands its own attack surface (the ChainDrop lesson: injected hooks). It does write to the repo, always with confirmation and idempotency.
- **Behavioral verification over `config get`.** pnpm v10/11 stopped reading behavior settings from `.npmrc` — that is design, not a bug. The quarantine check probes whether the resolver actually rejects immature versions (verified empirically: `pnpm_config_minimum_release_age=4320` blocks; `npm_config_...` does not) instead of trusting config introspection.
- **Quarantine of freshly-published versions.** `minimumReleaseAge: 4320` (72 h) hardens the window typical attacks exploit, on top of pnpm's own default (1440 min / 24 h in v11). The tradeoff: a legitimate hotfix can never be installed the minute it ships.
- **Posture choice instead of a single stance.** `fail-silent` (block everything including root scripts) and `fail-fast` (fail installs until a build decision is made, root not covered) are different philosophies; the RFC deliberately picks neither and asks the user at `init`.
- **Lightweight secrets checkpoint.** `check` detects committed-secret *presence and tracking* (`.env*` tracked by git, `.env` missing from `.gitignore`), not content or history scanning (gitleaks/trufflehog are out of scope). It catches the credential leak vector without the cost and noise of full secret scanning.
- **pnpm-only, and npm is not blocked.** The standard assumes pnpm; global npm tools depend on the npm update path, so protection for accidental npm use is rule + detection, not a hard shim or block.

## Impact

- Up to ~30% reduction in supply-chain incident risk (author estimate) — covering the two non-software vectors the threat model targets: risky lifecycle scripts and committed secrets.
- A repo converges to a known state via idempotent `init` and stays there via a CI gate that fails closed when probes break.
- The quarantine closes the freshness window that poisoned-version campaigns exploit.

## What's next

The RFC (`docs/funky-ai/feature-secure.md`) already sketches the roadmap beyond the v1 trio:

- **`funky secure audit`** — `pnpm audit` plus a live blocklist queried from GitHub Advisory DB / OSV, with a small local cache only as an emergency override.
- **`funky secure incident <slug>`** — generates an incident doc from an integrated template and scans the repo against its IoCs, keeping the list of known examples as documentation, not source of truth.
- **`funky secure approve`** — explicit build-approval flow via pnpm's `allowBuilds` per-version control.
- **`funky secure global`** — read-only status and recommendations for the minimal global layer, with the detect → recommend → verify loop (never sets anything).

> Percentages are author estimates based on internal usage, not externally benchmarked metrics.
