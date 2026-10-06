#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node
log "installing dependencies (yarn install --immutable)"
yarn install --immutable
log "bootstrap complete — try ./scripts/dev.sh"
