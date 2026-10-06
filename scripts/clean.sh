#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/lib.sh"
cd "$(repo_root)"
log "removing dist/, coverage/, playwright-report/, test-results/"
rm -rf dist coverage playwright-report test-results
log "clean complete"
