# 38. Third-party drawings used for demonstration only

Date: 2026-10-25

## Status

Accepted

## Context

The flapping-airplane lab (ADR 0037) explains an animation by Flapping
Airplanes and needs their drawings. The drawings are not ours and are not
covered by the project's AGPL license (ADR 0002). ADR 0004 forbids external
resources, so hotlinking is not an option.

## Decision

- The 28 frames live in `public/images/flapping-airplanes/` and are served
  from this origin only.
- They are used for educational and demonstration purposes only. The lab's
  figure caption, a visible disclaimer note, the README and this ADR say who
  owns them, that the AGPL does not cover them, and that the site is not
  affiliated with or endorsed by Flapping Airplanes.
- The repository owner accepts responsibility for keeping them; they will be
  removed on request from the rights holder.

## Consequences

Anyone reusing this repository must not assume the drawings are free to
reuse. Removing them breaks only the lab's flipbook, not the rest of the site.
