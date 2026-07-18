# Collaborators

## Patrick Simard (`psimardgit`)

- **Repository role:** Write collaborator.
- **Assigned lane:** AI/report boundary.
- **Branch:** `harness/patrick-ai-report`.
- **Owned paths:** `packages/ai/`, `tests/ai/`, `.env.example`, `HANDOFFS/Patrick.md`.
- **Do not modify:** UI, scenario engine, integration files, repository settings, deployment, or shared scope documents.

## Adding Another Collaborator

Assign one bounded lane and one worktree before granting write access. They should use a `harness/<name>-<lane>` branch, commit their own work, and update a matching `HANDOFFS/<name>.md` file. The integrator reviews the collation report before merging.

## Secrets

No API key belongs in Git history, handoffs, issues, screenshots, or prompts. The repository includes `.env.example` as a list of required variable names only. A key is assigned outside Git when the relevant provider lane is ready to test.
