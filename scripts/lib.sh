#!/usr/bin/env bash

KPHOTO_COREPACK_VERSION=0.36.0
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

log() { printf '\033[1;34m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

repo_root() {
  (cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/.." && pwd)
}

tools_dir() {
  printf '%s/kphoto/corepack-%s\n' "${XDG_CACHE_HOME:-$HOME/.cache}" "$KPHOTO_COREPACK_VERSION"
}

ensure_node() {
  command -v node >/dev/null 2>&1 || die "node not found; on Fedora: sudo dnf install nodejs nodejs-npm"
  local major
  major="$(node -p 'process.versions.node.split(".")[0]')"
  (( major >= 24 )) || die "node >= 24 required, found $(node --version)"
  ensure_yarn
}

ensure_yarn() {
  local dir
  dir="$(tools_dir)"
  if [[ ! -x "$dir/bin/yarn" ]]; then
    command -v npm >/dev/null 2>&1 || die "npm not found; on Fedora: sudo dnf install nodejs-npm"
    log "installing corepack $KPHOTO_COREPACK_VERSION into $dir"
    rm -rf "$dir"
    mkdir -p "$dir/bin"
    npm install --prefix "$dir" --no-save --no-audit --no-fund --no-update-notifier --loglevel=error \
      "corepack@$KPHOTO_COREPACK_VERSION" >/dev/null \
      || die "could not install corepack $KPHOTO_COREPACK_VERSION from the npm registry"
    "$dir/node_modules/.bin/corepack" enable --install-directory "$dir/bin" yarn \
      || die "corepack could not create the yarn shim in $dir/bin"
  fi
  case ":$PATH:" in
    *":$dir/bin:"*) ;;
    *) export PATH="$dir/bin:$PATH" ;;
  esac
}

ensure_deps() {
  if [[ ! -d node_modules || yarn.lock -nt node_modules/.yarn-state.yml ]]; then
    log "installing dependencies (yarn install --immutable)"
    yarn install --immutable
  fi
}
