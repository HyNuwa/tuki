# Agents

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `HyNuwa/tuki` (via `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Team workflow (mandatory for every agent and human)

Two members split the work at the chain/server boundary. Names, slugs and roles: `docs/equipo.md`.

1. **Identify who is working.** Run `git config tuki.member` (`maximiliano` or `alexxe`). If it is empty, ask the user who they are and tell them to run `git config tuki.member <slug>`; never guess. Hooks must be on: `git config core.hooksPath` prints `.githooks`.
2. **Before a task, read in order:** `odd/specs/README.md` (owner column), the spec you work on and the parent sections it names, `docs/tareas/README.md` (areas, shared interfaces, cross review), `docs/tareas/<slug>.md`, and both members' `docs/miembros/<slug>/estado.md`.
3. **Write only inside your area** (`docs/tareas/README.md`) and the spec's edit surfaces. Work in the other member's area is agreed first and noted in their task list.
4. **Shared interfaces** (M1 §3 and M2a §7) change together in one commit, with the other member's approval in the PR.
5. **Every commit that changes files outside `docs/` and `odd/`** also prepends an entry to `docs/miembros/<slug>/bitacora.md` (Spanish: date, commit message, `Qué hice`, `Archivos clave`, `Próximo paso`) and updates `estado.md` (date, focus, next step, blockers). Ideas go to `ideas.md`. The `pre-commit` hook enforces it; never use `--no-verify`.
6. **Edit only your own `docs/miembros/<slug>/` folder.** Shared docs (`docs/tareas/`, `docs/equipo.md`, `odd/`): add, don't rewrite the other member's content.
7. **Commits:** English Conventional Commits, ASCII only, subject ≤ 72 characters (`commit-msg` hook). Scopes: `contracts`, `api`, `web`, `verifier`, `domain`, `demo`, `specs`, `docs`, `repo`. No AI attribution lines.
8. **Cross review:** funds or signatures (`packages/contracts/`, `apps/verifier/`, relayer) are reviewed by `alexxe`; personal data (ingestion, redaction, storage, buyer responses) by `maximiliano`. PRs use `.github/pull_request_template.md`.
9. **Secrets:** keys only in environment variables or untracked `.env` files; the `pre-commit` hook scans every diff. Never write keys, receipts or personal data in the repo; the repo is public.
10. **"What is X working on?"** Resolve the name in `docs/equipo.md`, read their `estado.md` and latest `bitacora.md` entries, and give the date of the last update.
