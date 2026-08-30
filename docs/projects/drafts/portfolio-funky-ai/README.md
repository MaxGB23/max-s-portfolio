# funky-ai — Portfolio Documentation

funky-ai is a CLI-driven framework for AI-assisted software development. It unifies agentic rules, spec-driven templates, and project-planning tools into a single Node.js CLI (run with pnpm). Everything is managed from the command line: template injection, configuration, and tooling. There is no GUI surface — the CLI is the single entry point for the entire ecosystem.

## How the pieces fit together

The framework is organized around one CLI with four working areas plus the practices that keep it honest:

```
funky-ai (Node.js CLI, pnpm)
│
├── SDD framework      funky sdd install · funky feature        → orchestrates development work
├── funkygram          funky engram add                          → persistent agent memory
├── funky-forge        funky init · assess · estimate · pipeline → planning, from idea to cost
├── funky secure       funky secure doctor · init · check        → dependency hardening (pnpm)
└── Practices          issue-first · GitHub Actions CI · release/docs protocols · TDD (Vitest)
```

- **SDD framework** orchestrates development as a deterministic pipeline (proposal → specs → design → tasks → apply → verify → archive), loading context just-in-time and scaling from one-file fixes to full architectural redesigns with isolated sub-agents. See `./sdd-framework.md`.
- **funkygram** is the file-based persistent memory that agents use as their knowledge base: Markdown observations stored in the repo, sharded by type, recalled on demand. See `./funkygram.md`.
- **funky-forge** converts a fuzzy idea into canvases, an architecture review, and an infrastructure cost estimate, with an optional pipeline that shares state between phases. See `./funky-forge.md`.
- **funky secure** hardens the pnpm dependency posture of a repo against supply-chain risk: diagnostics, idempotent policy application, and a CI-ready compliance gate. See `./funky-secure.md`.
- **Engineering practices** are the cross-cutting discipline: issues before code, automated CI, releases with living docs kept in sync with the real CLI, and TDD to hold scope. See `./engineering-practices.md`.

## Table of contents

| File | What it covers |
|------|----------------|
| [SDD Framework](./sdd-framework.md) | Spec-Driven Development orchestration: tiers, execution modes, phase pipeline, orchestrator role |
| [funkygram](./funkygram.md) | File-based persistent memory: Markdown knowledge base, shards, on-demand rule injection |
| [funky-forge](./funky-forge.md) | Project planning: init, assess, estimate, pipeline |
| [funky secure](./funky-secure.md) | Dependency hardening for pnpm repos: doctor, init, check |
| [Engineering practices](./engineering-practices.md) | Issue-first workflow, CI, releases, living docs, TDD with Vitest |

## Glossary

- **funkygram** — the file-based persistent memory system. In the repository it is documented as *engram* (`docs/funky-ai/engram.md`, `docs/engram/`); this portfolio renames it *funkygram* to avoid confusion with the original Engram product.
- **SDD** — Spec-Driven Development, the orchestration methodology behind the framework.

## Who this is for

- Developers who run AI-assisted coding at scale and want a repeatable, documented process instead of ad-hoc prompts.
- Teams that need determinism: spec-first changes, human approval gates, and artifacts a review can verify.
- Anyone doing Node/pnpm work who wants per-repo dependency hardening and honest cost planning before writing code.
- Engineers interested in the design decisions behind a CLI-only agent framework, including the tradeoffs that did not make the cut.

> Percentages are author estimates based on internal usage, not externally benchmarked metrics.
