#!/usr/bin/env bash
# Start the dev server: every route renders live from content/, with reloads.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
log "starting dev server (vite)"
exec yarn dev "$@"
