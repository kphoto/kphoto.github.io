#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
log "type-checking with $(node node_modules/typescript-native/bin/tsc --version) (TypeScript 7 native compiler)"
yarn typecheck
log "typecheck complete"
