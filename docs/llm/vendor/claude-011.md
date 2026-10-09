/

context is fedora linux. for each wave file *.wav in a folder please give me a script to convert it into flac

Here’s a bash script that converts every .wav in a folder to .flac using ffmpeg (or flac as a fallback if you prefer the reference encoder).

wav2flac.sh
bash

#!/usr/bin/env bash
#
# Convert all *.wav files in a folder to *.flac
#
# Usage: ./wav2flac.sh [folder] [--delete]
#   folder    Directory to scan (default: current directory)
#   --delete  Remove the original .wav after a successful conversion

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

Usage
bash

chmod +x wav2flac.sh
./wav2flac.sh /path/to/folder          # keep the originals
./wav2flac.sh /path/to/folder --delete # delete .wav after successful conversion

Notes

    Install an encoder on Fedora with sudo dnf install flac. For ffmpeg, you need RPM Fusion enabled, or you can use ffmpeg-free from the default repos, which handles WAV and FLAC fine.
    FLAC is lossless, so the audio is bit-identical to the WAV, just smaller.
    It skips files that already have a matching .flac, and cleans up partial output if an encode fails.
    The match is case-insensitive, so .WAV files are picked up too.

If you want it to recurse into subfolders, replace the glob with mapfile -d '' files < <(find "$DIR" -type f -iname '*.wav' -print0) and I can give you the full updated script.

can you please also give me one that converts the wav into very tiny opus files? lossy is ok file is gemini auto generated spoken text for context so smallest possible is good
Compressing speech audio into minimal-size opus files.
Compressing speech audio into minimal-size opus files.

Here’s the full script. It targets speech: mono, 12 kbps, VoIP-tuned Opus with 60 ms frames (fewer packet headers, so smaller files). That’s very small and still clearly intelligible for TTS audio.

wav2opus.sh
bash

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

Usage
bash

chmod +x wav2opus.sh
./wav2opus.sh /path/to/folder              # 12 kbps, keep originals
./wav2opus.sh /path/to/folder -b 8         # even smaller
./wav2opus.sh /path/to/folder -b 16 --delete

Notes

    Install on Fedora with sudo dnf install opus-tools. The ffmpeg-free package also supports libopus, so either works.
    At 12 kbps, one minute of speech is roughly 90 KB. At 8 kbps it’s about 60 KB, which is still usable for clean TTS but starts to sound a bit muffled.
    Mono is forced since TTS output has no meaningful stereo, and the .opus files play in most modern players, browsers, and Telegram/WhatsApp-style voice workflows.

Claude works directly with your codebase


Claude is AI and can make mistakes. Please double-check responses.
Claude finished the response

