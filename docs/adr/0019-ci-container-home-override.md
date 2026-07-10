# 19. The CI e2e container job pins HOME=/root for Firefox

Date: 2026-07-10

## Status

Accepted

## Context

The `verify / e2e` job runs inside the official Playwright image
(ADR 0017). GitHub Actions mounts its own home volume into job containers
and points `$HOME` at `/github/home`, while the job's processes run as
root. Firefox refuses to start when `$HOME` is not owned by the user
launching it, and every firefox-project test failed at browser launch:

```
Firefox is unable to launch if the $HOME folder isn't owned by the current
user. Workaround: Set the HOME=/root environment variable in your GitHub
Actions workflow file when running Playwright.
Running Nightly as root in a regular user's session is not supported.
($HOME is /github/home which is owned by pwuser.)
```

The same suite passes in the same image under podman locally because
rootless podman leaves the container's `$HOME` at `/root`, owned by the
in-container root user — the mismatch is specific to how Actions wires job
containers. Chromium and WebKit do not perform this ownership check, which
is why only firefox failed.

Two remedies exist. Running the job as the image's `pwuser`
(`options: --user 1001`) also aligns ownership, but the job's first step is
`corepack enable`, which symlinks into root-owned `/usr/local/bin` and
would fail for an unprivileged user. Overriding `HOME` keeps the root user
and is the workaround Playwright's own error message and container
documentation prescribe.

## Decision

Set `HOME: /root` as job-level `env` on the `e2e` job in
`.github/workflows/verify.yml`. Job level rather than step level so every
step — checkout, corepack, setup-node's yarn cache, bootstrap, build,
tests — agrees on one home directory instead of splitting caches and
`.gitconfig` writes across two.

## Consequences

Firefox launches in CI; the container job and the local podman run agree on
`$HOME` again. The GitHub-provided `/github/home` volume goes unused by
this job, which costs nothing — the job container is ephemeral and nothing
in this repository persists state there. If a future job ever runs as a
non-root user, this override must be revisited together with the corepack
step (see the `--user 1001` note above).
