#!/usr/bin/env bash
# Run the Vitest unit suite with V8 coverage.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
log "running unit tests with coverage (vitest)"
yarn test:coverage
log "unit tests complete"
