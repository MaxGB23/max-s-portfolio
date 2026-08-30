# SDD Framework — Spec-Driven Development Orchestration

*A deterministic phase pipeline for AI-assisted changes, with context loaded just-in-time instead of all at once.*

## The problem

Large AI-assisted tasks that start from a single massive prompt fail in predictable ways: the context window overflows, the model hallucinates on parts it no longer remembers, and there is no natural point for a human to intervene. Delegating to sub-agents without structure lets each agent contaminate the shared context with implementation detail, and every session wastes tokens re-loading context the work does not need. The result is an unstructured process where quality depends on luck and a single token budget.

## What it does

SDD (Spec-Driven Development) fragments a change into a deterministic pipeline of phases, each producing a Markdown artifact the next phase consumes:

- **Proposal → Specs → Design → Tasks → Apply → Verify → Archive**, with a conditional post-archive step that fills release notes and docs when the change warrants it.
- **Just-In-Time context loading**: agents only see what their phase needs, protecting the token window.
- **Three orchestration tiers** that scale effort to impact.
- **Three execution modes** so the same process runs in a CLI, an IDE with native sub-agents, or a legacy chat-only IDE.
- An **orchestrator/sub-agent split**: one role plans, delegates, and persists knowledge; the other executes isolated work.

## How it works

The framework is materialized into a project with two commands:

```bash
funky sdd install   # injects agent rules, SDD templates, ORCHESTRATOR-STATE.md, docs/engram/ shards
funky feature <name>   # scaffolds a change under openspec/changes/<name>/ for a chosen tier
```

`funky sdd install` copies 23 agent rules into `.agents/rules/`, 8 SDD templates plus a shared docs index into `.agents/templates/sdd/`, an RFC template into `openspec/rfcs/`, and creates the 7 engram shard directories under `docs/engram/`. `runScaffold()` builds a pure array of *intentions* (`copy`, `create`, `mkdir`) that `executeIntentions()` applies, so the logic is unit-testable without touching the filesystem.

### Pre-flight

Every change starts with a structured proposal before any solution is drafted. The orchestrator determines the tier and asks the human to confirm:

```
funky feature <name>
Tier: [T1/T2/T3]
Docs: [Yes/No]
Mode: [Interactive/Auto/Handoff]
```

Only after the human confirms the tier is the matching router rule loaded (`tier1-router.md`, `tier2-router.md`, or `tier3-router.md`) — the first Just-In-Time decision. Pre-flight also validates the environment before execution.

### Phases and artifacts

The phase pipeline is backed by templates injected into `.agents/templates/sdd/`, so every phase produces a consistently-shaped Markdown artifact:

| Phase | Template | Produces |
|-------|----------|----------|
| Explore | `explore.md` | Understanding of the current codebase |
| Propose | `proposal.md` | A proposed approach with alternatives |
| Spec | `spec.md` | Delta specifications for the change |
| Design | (Tier 3) | Architecture design of the change |
| Tasks | `tasks.md` | Implementation task breakdown |
| Apply | — | The implementation itself |
| Verify | `report.md` | Validation against the spec |
| Archive | `release-checklist.md`, `release-notes.md`, `docs.md` | Closed and documented change |

Templates are resolved with local golden templates first (`.agents/templates/sdd/`), falling back to the CLI's bundled copies with a warning when the fallback is used. The pipeline stops strictly at Git operations to request human approval before the change is closed.

### Tiers

| Tier | Scale | Flow |
|------|-------|------|
| **T1 (Flash)** | 1–2 files | Inline: the orchestrator plans mentally and executes via a Worker skill. No generated documents. |
| **T2 (Standard)** | 3–5 files | Delegation through lightweight sub-agents, one per phase (Explore, Propose, Spec, Tasks, Verify, Archive), each backed by an injectable template. |
| **T3 (Insano)** | Complex refactors / architectural redesigns | Deep SDD workflow with native isolated sub-agents, adding a Design phase and NFR validation. Global orchestrator context never gets contaminated. |

Tier selection happens at pre-flight: the orchestrator proposes `funky feature <name>` with tier, docs impact, and mode, and the human confirms before the relevant router rule is even read — the first JIT decision.

### Execution modes

- **Interactive (recommended)** — pauses between key phases for human review; the agent enters an *idle* state and waits without spending tokens re-initializing.
- **Auto** — continuous flow; still asks for human validation before destructively modifying code.
- **Handoff (legacy IDE)** — emits a strict copy-paste block to continue the chain in a new chat when the IDE cannot call native sub-agents.

### Role separation

The **orchestrator** does not write code unless explicitly assigned as Worker: it plans, coordinates, delegates, and persists knowledge to disk (`docs/engram/`, `ORCHESTRATOR-STATE.md`). **Sub-agents** execute phase work in isolation and return findings in a strict format with exact locations, keeping the main prompt clean. Anti-workflow-spam is enforced: slash commands such as `/funky-propose` are restricted to Tier 3 and never suggested for lower tiers.

## Key decisions & tradeoffs

- **Just-In-Time context over always-loaded context.** Loading full project context costs tokens on every turn even for trivial work; JIT means the orchestrator waits in a low-token state until the tier is confirmed and only then reads the matching router rule. The cost is a deliberate pre-flight step before work begins.
- **Tiers instead of a single pipeline.** A one-size process would make tiny fixes heavy and large redesigns shallow. Tiers add selection complexity at pre-flight but keep effort proportional to impact.
- **Markdown artifacts as the handoff medium.** Phases exchange structured files (`spec.md`, `tasks.md`, ...) rather than live shared state. This keeps phases decoupled and auditable, at the price of some ceremony on small changes.
- **Isolated native sub-agents for Tier 3.** Delegating a huge implementation to a separate thread prevents orchestrator token explosion and context contamination; the cost is orchestration overhead and the need for strict report formats.
- **Orchestrator as planner, not coder.** Restraining the orchestrator from writing code keeps it from drifting into implementation and abandoning the plan; the tradeoff is an extra delegation hop for trivial work.
- **Human gates around Git and destructive edits.** Auto mode still stops before destructive operations; the post-archive release step halts strictly on Git operations. This slows the fast path but guarantees nothing ships without consent.

## Impact

- Up to ~40% lower token consumption versus always-loaded full context (author estimate) — the primary goal of JIT loading.
- Small fixes skip document generation entirely (Tier 1), keeping the cheap path cheap.
- Human gates at design and Git operations reduce out-of-scope and unreviewed changes.

## What's next

- **Deeper post-archive automation** — the conditional release step (release-checklist + docs) already halts on Git for approval; the natural next step is wiring it into release tooling.
- **Richer risk evaluation** — the Tier 3 `risk-decision.md` rule is where critical decisions are scored; expanding its inputs from NFRs to cost and security signals would strengthen the gate.
- **Broader handoff coverage** — as more IDEs grow native sub-agent support, the legacy handoff mode can fade while its copy-paste chain becomes a debug fallback.
- **Living-specs workflow** — the project has migrated to delta specs merged via a checksum-validated workflow (`docs/engram/index.md`); formalizing that as part of the SDD archive phase removes the final manual step.

> Percentages are author estimates based on internal usage, not externally benchmarked metrics.
