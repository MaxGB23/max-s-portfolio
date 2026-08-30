# funky-ai — Experience Highlight

**funky-ai** is a CLI-driven framework for AI-assisted software development. It unifies agentic rules, spec-driven templates, and project-planning tools into a single Node.js CLI.

## What it is

- **CLI-first by design** — everything is managed from the command line: template injection, configuration, and tooling; no GUI surface.
- **funky-ai SDD framework** — Spec-Driven Development orchestration with Just-In-Time context loading. Scales from quick one-file fixes (Tier 1) to full architectural redesigns with isolated sub-agents (Tier 3). *Author estimate: up to ~40% lower token consumption vs. always-loaded full context.*
- **funkygram** — a lightweight, file-based persistent memory system built on Markdown files (no external database), used as the agent knowledge base. *Author estimate: ~30–50% cheaper memory recall than reloading monolithic context.*
- **funky-forge** — project planning toolkit: `init` (project & infra canvases), `assess` (architecture review with dynamic questions), `estimate` (infrastructure cost estimation). *Author estimate: ~50% faster path from a fuzzy idea to a costed architecture.*
- **funky secure** — dependency hardening for pnpm projects: `doctor` (read-only diagnostics), `init` (idempotent policy application), `check` (CI-ready gate). *Author estimate: up to ~30% reduction in supply-chain incident risk (secrets, risky lifecycle scripts).*

## Engineering practices

- **Issue-first workflow** — every PR starts from a triaged GitHub issue; hotfixes are documented right after the merge. No code before an issue exists.
- **CI/CD with GitHub Actions** — continuous integration pipelines for automated builds and checks.
- **Release & docs protocols** — structured release process (version bumps, release notes, tags) with living documentation kept in sync with the real CLI.
- **Testing & TDD** — Vitest-based test suites; TDD keeps implementations strictly within scope and prevents drift. *Author estimate: ~40% fewer out-of-scope rework loops.*

> All percentages are author estimates based on internal usage, not externally benchmarked metrics.
