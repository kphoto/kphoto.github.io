#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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
