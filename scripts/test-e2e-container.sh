#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/lib.sh"
cd "$(repo_root)"
ENGINE="${CONTAINER_ENGINE:-podman}"
command -v "$ENGINE" >/dev/null 2>&1 \
  || die "$ENGINE not found; on Fedora: sudo dnf install podman podman-compose (or set CONTAINER_ENGINE=docker)"
log "running end-to-end tests in a container ($ENGINE compose run --rm e2e)"
exec "$ENGINE" compose run --rm e2e
