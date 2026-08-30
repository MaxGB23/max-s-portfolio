# funky-forge — AI-Assisted Project Planning Toolkit

*From a fuzzy idea to a costed architecture: canvases, architecture review, and infrastructure estimation driven from one CLI.*

## The problem

Project planning is where most software projects quietly go wrong. A vague idea jumps straight into code with no agreed definition of what is being built or for whom; the architecture discussion is unstructured and produces no decision record; and infrastructure costs are guessed late, after the stack has already been chosen. The result is a stack nobody reviewed, costs nobody estimated, and decisions nobody wrote down — all discoverable only after real money and time have been spent.

## What it does

funky-forge structures the pre-code phase into a sequence of commands, each producing a reviewable Markdown artifact:

| Command | Produces | Purpose |
|---------|----------|---------|
| `funky init` | Project canvases + planning guides | From fuzzy idea to sketched project |
| `funky assess` | Architecture review material | Stack evaluation, risk discussion, decision record |
| `funky estimate` | Pricing guide + session prompts | Infrastructure cost estimation and pricing agreements |
| `funky pipeline` | Shared phase state (`context.json`) | Orchestrates assess + estimate with traceability |

- **`init`** — creates the project canvases plus the planning guides.
- **`assess`** — prepares an architecture review session with a prompt, a decisions template, and a risk-patterns reference.
- **`estimate`** — generates a pricing discussion guide with cost factors and risk buffers, plus a prompt and a decisions template for the pricing session.
- **`pipeline`** — orchestrates assess + estimate with shared state, for teams and multi-session work.

The CLI prepares material; it does not pretend to judge architecture or pricing. The review and pricing conversations happen in an AI session guided by the generated prompts, and the outcomes are documented in living decision files.

## How it works

```
funky init  →  [funky sdd install]  →  funky assess  →  funky estimate
                                             ↓
                                   funky pipeline (optional)
```

**`funky init`** generates five files: `brief-funcional.md` (what is built and for whom), `PROJECT-CANVAS.md` and `INFRA-CANVAS.md` (the technical decisions), and two guides (`canvas-planning-guide.md`, `init-prompt.md`). Order matters: the brief lands first, "what" before "how". Project decisions are never overwritten automatically; guides ask Y/N before updating, and "user declined to update" is a successful completion, never an error. Without a TTY, guides are skipped and decisions are preserved.

**`funky assess`** reads the canvases (warning if sections are still marked `[Responde aquí]`), and generates `docs/funky-ai/assess/assess-prompt.md` (the first message for the AI session), `architecture-decisions.md` (the decision record), and `risk-patterns.md` (a team-editable reference of risk patterns to evaluate — candidates to judge, not confirmed risks). With `--context`, it also writes its phase state into the pipeline `context.json`, surfacing only the *names* of surfaced patterns as metadata.

**`funky estimate`** crosses the canvases with the architecture decisions and produces `docs/funky-ai/estimate/pricing-guide.md` — a declarative discussion guide with cost factors, buffers, and TCO. Optional topic sections (`--security`, `--multi-tenant`, `--concurrency`, `--transactions`, `--roles`, `--integrations`, `--pricing-team`) embed additively by marker: new sections are appended without touching existing ones, and no question is ever asked when nothing can be lost. Outputs include `estimate-prompt.md` and `pricing-decisions.md`.

**`funky pipeline`** shares state through `docs/funky-ai/pipeline/context.json` (schema v2): per-phase `status` (`pending|running|completed|failed|skipped`), timestamps, duration, artifacts, and errors. `pipeline assess` must run before `pipeline estimate`; `pipeline all` runs both and marks `estimate` skipped if `assess` fails; an interrupted phase left `running` re-runs on the next `all`; `pipeline status --json` emits one deterministic JSON object for integrations. A v1 `context.json` migrates to v2 automatically on read.

### Anti-patterns (explicitly documented)

- **`funky estimate` without `assess` first** — no architecture decisions means the estimate is generic and nearly useless.
- **`funky pipeline` on a small project** — `context.json` adds ceremony with no benefit; direct commands are faster.
- **Editing `context.json` by hand** — it is generated and updated automatically via the `--context` flag; manual edits desync it from reality.
- **`funky init` with canvases already present** — project decisions are deliberately never auto-overwritten; the command preserves them and recommends moving or deleting them (with a backup) if a fresh template is wanted.

### Feedback contract

Every forge command follows the same file-handling contract, so behavior is predictable in scripts and CI:

- **New file** — created without asking.
- **Guide exists** (regenerable templates like `assess-prompt.md`, `estimate-prompt.md`, `canvas-planning-guide.md`) — Y/N before updating; without a TTY the default is `n`, logged.
- **Decision exists** (`brief-funcional.md`, canvases, `risk-patterns.md`, `architecture-decisions.md`, `pricing-decisions.md`) — never overwritten; the command recommends moving or deleting with a backup.
- **Additive operation** (embedding a new pricing topic section) — runs without asking, because nothing can be lost.
- **Real error** (I/O, permissions) — clear message and exit 1.

The core rule: *a prompt is only shown when the operation could lose something*. "The user declined to update" is a successful completion, never an error.

## Key decisions & tradeoffs

- **Canvases first — "what" before "how".** The brief is generated before the technical canvases, forcing product definition to precede stack selection. The cost is an extra step for people who just want to prototype.
- **The CLI does not judge; it prepares.** The real risk analysis and cost decisions live in the AI-assisted discussion, not in the CLI's logic. This keeps the tool honest and the material reviewable, but it means the output quality depends on the discussion actually happening.
- **Decisions are never overwritten automatically.** Project decisions (`brief-funcional.md`, canvases, `risk-patterns.md`, `architecture-decisions.md`, `pricing-decisions.md`) are preserved; only regenerable guides ask Y/N. The tradeoff is occasional manual cleanup when a fresh template is genuinely wanted.
- **Additive embedding instead of regeneration.** The pricing guide only ever asks before a destructive rebuild; new sections are inserted by marker, preserving prior ones. This makes the guide a *living document* rather than a regenerable artifact.
- **Pipeline state is metadata only.** `context.json` tracks phase status, artifacts, and timestamps — never canvas content. Keeping the two planes separate avoids duplicating domain data and makes the state file trivially re-derivable.
- **One-size does not fit.** The golden rule is explicit: a one-person one-afternoon project uses direct commands; a team, multi-phase, or resumable project uses the pipeline. Overhead is only justified by need.

## Impact

- ~50% faster path from a fuzzy idea to a costed architecture (author estimate): the canvases, review material, and pricing guide replace ad-hoc docs and unstructured meetings.
- Every decision is written down in a living, reviewable file instead of living only in a chat transcript.
- Cost planning happens before the stack is locked in, when it can still change the architecture.

## What's next

- **Machine-readable integrations** — `pipeline status --json` already emits deterministic output; extending the JSON surface to more commands would open the door to CI dashboards and planning tooling.
- **Richer risk patterns** — `risk-patterns.md` is a candidate list evaluated by the team; seeding it from real project postmortems would make the reference more specific over time.
- **Cost model expansion** — the pricing guide's flags already cover roles, multi-tenancy, transactions, security, concurrency, integrations, and team cost; more domains would broaden coverage without changing the additive-embedding model.
- **Estimator feedback loop** — tying recorded pricing decisions back into future estimates would let each project improve the baseline for the next one.

> Percentages are author estimates based on internal usage, not externally benchmarked metrics.
