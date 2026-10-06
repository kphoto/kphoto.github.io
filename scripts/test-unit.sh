#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
log "running unit tests with coverage (vitest)"
yarn test:coverage
log "unit tests complete"
