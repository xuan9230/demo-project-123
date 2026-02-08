---
name: check-commit-name
description: Validate Git commit message headers for this monorepo. Use when preparing a commit, reviewing commit quality, or fixing a rejected commit message to ensure it follows the project's Conventional Commit style, allowed scopes, and length/tone constraints.
---

# Check Commit Name

Validate commit message headers with `scripts/check_commit_name.py`.

## Workflow

1. Collect the commit header to validate (first line only).
2. Run:

```bash
python3 .codex/skills/check-commit-name/scripts/check_commit_name.py "<commit header>"
```

3. If it fails, rewrite the message using the reported issues and examples.
4. Re-run until validation passes.

## Rules Enforced

- Format: `<type>(<scope>)?: <subject>`
- Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
- Allowed scopes: `backend`, `frontend`, `landing`, `docs`, `monorepo`, `infra` (scope optional)
- Header max length: 72 chars
- Subject must start lowercase
- Subject must not end with `.`

## Examples

- Valid: `feat(frontend): add auth guard for listing page`
- Valid: `fix: handle missing env var in startup`
- Invalid: `Feature: Add Login`
- Invalid: `feat(api): Add Login.`
