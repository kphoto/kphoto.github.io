# 35. Remembered listening speed and position

Date: 2026-10-09

## Status

Accepted

## Context

Narrations run four to six minutes. Readers who change speed or leave
half-way should not have to do it again.

## Decision

- Speed is a setting: `playbackRate` in `kphoto:settings:v1`, accepted from
  0.25 to 4, applied to every recording.
- Position is not a setting: `kphoto:listening:v1` holds
  `[[src, seconds], …]`, newest first, at most 20 entries, whole seconds.
  Saved every 5 s of play and on pause; forgotten on end. Resume is skipped
  within 5 s of the end.
- `connectNarration` is pure against a `NarrationPlayer` port and the
  `KeyValueStore`; `narrationElement.ts` adapts `HTMLAudioElement`.

## Consequences

Nothing identifies the reader. Corrupt or foreign values are ignored. The
only cost is a few hundred bytes of localStorage.
