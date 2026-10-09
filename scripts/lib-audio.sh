#!/usr/bin/env bash

AUDIO_PARTIAL=""

audio_cleanup() {
  if [[ -n "$AUDIO_PARTIAL" ]]; then
    rm -f -- "$AUDIO_PARTIAL"
  fi
}

audio_pick_encoder() {
  local candidate
  for candidate in "$@"; do
    if command -v "$candidate" >/dev/null 2>&1; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

audio_default_dir() {
  printf '%s/public/spoken\n' "$(repo_root)"
}

audio_convert_dir() {
  local dir="$1" ext="$2" delete="$3" encode="$4"
  local -a files
  local wav out ok=0 skipped=0 failed=0 bytes_in=0 bytes_out=0

  [[ -d "$dir" ]] || die "not a directory: $dir"

  shopt -s nullglob nocaseglob
  files=("$dir"/*.wav)
  shopt -u nullglob nocaseglob

  trap audio_cleanup EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM

  for wav in "${files[@]}"; do
    [[ -f "$wav" ]] || continue
    out="${wav%.*}.$ext"
    if [[ -e "$out" ]]; then
      log "skipping, already exists: $out"
      skipped=$((skipped + 1))
      continue
    fi
    log "converting $wav -> $out"
    AUDIO_PARTIAL="$out.part"
    rm -f -- "$AUDIO_PARTIAL"
    if "$encode" "$wav" "$AUDIO_PARTIAL" && [[ -s "$AUDIO_PARTIAL" ]]; then
      mv -- "$AUDIO_PARTIAL" "$out"
      AUDIO_PARTIAL=""
      ok=$((ok + 1))
      bytes_in=$((bytes_in + $(stat -c %s -- "$wav")))
      bytes_out=$((bytes_out + $(stat -c %s -- "$out")))
      if (( delete )); then
        rm -- "$wav"
      fi
    else
      printf '\033[1;31m[failed]\033[0m %s\n' "$wav" >&2
      rm -f -- "$AUDIO_PARTIAL"
      AUDIO_PARTIAL=""
      failed=$((failed + 1))
    fi
  done

  if (( ok + skipped + failed == 0 )); then
    log "no .wav files in $dir"
    return 0
  fi
  log "done: converted $ok, skipped $skipped, failed $failed"
  if (( ok > 0 )); then
    log "size: $((bytes_in / 1024)) KiB -> $((bytes_out / 1024)) KiB"
  fi
  (( failed == 0 ))
}
