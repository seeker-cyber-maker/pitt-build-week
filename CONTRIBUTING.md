# Contribution Workflow

## The Rule That GitHub Cannot Enforce Here

This is a private repository on a plan that does not provide protected branches. Treat `main` as integration-only anyway.

1. Start from current `main`.
2. Work in your assigned `harness/<name>-<lane>` branch.
3. Keep edits inside your owned paths from `CONTROL/WORKBOARD.md`.
4. Run your acceptance check and update `HANDOFFS/<name>.md`.
5. Push the branch and open a pull request to `main`.
6. The integration owner verifies the handoff, reviews the diff, and merges only validated work.

## Before A Provider Test

- Copy `.env.example` to `.env` locally.
- Set a scoped, revocable test key outside Git.
- Verify the deterministic fallback before making any live request.
- Never put a key in source, a commit, a pull request, a handoff, a screenshot, or an issue.
