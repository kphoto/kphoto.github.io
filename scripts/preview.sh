#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
[[ -d dist ]] || "$HERE/build.sh"
log "previewing dist/ (vite preview)"
exec yarn preview "$@"
