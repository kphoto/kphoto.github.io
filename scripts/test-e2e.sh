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
# The official Playwright image bakes matching browsers into the path named
# by PLAYWRIGHT_BROWSERS_PATH, so nothing needs downloading there (ADR 0017).
# --no-shell skips the Chrome Headless Shell everywhere else: the chromium
# projects run the real browser via channel 'chromium' instead (ADR 0016).
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
