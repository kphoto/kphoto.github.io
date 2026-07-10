#!/usr/bin/env bash
# Shared helpers for every script in scripts/. Source, do not execute.

log() { printf '\033[1;34m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

repo_root() {
  git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel 2>/dev/null \
    || die "not inside a git repository"
}

# Verify Node 24+ and make Yarn 4 available via corepack (ships with Node).
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

# Install dependencies exactly as locked when node_modules is missing or stale.
ensure_deps() {
  if [[ ! -d node_modules || yarn.lock -nt node_modules/.yarn-state.yml ]]; then
    log "installing dependencies (yarn install --immutable)"
    yarn install --immutable
  fi
}
