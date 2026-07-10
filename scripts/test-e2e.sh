#!/usr/bin/env bash
# Run the Playwright end-to-end suite against a preview of the built site.
# Installs browsers on first run (and system deps in CI).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
if [[ ! -d dist ]]; then
  log "no dist/ found — building first"
  "$HERE/build.sh"
fi
if [[ "${CI:-}" == "true" ]]; then
  log "installing playwright browsers with system dependencies (CI)"
  yarn playwright install --with-deps
else
  log "ensuring playwright browsers are installed"
  yarn playwright install
fi
log "running end-to-end tests (playwright)"
yarn test:e2e
log "end-to-end tests complete"
