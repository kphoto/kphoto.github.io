#!/usr/bin/env bash

set -euo pipefail

DIR="."
DELETE=false

for arg in "$@"; do
    case "$arg" in
        --delete) DELETE=true ;;
        *)        DIR="$arg" ;;
    esac
done

if [[ ! -d "$DIR" ]]; then
    echo "Error: '$DIR' is not a directory." >&2
    exit 1
fi

# Pick an encoder
if command -v ffmpeg >/dev/null 2>&1; then
    ENCODER="ffmpeg"
elif command -v flac >/dev/null 2>&1; then
    ENCODER="flac"
else
    echo "Error: neither ffmpeg nor flac found." >&2
    echo "Install one with: sudo dnf install flac   (or ffmpeg from RPM Fusion)" >&2
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

for wav in "${files[@]}"; do
    flac_out="${wav%.*}.flac"

    if [[ -e "$flac_out" ]]; then
        echo "Skipping (already exists): $flac_out"
        continue
    fi

    echo "Converting: $wav -> $flac_out"

    if [[ "$ENCODER" == "ffmpeg" ]]; then
        cmd=(ffmpeg -nostdin -loglevel error -i "$wav" -compression_level 8 "$flac_out")
    else
        cmd=(flac --silent --best -o "$flac_out" "$wav")
    fi

    if "${cmd[@]}"; then
        ok=$((ok + 1))
        if $DELETE; then
            rm -- "$wav"
        fi
    else
        echo "Failed: $wav" >&2
        rm -f -- "$flac_out"
        fail=$((fail + 1))
    fi
done

echo "Done. Converted: $ok, failed: $fail"
