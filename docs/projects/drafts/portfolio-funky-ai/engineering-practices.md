# Engineering Practices — Process, CI, and Docs Discipline

*The cross-cutting discipline that keeps the framework honest: issues before code, automated CI, living docs, and TDD to hold scope.*

## The problem

A well-designed framework still fails if the process around it is loose. Code lands without an issue to trace it to, so nothing is triaged and review has no contract to check against. Tests run only on a developer's machine, so broken code reaches the repo unnoticed. Documentation drifts from the real CLI until nobody trusts it. And without a scope discipline, implementations balloon with out-of-scope work that must be reworked. These are process failures, not framework failures — and they compound: the bigger the tooling, the more damage loose process does.

## What it does

- **Issue-first workflow** — every PR starts from a triaged GitHub issue; hotfixes are documented right after the merge. No code before an issue exists.
- **CI/CD with GitHub Actions** — automated builds and tests on every push and pull request, so the machine, not memory, gates the merge.
- **Release & docs protocols** — a structured release process (version bumps, release notes, tags) with *living documentation* kept in sync with the real CLI.
- **Testing & TDD with Vitest** — test-driven development that keeps implementations strictly within scope and prevents drift.

## How it works

### Issue-first workflow

An issue is the contract for a change. The PR references it, review checks the diff against it, and the issue stays as the traceable record of intent. For hotfixes that bypass the flow under urgency, the issue is written immediately after the merge so no change exists without one.

### CI/CD with GitHub Actions

The CI workflow (`.github/workflows/ci.yml`) runs on `push` to `main` and on `pull_request`, on a fresh `ubuntu-latest` runner:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha>            # pinned to a commit SHA, not a tag
      - uses: pnpm/action-setup@<sha>           # exact pnpm version
      - uses: actions/setup-node@<sha>          # Node 22, pnpm cache
      - run: pnpm install --frozen-lockfile     # reproducible install
      - run: pnpm test                          # vitest run, one-shot
```

CI pins its own toolchain (checkout, pnpm setup, Node) to commit SHAs — the supply chain of CI is not just the dependencies — and installs with `--frozen-lockfile` so the lockfile, not resolution, decides versions. The test runner's local/CI split is deliberate: `vitest run` in CI executes once and exits (ideal for a robot), while watch mode stays for the developer's machine.

### Testing & TDD (Vitest)

- One official test folder, `tests/` — the single source of truth. Scattered folders (`test/` vs `tests/`) are a lethal CI antipattern: the robot runs only what its pattern sees, and a passing green check hides failing tests the runner never looked at.
- TDD follows Red → Green → Refactor: write a failing test, write the minimum code to pass, improve. Code born this way is testable and well-shaped by construction.
- Vitest is the runner of choice for the CLI (fast, native TypeScript, Jest-compatible API); the testing-landscape study (`docs/funky-ai/conceptos/estudio/testing-landscape.md`) documents the pyramid — unit at the base, integration, E2E — and the tool selection rationale.

### Release & docs protocols

- Structured releases: version bump, release notes, git tag, publish — never a single final push that swallows earlier commits.
- Living docs are verified against the real CLI (a docs-sync pass reads the source of truth and checks flags and commands against actual behavior) instead of being written from memory, so the docs and the binary cannot drift silently.

### Rules vs. skills (the context-economy principle)

The framework enforces a split that also guides its own practices: *rules* (`.agents/rules/`) are passive guardrails — state assertions like "always use pnpm" — while *skills* (`.agents/skills/`) are active workflows with steps, loaded only when invoked. Procedural weight in a rule bleeds tokens on every turn; workflows belong in skills. This is the same Just-In-Time discipline that drives the SDD framework's context loading.

## Key decisions & tradeoffs

- **Issue-first over code-first.** Requiring an issue before code adds a triage step but gives review a contract, keeps the changelog traceable, and kills drive-by changes that nobody scoped.
- **A single `tests/` folder as SSOT.** Consolidating scattered test directories costs a one-time migration but removes the CI blind spot where the robot "passes" while real tests fail unseen.
- **CI pins its own toolchain to SHAs.** Trusting `latest` tags on the CI pipeline would make the merge gate depend on mutable third-party code; SHA pins trade convenience for determinism.
- **`vitest run` in CI vs watch locally.** One-shot mode ends cleanly with a process exit code the robot can read; watch mode is reserved for the interactive loop where it adds value.
- **TDD to prevent scope creep.** Writing the test first fixes the contract of a change before implementation, so "done" is defined by a passing test, not by an ever-growing diff. The tradeoff is the discipline itself: skipping red-green-refactor under pressure buys speed today and rework later.
- **Docs verified against the CLI, not from memory.** A docs-sync pass that checks real commands and flags treats documentation as a tested artifact. It costs tooling, but it is what keeps the docs trustworthy enough to be a single source of truth.

## Impact

- ~40% fewer out-of-scope rework loops (author estimate) — TDD defines "done" by test contract, and issue-first prevents un-triaged drift.
- CI gates every push and PR on a fresh machine with a reproducible install, so "works on my machine" is no longer a defense.
- Living docs stay synchronized with the real CLI, so commands and flags in the docs are the commands and flags the binary actually implements.

## What's next

- **Wire `funky secure check` into CI** — the RFC already plans the compliance gate (`funky secure check` / `audit`) as a CI step, not just a local command.
- **Add E2E coverage** — the testing-landscape study names Playwright as the E2E choice for the stack; automating browser-level flows would complete the pyramid.
- **Broader docs-sync coverage** — extending the verified-docs pass to every command family (forge, secure) keeps the SSOT property as the CLI grows.
- **Dependabot policy** — the secure RFC sketches a merge policy for dependency PRs (lockfile-only diffs, no stray `package-lock.json`, audit gates); formalizing it closes the last unautomated supply-chain review.

> Percentages are author estimates based on internal usage, not externally benchmarked metrics.
