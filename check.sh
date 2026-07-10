#!/usr/bin/env bash
# =============================================================================
# check.sh — run everything CI runs, locally, in the same order.
#
# Usage:  ./check.sh             # full suite; e2e runs in a container when
#                                # podman (or $CONTAINER_ENGINE) is available,
#                                # matching the CI environment exactly
#         ./check.sh --e2e-host  # force the browser tests onto the host
#         ./check.sh --no-e2e    # skip the browser tests entirely
#
# Order: bootstrap → format check → lint → typecheck → unit tests → build
#        → e2e tests → export.sh (regenerates docs/llm/dump.txt).
# Run this before pushing; if it passes here, it passes in CI.
# =============================================================================
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/scripts/lib.sh"
cd "$(repo_root)"

RUN_E2E=1
E2E_HOST=0
for arg in "$@"; do
  case "$arg" in
    --no-e2e) RUN_E2E=0 ;;
    --e2e-host) E2E_HOST=1 ;;
    *) die "unknown argument: $arg (supported: --no-e2e, --e2e-host)" ;;
  esac
done

log "1/8 bootstrap"
./scripts/bootstrap.sh
log "2/8 format check"
./scripts/format.sh --check
log "3/8 lint"
./scripts/lint.sh
log "4/8 typecheck"
./scripts/typecheck.sh
log "5/8 unit tests"
./scripts/test-unit.sh
log "6/8 build"
./scripts/build.sh
if (( RUN_E2E )); then
  if (( E2E_HOST )); then
    log "7/8 end-to-end tests (host, --e2e-host)"
    ./scripts/test-e2e.sh
  elif command -v "${CONTAINER_ENGINE:-podman}" >/dev/null 2>&1; then
    log "7/8 end-to-end tests (container — see ADR 0017)"
    ./scripts/test-e2e-container.sh
  else
    log "7/8 end-to-end tests (host — ${CONTAINER_ENGINE:-podman} not found)"
    ./scripts/test-e2e.sh
  fi
else
  log "7/8 end-to-end tests — skipped (--no-e2e)"
fi
log "8/8 export repository dump"
./export.sh >/dev/null
log "all checks passed ✔"
