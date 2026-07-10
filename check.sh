#!/usr/bin/env bash
# =============================================================================
# check.sh — run everything CI runs, locally, in the same order.
#
# Usage:  ./check.sh            # full suite including Playwright e2e
#         ./check.sh --no-e2e   # skip the browser tests (they need browsers)
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
for arg in "$@"; do
  case "$arg" in
    --no-e2e) RUN_E2E=0 ;;
    *) die "unknown argument: $arg (supported: --no-e2e)" ;;
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
  log "7/8 end-to-end tests"
  ./scripts/test-e2e.sh
else
  log "7/8 end-to-end tests — skipped (--no-e2e)"
fi
log "8/8 export repository dump"
./export.sh >/dev/null
log "all checks passed ✔"
