# Agent instructions

These instructions apply to the entire fake-shop repository.

## Task execution

- Keep changes within the task's stated scope.
- Read the architecture, development, configuration, and testing documents relevant to the task before changing behavior.
- Preserve fake-shop's provider-neutral, local-first architecture.
- Do not introduce external-system concepts, infrastructure, or dependencies unless the task explicitly requires them.
- Run the validation commands required by the task and repository documentation before integration.

## Working tree safety

Before modifying files:

1. Inspect `git status`.
2. Identify pre-existing user changes.
3. Preserve all unrelated changes.
4. Do not discard, overwrite, stage, amend, reset, stash, or commit unrelated work.

When unrelated changes are present, name task files explicitly in Git commands. Do not use `git add .`.

## Git workflow

`main` is the single integration and release branch. Do not create or use a permanent `develop` branch.

Perform implementation work in a short-lived task branch unless the task explicitly requires work in the current branch. Recommended branch names:

- `task/<short-name>`
- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `refactor/<short-name>`

Intermediate commits are allowed in task branches. Every commit integrated into `main` must represent a validated, runnable state.

- Do not push directly to `main`; use the repository's normal review and integration process.
- Represent releases with version tags on `main`, not with permanent release or development branches.
- Commit only files attributable to the current task.
- Do not amend an existing user commit.
- Do not rewrite published history.
- Do not force-push unless explicitly instructed.
- Do not create a commit unless the task requires one.
- If the task requires exactly one commit, create exactly one task-scoped commit.
- If the task says to stop after committing, perform no further task actions after that commit.

Create annotated semantic-version tags only when explicitly requested, for example:

```bash
git tag -a v0.2.0 -m "fake-shop v0.2.0"
```

## Default validation

Unless the task specifies a different validation set, run:

```bash
pnpm run check
pnpm run test
pnpm run build
```

Run additional task-specific validation when required.
