# funkygram — File-Based Persistent Memory

*The agent knowledge base: structured Markdown observations stored in the repo, sharded by type, recalled on demand.*

## The problem

AI agents have no reliable long-term memory across sessions. Knowledge captured in one session — a root-cause analysis, a decision with tradeoffs, an edge case found the hard way — is lost when the context window closes, and the next session starts blind and re-learns everything from scratch. The common workaround is to reload monolithic context dumps, which is expensive in tokens and buries the signal in noise. What is needed is a durable, cheaply-recallable knowledge base that lives where the work happens.

## What it does

funkygram is a file-based persistent memory system built entirely on Markdown files inside the repository. No external database, no service to run:

- **Structured entries** — each observation is one Markdown file with a fixed schema: `What`, `Why`, `Where`, `Learned`.
- **Sharding by type** — observations are filed under one of seven categories, giving O(1) reads: you know the category, you know the directory.
- **Central index** — every new entry is auto-linked into `docs/engram/index.md` under its category section.
- **On-demand rule injection** — the CLI injects the protocol rule into `.agents/rules/` the first time it is needed, so agents capture knowledge even in projects that never ran a full scaffold.
- **Tooling without tooling** — capture works interactively or fully flagged for agents, and recall is plain file reads plus the index.

## How it works

```bash
funky engram add                       # interactive
funky engram add --tag fix-cors --category bugfix --desc "Fixes CORS in preflight"   # agent-friendly
```

Each entry produces a file and updates the index:

```markdown
### [bugfix][fix-cors] Fixes CORS in preflight

**Date:** 2026-01-15
**What:**
**Why:**
**Where:**
**Learned:**
```

Seven categories map to the shard directories created by `funky sdd install`:

| Category | Captures |
|----------|----------|
| `architecture` | Structural changes and component design |
| `pattern` | Conventions and idioms adopted |
| `discovery` | Edge cases, unexpected behaviors, learnings |
| `decision` | Decisions with explicit tradeoffs (library X over Y) |
| `bugfix` | Fixed bugs, root cause, applied solution |
| `session` | Work-session summaries (accomplished / next steps) |
| `release` | Release notes, versions, changelog |

Setup is automatic: `funky sdd install` pre-creates the rules and shard directories; without it, `funky engram add` injects the missing rule and creates the folders on demand the first time. Tags are sanitized to kebab-case, existing tags are never overwritten (the command warns and aborts), and the index is always kept current by the CLI.

The capture protocol is also embedded in the SDD orchestrator's close-out checklist: register pending findings, save a session summary, and update `ORCHESTRATOR-STATE.md` so the next agent to pick up the project is not starting blind (see `docs/funky-ai/conceptos/orquestador-sdd.md`).

### Recall workflow

Recall is deliberately low-tech and cheap: the orchestrator's first move when an unknown concept comes up is a targeted read of `docs/engram/` (directory listing plus search), never a blind global scan. The index gives a one-hop entry point per category; the shard directories make reads O(1). No database query, no external service — the memory is plain files the same way the project is.

### When to capture

The capture protocol is timing-sensitive, and the docs state it explicitly:

- **Bugfix** — immediately after fixing, before moving to the next task.
- **Decision** — at the moment the decision is made, while tradeoffs are fresh.
- **Discovery** — the moment something unexpected shows up that could matter later.
- **Architecture** — before or right after a structural change.
- **Pattern** — when a convention is set or a solution is repeated a second time.
- **Session** — at the end of a work session.

## Key decisions & tradeoffs

- **Markdown files as the knowledge base over a database.** Plain files are diffable, reviewable in the same PR flow as code, and portable across machines with zero infrastructure. The cost is a slower-than-SQL recall for fuzzy queries — mitigated by the category shards and the central index.
- **Sharding by type for O(1) reads.** Instead of one flat directory or a tag scan, recall goes straight to the right shard. The tradeoff is a fixed taxonomy: an entry that spans categories must pick the dominant one.
- **Structured schema over free-form notes.** `What/Why/Where/Learned` forces the writer to capture motivation and location, not just a description — at the cost of a small amount of ceremony per entry.
- **On-demand rule injection.** Injecting the capture rule only when needed keeps projects that never use memory clean of agent scaffolding, while still making the protocol self-installing for those that do.
- **Never overwrite.** A refusal to overwrite existing tags protects history at the cost of occasionally needing a new tag when a topic genuinely evolves.
- **Complement, not replacement.** funkygram deliberately does not replace tests or API documentation; it is contextual knowledge that supplements them.

## Impact

- ~30–50% cheaper memory recall than reloading monolithic context (author estimate), because recall reads a single shard file instead of the full project.
- Root causes, decisions, and edge cases survive session boundaries and are available to any future agent without re-derivation.
- Works standalone: a project can adopt memory without adopting the full SDD framework.

## What's next

- **Richer recall** — today recall is index navigation plus file reads; adding lightweight search or cross-shard correlation would close the gap with a database while keeping the file-based model.
- **Topic evolution** — a policy for updating an existing entry when a topic genuinely evolves (rather than always creating a new tag) would reduce index clutter while preserving history.
- **Deeper orchestrator integration** — the close-out checklist already mandates session saves; wiring verification that the checklist actually ran would make persistence less dependent on discipline.
- **Index quality** — as the index grows, pruning or archiving stale entries keeps the O(1) shard model honest.

> Percentages are author estimates based on internal usage, not externally benchmarked metrics.
