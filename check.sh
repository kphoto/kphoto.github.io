#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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

log "1/9 bootstrap"
./scripts/bootstrap.sh
log "2/9 format check"
./scripts/format.sh --check
log "3/9 lint"
./scripts/lint.sh
log "4/9 typecheck (TypeScript 7)"
./scripts/typecheck.sh
log "5/9 typecheck (TypeScript 7.1 preview)"
./scripts/typecheck-next.sh
log "6/9 unit tests"
./scripts/test-unit.sh
log "7/9 build"
./scripts/build.sh
if (( RUN_E2E )); then
  if (( E2E_HOST )); then
    log "8/9 end-to-end tests (host, --e2e-host)"
    ./scripts/test-e2e.sh
  elif command -v "${CONTAINER_ENGINE:-podman}" >/dev/null 2>&1; then
    log "8/9 end-to-end tests (container — see ADR 0017)"
    ./scripts/test-e2e-container.sh
  else
    log "8/9 end-to-end tests (host — ${CONTAINER_ENGINE:-podman} not found)"
    ./scripts/test-e2e.sh
  fi
else
  log "8/9 end-to-end tests — skipped (--no-e2e)"
fi
log "9/9 export repository dump"
./export.sh >/dev/null
log "all checks passed ✔"
