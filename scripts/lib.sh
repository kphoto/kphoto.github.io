#!/usr/bin/env bash

log() { printf '\033[1;34m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

repo_root() {
  (cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/.." && pwd)
}

ensure_node() {
  command -v node >/dev/null 2>&1 || die "node not found; on Fedora: sudo dnf install nodejs"
  local major
  major="$(node -p 'process.versions.node.split(".")[0]')"
  (( major >= 24 )) || die "node >= 24 required, found $(node --version)"
  if ! command -v yarn >/dev/null 2>&1; then
    log "enabling corepack to provide yarn"
    corepack enable 2>/dev/null || die "corepack enable failed; try: sudo corepack enable"
  fi
}

ensure_deps() {
  if [[ ! -d node_modules || yarn.lock -nt node_modules/.yarn-state.yml ]]; then
    log "installing dependencies (yarn install --immutable)"
    yarn install --immutable
  fi
}
