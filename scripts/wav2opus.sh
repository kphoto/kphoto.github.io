#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/lib.sh"
. "$HERE/lib-audio.sh"

usage() {
  cat <<USAGE
Usage: $(basename "$0") [directory] [-b kbps] [--delete]

Convert every *.wav in a directory to small, speech-tuned, mono *.opus.

  directory           default: $(audio_default_dir)
  -b, --bitrate kbps  6 to 256, default 12; 8 is smaller, 16 to 24 sound better
  --delete            remove each .wav after its .opus is written
  -h, --help          show this help
USAGE
}

encode_opusenc() {
  opusenc --quiet --speech --vbr --bitrate "$BITRATE" --downmix-mono \
    --framesize 60 --comp 10 "$1" "$2"
}

encode_ffmpeg() {
  ffmpeg -nostdin -loglevel error -i "$1" -ac 1 -c:a libopus -b:a "${BITRATE}k" \
    -vbr on -application voip -frame_duration 60 -compression_level 10 -f opus "$2"
}

DIR=""
DELETE=0
BITRATE=12
while (( $# > 0 )); do
  case "$1" in
    -h | --help) usage; exit 0 ;;
    --delete) DELETE=1 ;;
    -b | --bitrate)
      if [[ ! "${2:-}" =~ ^[0-9]{1,3}$ ]] || (( 10#$2 < 6 || 10#$2 > 256 )); then
        die "$1 needs a bitrate from 6 to 256 kbps (see --help)"
      fi
      BITRATE=$((10#$2))
      shift
      ;;
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

ENCODER="$(audio_pick_encoder opusenc ffmpeg)" ||
  die "neither opusenc nor ffmpeg found; on Fedora: sudo dnf install opus-tools"
log "encoder: $ENCODER at $BITRATE kbps"

audio_convert_dir "$DIR" opus "$DELETE" "encode_$ENCODER"
