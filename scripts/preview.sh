#!/usr/bin/env bash
# Serve the built dist/ exactly as GitHub Pages would (404s, redirects).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
[[ -d dist ]] || "$HERE/build.sh"
log "previewing dist/ (vite preview)"
exec yarn preview
