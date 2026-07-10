#!/usr/bin/env bash
# Remove build and test artifacts (keeps node_modules).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
log "removing dist/, coverage/, playwright-report/, test-results/"
rm -rf dist coverage playwright-report test-results
log "clean complete"
