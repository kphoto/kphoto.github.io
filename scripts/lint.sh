#!/usr/bin/env bash
# Run ESLint with type-aware rules; any warning fails the build.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
log "linting (eslint, zero warnings allowed)"
yarn lint
log "lint complete"
