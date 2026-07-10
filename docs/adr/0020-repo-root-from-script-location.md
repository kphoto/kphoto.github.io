# 20. Scripts derive the repo root from their own location, not git

Date: 2026-07-10

## Status

Accepted

## Context

Every script sources `scripts/lib.sh` and starts with `cd "$(repo_root)"`.
`repo_root()` shelled out to `git rev-parse --show-toplevel`, which fails
inside the CI e2e container: the checkout is owned by the runner's uid
while the scripts run as root, so git's dubious-ownership protection
refuses to treat the directory as a repository. The CI log showed
`[error] not inside a git repository` at the top of `scripts/test-e2e.sh` —
and then, alarmingly, the script _kept running_. The `die` fired inside the
`$( )` command substitution, so it terminated only that subshell; the
captured output was empty, and `cd ""` in bash is a silent no-op that
leaves the caller in its current directory, which happened to be the
workspace. Every script's safety net was working by coincidence.

Fixing this with `git config --global --add safe.directory` would paper
over one environment while keeping the git dependency (and the
subshell-swallowed `die`) everywhere else. The scripts don't actually need
git to find the root: `lib.sh` has exactly one location in the tree,
`<repo root>/scripts/lib.sh`.

## Decision

`repo_root()` resolves `lib.sh`'s own path (`readlink -f` on
`BASH_SOURCE`) and returns its grandparent directory, inside an explicit
subshell so calling it can never change the caller's working directory:

```bash
repo_root() {
  (cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/.." && pwd)
}
```

No git invocation, no ownership sensitivity, no failure mode that a
command substitution can swallow — the same deterministic answer on the
Fedora host, under rootless podman, and in the Actions container.
`export.sh` still uses git heavily, correctly so: it dumps _tracked_ files
and runs only on the developer host where the repository is owned by the
developer.

## Consequences

The spurious CI error disappears and scripts stop depending on an
accident of bash's `cd ""` behaviour. Scripts now assume the
`scripts/lib.sh` location is stable — true by construction, and any move
would be a deliberate restructuring touching every script anyway. Symlinked
checkouts resolve through `readlink -f` to the physical location, which is
the desired behaviour for locating sibling files.
