#!/usr/bin/env bash
# One-time setup: verify Node 24+, enable corepack/yarn, install locked deps.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node
log "installing dependencies (yarn install --immutable)"
yarn install --immutable
log "bootstrap complete — try ./scripts/dev.sh"
