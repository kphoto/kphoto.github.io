#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/lib.sh"
. "$HERE/lib-audio.sh"

usage() {
  cat <<USAGE
Usage: $(basename "$0") [directory] [--delete]

Losslessly convert every *.wav in a directory to *.flac.

  directory   default: $(audio_default_dir)
  --delete    remove each .wav after its .flac is written
  -h, --help  show this help
USAGE
}

encode_flac() {
  flac --silent --best --verify -o "$2" "$1"
}

encode_ffmpeg() {
  ffmpeg -nostdin -loglevel error -i "$1" -c:a flac -compression_level 8 -f flac "$2"
}

DIR=""
DELETE=0
while (( $# > 0 )); do
  case "$1" in
    -h | --help) usage; exit 0 ;;
    --delete) DELETE=1 ;;
    -*) die "unknown option: $1 (see --help)" ;;
    *)
      [[ -z "$DIR" ]] || die "only one directory may be given (see --help)"
      DIR="$1"
      ;;
  esac
  shift
done
DIR="${DIR:-$(audio_default_dir)}"
[[ -d "$DIR" ]] || die "not a directory: $DIR"

ENCODER="$(audio_pick_encoder flac ffmpeg)" ||
  die "neither flac nor ffmpeg found; on Fedora: sudo dnf install flac"
log "encoder: $ENCODER"

audio_convert_dir "$DIR" flac "$DELETE" "encode_$ENCODER"
