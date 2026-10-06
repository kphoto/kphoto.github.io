#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
if [[ ! -d dist ]]; then
  log "no dist/ found — building first"
  "$HERE/build.sh"
fi
if [[ -n "${PLAYWRIGHT_BROWSERS_PATH:-}" && -d "${PLAYWRIGHT_BROWSERS_PATH:-}" ]]; then
  log "using browsers preinstalled at $PLAYWRIGHT_BROWSERS_PATH"
elif [[ "${CI:-}" == "true" ]]; then
  log "installing playwright browsers with system dependencies (CI)"
  yarn playwright install --with-deps --no-shell
else
  log "ensuring playwright browsers are installed"
  yarn playwright install --no-shell
fi
log "running end-to-end tests (playwright)"
yarn test:e2e
log "end-to-end tests complete"
