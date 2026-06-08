# Git Hooks

Custom hooks that automate version bumping and tagging for this repo.

## Available Hooks

### pre-commit

Increments the **patch** version in root `package.json` when staging non-markdown files.

- Detects whether any non-`.md` files are staged
- If only markdown files are staged, version is left alone
- Bumps the patch number (e.g., `0.1.0` → `0.1.1`)
- Adds `package.json` to the current commit

### post-merge

Increments the version + creates a tag when `develop` is merged into `main`.

- Detects merges from `develop` to `main`
- Skips if only markdown files changed
- Bump type controlled by `VERSION_BUMP_TYPE` env var (set by `scripts/sync-master.mjs`):
  - `major` → `X+1.0.0`
  - `minor` → `X.Y+1.0` *(default)*
  - `patch` → `X.Y.Z+1`
- Creates `chore: bump version` commit on `main`
- Creates annotated tag `vX.Y.Z` with changelog
- Switches to `develop`, syncs the same version + commit, returns to `main`

## Installation

```bash
npm run hooks:install
```

Copies hooks from `.githooks/` to `.git/hooks/` and sets execute permissions.

## Uninstallation

```bash
npm run hooks:uninstall
```

## Notes

- Hooks are Bash + Node — works on Linux, macOS, and Windows (with Git Bash).
- Git does not track `.git/hooks/`, which is why hooks live under `.githooks/` here.
- Set `SKIP_VERSION_BUMP=1` to bypass the pre-commit hook in scripted contexts.
