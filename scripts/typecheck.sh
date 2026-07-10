#!/usr/bin/env bash
# Type-check every file with the TypeScript 7 native compiler.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
log "type-checking with tsc $(yarn tsc --version) (native compiler)"
yarn typecheck
log "typecheck complete"
