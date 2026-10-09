#!/usr/bin/env bash
#
# Convert all *.wav files in a folder to very small speech-optimized *.opus
#
# Usage: ./wav2opus.sh [folder] [-b kbps] [--delete]
#   folder    Directory to scan (default: current directory)
#   -b kbps   Target bitrate in kbps (default: 12; try 8 for tinier, 16-24 for nicer)
#   --delete  Remove the original .wav after a successful conversion

set -euo pipefail

DIR="."
BITRATE=12
DELETE=false

while (( $# > 0 )); do
    case "$1" in
        --delete) DELETE=true ;;
        -b)
            shift
            if [[ -z "${1:-}" || ! "$1" =~ ^[0-9]+$ ]]; then
                echo "Error: -b needs a numeric bitrate in kbps." >&2
                exit 1
            fi
            BITRATE="$1"
            ;;
        *) DIR="$1" ;;
    esac
    shift
done

if [[ ! -d "$DIR" ]]; then
    echo "Error: '$DIR' is not a directory." >&2
    exit 1
fi

# Pick an encoder (opusenc preferred, ffmpeg as fallback)
if command -v opusenc >/dev/null 2>&1; then
    ENCODER="opusenc"
elif command -v ffmpeg >/dev/null 2>&1; then
    ENCODER="ffmpeg"
else
    echo "Error: neither opusenc nor ffmpeg found." >&2
    echo "Install one with: sudo dnf install opus-tools   (or ffmpeg-free)" >&2
    exit 1
fi

shopt -s nullglob nocaseglob
files=("$DIR"/*.wav)

if (( ${#files[@]} == 0 )); then
    echo "No .wav files found in '$DIR'."
    exit 0
fi

ok=0
fail=0
skipped=0
total_in=0
total_out=0

for wav in "${files[@]}"; do
    opus_out="${wav%.*}.opus"

    if [[ -e "$opus_out" ]]; then
        echo "Skipping (already exists): $opus_out"
        skipped=$((skipped + 1))
        continue
    fi

    echo "Converting: $wav -> $opus_out (${BITRATE} kbps)"

    if [[ "$ENCODER" == "opusenc" ]]; then
        cmd=(opusenc --quiet --speech --vbr --bitrate "$BITRATE" \
             --downmix-mono --framesize 60 --comp 10 "$wav" "$opus_out")
    else
        cmd=(ffmpeg -nostdin -loglevel error -i "$wav" \
             -ac 1 -ar 16000 -c:a libopus -b:a "${BITRATE}k" \
             -vbr on -application voip -frame_duration 60 \
             -compression_level 10 "$opus_out")
    fi

    if "${cmd[@]}"; then
        ok=$((ok + 1))
        total_in=$((total_in + $(stat -c %s "$wav")))
        total_out=$((total_out + $(stat -c %s "$opus_out")))
        if $DELETE; then
            rm -- "$wav"
        fi
    else
        echo "Failed: $wav" >&2
        rm -f -- "$opus_out"
        fail=$((fail + 1))
    fi
done

echo "Done. Converted: $ok, skipped: $skipped, failed: $fail"
if (( total_in > 0 )); then
    echo "Size: $((total_in / 1024)) KiB -> $((total_out / 1024)) KiB"
fi
