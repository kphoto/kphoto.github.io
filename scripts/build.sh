#!/usr/bin/env bash
# Produce the static site in dist/: Vite bundles assets, the SSG plugin
# renders every page, feed.xml and sitemap.xml against the hashed asset names.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ensure_node; ensure_deps
log "building the static site (vite build + kphoto-ssg)"
yarn build
log "build complete — output in dist/"
