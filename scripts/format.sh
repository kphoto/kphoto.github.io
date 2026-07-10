#!/usr/bin/env bash
# Format the tree with Prettier; pass --check to verify without writing.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
if [[ "${1:-}" == "--check" ]]; then
  log "checking formatting (prettier --check)"
  yarn format:check
else
  log "formatting (prettier --write)"
  yarn format
fi
log "format complete"
