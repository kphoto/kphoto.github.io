#!/usr/bin/env bash
# Run the Playwright end-to-end suite inside the official Playwright container
# (compose.yaml, service "e2e") so results do not depend on the host distro.
# Uses podman by default; set CONTAINER_ENGINE=docker to use docker instead.
# See ADR 0017.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib.sh
. "$HERE/lib.sh"
cd "$(repo_root)"
ENGINE="${CONTAINER_ENGINE:-podman}"
command -v "$ENGINE" >/dev/null 2>&1 \
  || die "$ENGINE not found; on Fedora: sudo dnf install podman podman-compose (or set CONTAINER_ENGINE=docker)"
log "running end-to-end tests in a container ($ENGINE compose run --rm e2e)"
exec "$ENGINE" compose run --rm e2e
