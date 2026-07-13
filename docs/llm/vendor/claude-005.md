28
53
83

as kphoto-team
please write a twenty part series 
detailing everything you know about digital photography
timeless tips and tricks
from the foundations 
something that will be relevant even as technology continues to evolve
please and thank you 
start date should be today july 13, 2026 
2026-07-13 
each post should be concise and yet comprehensive 
and please add a tl;Dr in the beginning 
and remember to string them together with the new series tag 
please give full files so I can copy paste the files directly to the folder 

sonnet 5 medium 


/
Claude finished the response
as kphoto-team
please write a twenty part series 
detailing everything you know about digital photography
timeless tips and tricks
from the foundations 
something that will be relevant even as technology continues to evolve
please and thank you 
start date should be today july 13, 2026 
2026-07-13 
each post should be concise and yet comprehensive 
and please add a tl;Dr in the beginning 
and remember to string them together with the new series tag 
please give full files so I can copy paste the files directly to the folder


Architected twenty-post photography series with consistent formatting and tagging
Architected twenty-post photography series with consistent formatting and tagging
Reviewed dump.txt against the live schema in src/lib/content.ts — confirmed the exact frontmatter rules that matter here:

series name string must be byte-identical across every post (the build rejects "conflicting spellings" of the same series, even case differences), so all 20 use the exact string Photography Fundamentals.
episode must be a unique integer ≥1 within that series.
One post per calendar day (filename date must equal frontmatter date), so I laid these out daily starting 2026-07-13.
author: kphoto-team (already exists as content/authors/kphoto-team.yml — no new author file needed).
tags needs ≥1 entry — each post gets photography-fundamentals plus a topic-specific tag.
Here are all 20 full files, ready to drop into content/blog/.

content/blog/2026-07-13-light-the-foundation-of-every-photograph.md

markdown
---
title: Light — The Foundation of Every Photograph
date: 2026-07-13
author: kphoto-team
summary: Every camera that has ever existed, and every one that ever will, does exactly one job — it measures light. Start there, not with gear.
tags:
  - photography-fundamentals
  - light
series: Photography Fundamentals
episode: 1
---

**TL;DR:** A photograph is a record of light, not a record of a scene. Learn to see light's quality, direction, and color before you touch a single dial, and every other skill in this series gets easier.

## The camera is a light-measuring device

Sensors change, lenses change, megapixels climb and then stop mattering — but a camera has only ever done one thing: it records the light that reaches it for a slice of time. Everything else in photography is a variable you adjust to shape that recording.

## Three questions to ask about any light

- **Quality** — is it hard (a bare bulb, direct noon sun) or soft (an overcast sky, a window with a sheer curtain)? Hard light draws crisp shadows; soft light wraps around a subject.
- **Direction** — is it hitting the subject from the front, the side, or behind? Side light reveals texture and shape. Backlight can silhouette or, handled well, produce a glowing rim.
- **Color** — every light source has a color temperature, from the orange of a candle to the blue of open shade. Your eye adapts to this instantly; your camera does not.

## Why this outlasts any technology

Sensors will keep improving. The physics of how light falls on a face, a wall, or a mountain will not. Train your eye on light first, and your photographs will keep improving long after any specific camera is obsolete.
content/blog/2026-07-14-the-exposure-triangle.md

markdown
---
title: The Exposure Triangle
date: 2026-07-14
author: kphoto-team
summary: Aperture, shutter speed, and ISO are three ways of controlling the same thing — how much light reaches your sensor. Understanding the trade-offs between them is the real skill.
tags:
  - photography-fundamentals
  - exposure
series: Photography Fundamentals
episode: 2
---

**TL;DR:** Aperture, shutter speed, and ISO all control exposure, but each one also has a side effect — depth of field, motion blur, or noise. Choosing an exposure is really choosing which side effect you can live with.

## One goal, three levers

For a given amount of light, there is one "correct" total exposure — but many combinations of settings can produce it. That flexibility is the entire point of manual control.

- **Aperture** (f-stop) controls how wide the lens opens. Wider apertures (smaller f-numbers) let in more light and produce a shallower depth of field.
- **Shutter speed** controls how long the sensor is exposed. Faster speeds freeze motion; slower speeds blur it and let in more light.
- **ISO** controls how much the camera amplifies the light it captured. Higher ISO brightens a dim image but adds noise.

## Trade-offs, not free lunches

Every choice costs something. Open the aperture for more light, and your depth of field shrinks. Slow the shutter for more light, and moving subjects blur. Raise the ISO for more light, and detail degrades. There is no setting that avoids all three costs at once — only the one that costs you the least for the photograph you're making.

## Why it still matters

Computational tricks can compensate for a poor exposure decision after the fact, but they cannot undo it. Understanding the triangle means you decide the trade-off on purpose, instead of discovering it in the photo.
content/blog/2026-07-15-reading-your-histogram.md

markdown
---
title: Reading Your Histogram
date: 2026-07-15
author: kphoto-team
summary: Your camera's screen lies to you in bright sunlight and in the dark. The histogram never does — here's how to read it in five seconds.
tags:
  - photography-fundamentals
  - exposure
series: Photography Fundamentals
episode: 3
---

**TL;DR:** The histogram is a graph of your image's brightness values, from pure black on the left to pure white on the right. Learn to glance at its shape instead of trusting how the photo looks on a bright or dim screen.

## What the graph is actually showing

Every pixel in your photo has a brightness value. The histogram stacks all of those values into a graph: black on the left edge, white on the right, midtones in between. The height of the graph at any point shows how many pixels share that brightness.

## What to look for

- A graph pressed against the **left edge** with a hard cutoff usually means lost shadow detail (crushed blacks).
- A graph pressed against the **right edge** usually means blown highlights — detail that no amount of editing will recover.
- A graph with **empty space at both edges** and everything bunched in the middle often means a flat, low-contrast exposure.

There's no single "correct" shape — a night scene should have a graph weighted left, a snowy scene weighted right. The skill is knowing whether the shape matches your intent.

## Why this beats trusting your eyes

Your screen's brightness, and the ambient light around you, change how a photo *looks* — a photo that seems perfectly exposed in a dim room can be badly overexposed in daylight. The histogram is calculated from the actual pixel data, so it tells the truth regardless of where you're standing.
content/blog/2026-07-16-composition-basics-that-never-expire.md

markdown
---
title: Composition Basics That Never Expire
date: 2026-07-16
author: kphoto-team
summary: The rule of thirds gets all the attention, but it's one tool among several for deciding where to put things in a frame — and why.
tags:
  - photography-fundamentals
  - composition
series: Photography Fundamentals
episode: 4
---

**TL;DR:** Composition is the art of deciding what goes where in the frame, and why. The rule of thirds is a useful starting habit, not a law — the real skill is noticing what your eye is drawn to and arranging the frame around it.

## The rule of thirds, briefly

Divide the frame into a 3×3 grid. Placing a subject or horizon along one of those lines, rather than dead center, tends to create a more dynamic, natural-feeling image. It works because it avoids perfect symmetry, which our eyes read as static.

## When to break it

A perfectly centered subject can be exactly the right choice — it reads as formal, confrontational, or calm, depending on the subject. Symmetry in architecture, a face looking straight at the lens, a reflection split down the middle: these often *want* the center.

## The deeper skill underneath the rule

Every strong composition answers one question: where does the eye enter the frame, and where does it travel next? Thirds is one way to answer that. So is a strong diagonal, a repeating pattern, or a single point of contrast in an otherwise quiet frame.

## Why this survives every camera generation

No sensor or algorithm decides where you point the camera. Composition is a decision made before the shutter fires, and it's the one part of photography that has not changed since the first deliberately-framed photograph.
content/blog/2026-07-17-leading-lines-framing-and-negative-space.md

markdown
---
title: Leading Lines, Framing, and Negative Space
date: 2026-07-17
author: kphoto-team
summary: Three compositional tools that guide the eye without saying a word — a road, a doorway, and the empty space around your subject.
tags:
  - photography-fundamentals
  - composition
series: Photography Fundamentals
episode: 5
---

**TL;DR:** Lines guide the eye through a frame, natural frames focus attention on a subject, and empty space gives a subject room to breathe. Use all three deliberately, not by accident.

## Leading lines

A road, a fence, a shoreline, a row of streetlights — any line that enters the frame can pull the viewer's eye toward your subject. The strongest leading lines start near a corner of the frame and travel toward the point of interest, rather than running parallel to the frame's edge.

## Natural framing

Shoot through a doorway, an archway, overhanging branches, or a gap between two buildings, and you create a frame within the frame. This does two things at once: it draws the eye inward, and it adds a foreground layer that gives the photo depth.

## Negative space

The empty sky above a lone tree, the blank wall beside a person — negative space is not "wasted" area. It gives a subject room to exist and lets the viewer's eye rest before settling on the point of interest. A frame with no negative space at all can feel cramped and anxious, sometimes intentionally so.

## Why these still work

These are properties of human visual attention, not of any specific camera or format. They worked in cave paintings and they will work in whatever captures images a century from now.
content/blog/2026-07-18-depth-of-field-and-selective-focus.md

markdown
---
title: Depth of Field and Selective Focus
date: 2026-07-18
author: kphoto-team
summary: Depth of field is the zone of a photo that's acceptably sharp — and controlling it is one of the most powerful storytelling tools you have.
tags:
  - photography-fundamentals
  - focus
series: Photography Fundamentals
episode: 6
---

**TL;DR:** Depth of field is how much of your photo, front to back, appears in focus. A shallow depth of field isolates a subject; a deep one shows everything in context. Choose it based on what you want the viewer to look at.

## What controls it

Three factors determine depth of field: the aperture (wider apertures give shallower depth of field), the distance to your subject (closer subjects mean shallower depth of field), and the focal length of the lens (longer focal lengths compress depth of field further). All three interact — you rarely control just one.

## When to go shallow

A portrait where the background dissolves into soft color draws every ounce of attention to the person's eyes. A single flower sharp against a blurred field does the same for a small subject lost in a busy scene. Shallow depth of field is a tool for *removing* information the viewer doesn't need.

## When to go deep

A landscape where the foreground rocks and the distant mountains are both sharp tells the viewer "take in the whole scene." Deep depth of field is a tool for *including* information — context, scale, environment.

## The timeless part

This is optics, not electronics. Whatever captures light in the future will still have to answer the same question every lens answers today: how much of the world in front of it should be sharp?
content/blog/2026-07-19-freezing-and-blurring-motion.md

markdown
---
title: Freezing and Blurring Motion
date: 2026-07-19
author: kphoto-team
summary: Shutter speed doesn't just control exposure — it decides whether motion looks frozen, streaked, or silky. Each is a deliberate choice, not an accident.
tags:
  - photography-fundamentals
  - motion
series: Photography Fundamentals
episode: 7
---

**TL;DR:** A fast shutter speed freezes motion into a crisp, often surprising instant. A slow one turns motion into streaks or silky blur. Neither is more "correct" — they tell different stories about the same movement.

## Freezing motion

A fast enough shutter speed can stop a hummingbird's wings, a splash of water, or a runner mid-stride into something the naked eye never actually sees. This is photography's oldest superpower — showing people a slice of time too thin for human vision to catch on its own.

## Blurring motion on purpose

A slow shutter speed turns a river into silk, city traffic into ribbons of light, and a spinning wheel into a soft blur that reads, instantly, as motion. This is often *more* accurate to how motion feels than a frozen frame — we experience movement as a blur, not a series of stills.

## Keeping the camera steady, or not

A tripod keeps everything but the moving subject sharp, isolating the motion. Deliberately moving the camera with a moving subject (panning) keeps the subject relatively sharp while the background streaks, emphasizing speed.

## Why it's still relevant

However light gets captured in the future, the underlying choice remains the same: motion happens over time, and you decide how much of that time gets recorded into a single frame.
content/blog/2026-07-20-white-balance-and-color-temperature.md

markdown
---
title: White Balance and Color Temperature
date: 2026-07-20
author: kphoto-team
summary: Light isn't colorless. Candlelight is orange, overcast sky is blue, and white balance is how you tell your camera which one to treat as "neutral."
tags:
  - photography-fundamentals
  - color
series: Photography Fundamentals
episode: 8
---

**TL;DR:** Every light source has a color, measured in kelvin — warm and low for candlelight, cool and high for blue sky. White balance tells the camera what "neutral white" looks like under that light. Get it wrong and everything shifts orange or blue; get it right, or override it on purpose, and color becomes a tool.

## The kelvin scale, briefly

Color temperature runs from warm to cool as the number rises, counterintuitively: candlelight sits around 1,900K, household bulbs around 2,700–3,000K, daylight around 5,500K, and overcast sky or shade well above 6,500K. Your camera's "auto white balance" is a best guess at which of these it's looking at.

## Why your eyes don't notice, but your camera does

Human vision adapts to ambient color almost instantly — a white shirt looks white in a room lit by lightbulbs, by cloud, or by sunset, even though the actual light hitting it is a different color each time. A camera sensor has no such adaptation; it records exactly what wavelengths arrived, which is why an un-corrected indoor photo often looks orange.

## Using it as a creative choice

Correcting white balance isn't the only valid move. A photo of a candlelit dinner often benefits from *keeping* some of that warmth rather than neutralizing it — the color is part of the mood. White balance is a dial you can set for accuracy or for feeling.

## Why this endures

Color temperature is physics — the same physics that makes a blacksmith's iron glow orange before it glows white-hot. No future sensor changes what light sources actually emit; it only changes how convincingly a camera can guess and correct for it.
content/blog/2026-07-21-understanding-dynamic-range.md

markdown
---
title: Understanding Dynamic Range
date: 2026-07-21
author: kphoto-team
summary: Your eyes can handle a bright sky and a shadowed doorway in the same glance. Cameras still struggle with that gap — knowing why changes how you shoot high-contrast scenes.
tags:
  - photography-fundamentals
  - exposure
series: Photography Fundamentals
episode: 9
---

**TL;DR:** Dynamic range is the gap between the brightest and darkest detail a sensor can capture in one exposure. Human vision handles a wider gap than almost any camera, which is why bright-sky-and-dark-shadow scenes are the hardest to expose well.

## Why high-contrast scenes are hard

Point a camera at a sunlit window inside a dim room, and you'll often get a choice: expose for the room and the window turns pure white, or expose for the window and the room turns pure black. Your eyes, scanning across the same scene, see detail in both — because vision adapts locally, moment to moment, in a way a single exposure cannot.

## Working with limited range instead of against it

- Shoot during softer light (overcast, golden hour) where the gap between shadow and highlight is naturally smaller.
- Expose for the part of the scene that matters most, and let the rest go — a silhouette against a bright window can be the photograph, not a failure.
- Combine multiple exposures of the same static scene when you need detail across the whole range.

## The honest limitation

No amount of clever processing invents detail that was never recorded. A pure white sky with no cloud texture stays that way; a pure black shadow with no recorded gradient stays that way too. Dynamic range is decided at the moment of exposure, not afterward.

## Why the concept outlasts any sensor

Sensors will keep narrowing this gap, but they will never eliminate it, because light itself spans a range vastly wider than any recording medium — film or digital — can capture at once. Understanding the limitation, whatever it currently is, will always matter.
content/blog/2026-07-22-golden-hour-and-blue-hour.md

markdown
---
title: Golden Hour and Blue Hour
date: 2026-07-22
author: kphoto-team
summary: The hour after sunrise and the hour after sunset are not a myth photographers made up — they are genuinely different light, and here's why.
tags:
  - photography-fundamentals
  - light
series: Photography Fundamentals
episode: 10
---

**TL;DR:** When the sun is low, its light travels through more atmosphere, scattering blue wavelengths and leaving warm tones — golden hour. Just after sunset, the sky itself becomes the main light source, cool and even — blue hour. Both are gifts you have to plan for, not stumble into.

## Why golden hour looks the way it does

At midday, sunlight travels a short, direct path through the atmosphere and arrives largely unfiltered — flat, white, and harsh, with hard shadows. When the sun sits low near the horizon, its light travels a much longer path through the atmosphere, scattering shorter blue wavelengths away and letting longer, warmer wavelengths through. That's the literal, physical reason for the golden color, not an aesthetic accident.

## Why blue hour is a separate opportunity

Once the sun has dipped below the horizon, direct sunlight is gone, but the sky above still glows with indirect light, evenly and coolly. This brief window — roughly 20 to 40 minutes, depending on latitude and season — gives soft, shadowless, blue-toned light that's especially good for cityscapes, where artificial lights start to balance against the sky.

## Planning around it

Both windows are short and time-of-year dependent — check sunrise and sunset times for your location and arrive early. The light changes minute to minute during these windows, so the difference between "good" and "the shot" is often a matter of five minutes and being ready.

## Why it will always exist

This is the geometry of a planet and a star, not a rendering trick. As long as the sun rises and sets, golden hour and blue hour will exist exactly as they do now.
content/blog/2026-07-23-portraits-working-with-people.md

markdown
---
title: Portraits — Working With People
date: 2026-07-23
author: kphoto-team
summary: A good portrait is a negotiation between you, your subject, and the camera — and most of it happens before you ever check your settings.
tags:
  - photography-fundamentals
  - portraits
series: Photography Fundamentals
episode: 11
---

**TL;DR:** Technical settings matter far less in portraiture than putting a person at ease and paying attention to their eyes, their hands, and the light on their face. The camera is the easy part.

## The eyes carry the photograph

In almost every portrait, the eyes are where a viewer looks first and longest. Sharp eyes forgive a lot of other imperfection; soft eyes ruin a lot of otherwise perfect technique. If you can only nail one point of focus, make it the eyes.

## Direction of light on a face

Light from directly in front flattens features. Light from a 45-degree angle reveals the structure of a face — cheekbones, jawline — through subtle shadow. Light from directly behind (backlight) can flatter or silhouette, depending on whether you meter for the face or the background.

## The part that isn't optical

Most people tense up in front of a lens. Talking, giving them something to do with their hands, shooting a few "warm-up" frames before the ones that matter, and simply taking your own time all relax a subject more reliably than any camera setting. A relaxed subject looking slightly away from the lens often reads more naturally than a stiff, direct stare.

## Why this doesn't age

Cameras have gotten faster, quieter, and better in low light. None of that changes the fact that a portrait is fundamentally a photograph of a relationship between two people for the length of a shutter click. That part is unchanged since the earliest daguerreotype sitters held still for a minute.
content/blog/2026-07-24-landscapes-patience-and-scale.md

markdown
---
title: Landscapes — Patience and Scale
date: 2026-07-24
author: kphoto-team
summary: A landscape photograph is mostly decided before you press the shutter — by when you showed up, and by how you told the eye how big everything really is.
tags:
  - photography-fundamentals
  - landscape
series: Photography Fundamentals
episode: 12
---

**TL;DR:** Great landscape photography is less about equipment and more about timing (light, weather, season) and scale (giving the viewer something to compare size against). Both require patience more than gear.

## Timing beats almost everything else

The same mountain, valley, or coastline can look ordinary at noon and extraordinary an hour before sunset, or in the ten minutes after a storm clears. Landscape photography rewards checking weather and light conditions in advance, returning to the same location multiple times, and being willing to wait — sometimes hours — for the conditions to align.

## Giving the eye a sense of scale

A vast landscape with nothing to compare it against can, paradoxically, look small in a photograph — the eye has no reference point. A single person, a tree, a boat, or a building placed deliberately in the frame gives the viewer something familiar to measure the rest of the scene against, and the landscape suddenly reads as genuinely huge.

## Foreground, middle ground, background

Strong landscape compositions often use all three: something close and detailed in the foreground, the main subject in the middle ground, and atmosphere or distant elements in the background. This layering is what creates a sense of depth in a fundamentally flat, two-dimensional photograph.

## Why this holds up

Weather, light, and geology will keep doing exactly what they've always done, regardless of what's recording them. The skill of showing up at the right time, with the right sense of scale, transfers to any tool you'll ever use.
content/blog/2026-07-25-street-photography-ethics-and-instinct.md

markdown
---
title: Street Photography — Ethics and Instinct
date: 2026-07-25
author: kphoto-team
summary: Street photography rewards speed and instinct more than any other genre — but it also raises real questions about consent and respect that are worth thinking through before you raise the camera.
tags:
  - photography-fundamentals
  - street-photography
series: Photography Fundamentals
episode: 13
---

**TL;DR:** Street photography is about being ready for a moment that lasts less than a second, in public spaces where the rules around consent and courtesy vary by place and culture. Speed matters technically; respect matters more than technique.

## Pre-deciding your settings

The defining constraint of street photography is that there is usually no time to think about aperture or shutter speed once a moment appears — it's gone in the time it takes to raise a camera. Many street photographers pre-set an aperture and shutter speed for the day's light and leave them alone, focusing all their attention on watching, not adjusting dials.

## Anticipation over reaction

The best street photographs are rarely reactions to something that already happened — they're anticipations of something about to happen: a gesture about to complete, two strangers about to cross paths, a shadow about to fall across a wall. This means watching a scene, not just walking through it.

## The ethical part, honestly

Laws around photographing strangers in public vary by country, and laws are a floor, not a ceiling, for what's respectful. Consider whether a photograph dignifies or exploits its subject, whether you'd be comfortable explaining why you took it, and whether a vulnerable moment — grief, poverty, a child, someone in distress — deserves to be someone's photograph at all.

## Why this genre won't go away

As long as public space exists and people move through it in ways worth noticing, street photography's core skill — watching closely enough to catch a moment nobody else saw — stays exactly as relevant as it's always been.
content/blog/2026-07-26-macro-photography-seeing-small-worlds.md

markdown
---
title: Macro Photography — Seeing Small Worlds
date: 2026-07-26
author: kphoto-team
summary: Macro photography turns the mundane — a droplet, a leaf, an insect's eye — into something genuinely unfamiliar. The challenge is almost entirely about depth of field and stillness.
tags:
  - photography-fundamentals
  - macro
series: Photography Fundamentals
episode: 14
---

**TL;DR:** At extreme close-up magnifications, depth of field shrinks to millimeters and any movement — yours or the subject's — becomes visible blur. Macro photography is a discipline of stillness and precision more than any other genre.

## Why depth of field nearly disappears

As magnification increases, the zone of acceptable sharpness shrinks dramatically — at true macro magnifications, an insect's near eye can be sharp while its far eye, a few millimeters back, is already soft. This isn't a flaw to fix; it's the physics of close focusing, and working with it (choosing exactly what plane to put in focus) is the central skill.

## Stillness matters more than anywhere else

At high magnification, a breath of wind moving a leaf, or your own hand's natural tremor, produces visible blur that would be invisible at normal shooting distances. A stable base — bracing against something solid, or a tripod — and, for tiny living subjects, patience for them to pause, matter more here than in almost any other genre.

## Finding subjects

Dew on a spiderweb at dawn, the texture of tree bark, the structure of a flower's center, frost patterns on glass — macro subjects are usually within arm's reach, not far away. The genre rewards slowing down and looking closely at what's already around you rather than traveling to find something new.

## Why it endures

Whatever lens or sensor achieves close focus in the future, the underlying tension — vanishing depth of field at high magnification — is optics, not electronics, and it will still be the defining challenge of the genre.
content/blog/2026-07-27-seeing-in-black-and-white.md

markdown
---
title: Seeing in Black and White
date: 2026-07-27
author: kphoto-team
summary: Removing color forces every other element of a photograph — light, shape, texture, contrast — to carry the whole image. Learning to see that way sharpens your eye even for color work.
tags:
  - photography-fundamentals
  - black-and-white
series: Photography Fundamentals
episode: 15
---

**TL;DR:** Black and white removes color as a crutch, forcing tonal contrast, shape, and texture to do all the work. Learning to "see" in monochrome — even while shooting in color — makes you notice things color often lets you ignore.

## What color was hiding

A cluttered scene with many different colors can still read as a strong composition in black and white, because tonal contrast — not hue — is doing the organizing work. Conversely, a scene that relies entirely on a striking color for its impact often falls apart the moment that color is removed. Converting an image, even mentally, is a genuine test of whether the composition holds up on its own.

## What to look for instead of color

- **Contrast** — the difference between light and dark areas, which becomes the primary source of visual drama.
- **Texture** — skin, bark, fabric, stone all read more strongly without color competing for attention.
- **Shape and silhouette** — a strong outline against a plain background often works better in monochrome than in color, where the eye gets distracted by hue differences.

## A tool for editing decisions, not just a filter

Deciding in advance to shoot for black and white changes what you notice in the moment — you start watching for contrast and shape instead of color harmony. Many photographers who shoot only in color still practice "seeing in black and white" specifically because it sharpens attention to the elements that support every photograph, regardless of whether color survives to the final image.

## Why it's not a retro gimmick

Monochrome photography predates color photography by roughly a century and has never gone away, because it isn't a limitation — it's a different, permanently valid way of representing light.
content/blog/2026-07-28-raw-versus-jpeg-and-why-it-still-matters.md

markdown
---
title: RAW Versus JPEG, and Why It Still Matters
date: 2026-07-28
author: kphoto-team
summary: A JPEG is a finished decision your camera made for you. A RAW file is the data before that decision — and whether you want that flexibility depends entirely on what you plan to do next.
tags:
  - photography-fundamentals
  - file-formats
series: Photography Fundamentals
episode: 16
---

**TL;DR:** RAW files store the sensor's data with minimal processing, giving you far more room to adjust exposure, color, and white balance after the fact. JPEGs are smaller, ready to share immediately, but bake in the camera's decisions permanently. Choose based on whether you plan to edit or just deliver.

## What actually differs

A JPEG has already had white balance, contrast, sharpening, and color decisions applied and then compressed the result, discarding information along the way to save space. A RAW file preserves nearly all of the sensor's original data uncompressed and unprocessed, which means far more of that discarded information is still available to recover — a poorly white-balanced RAW can often be corrected cleanly; a poorly white-balanced JPEG usually cannot.

## The real trade-off

RAW files are large, require a processing step before they're viewable or shareable in most places, and demand more storage and more time. JPEGs are immediately usable, smaller, and universally supported. Neither is objectively better — a press photographer transmitting images within minutes has different needs than someone printing a large fine-art piece.

## A rule of thumb

If you expect to significantly adjust exposure or color after the fact, or if the shot matters enough that you want maximum recovery room for mistakes, shoot RAW. If you need speed, simplicity, and immediate shareability, and you trust your in-camera settings, JPEG is a perfectly legitimate choice — not a lesser one.

## Why the distinction survives

Formats and compression algorithms will keep changing, but the underlying concept — a data-preserving format versus a decision-baked delivery format — is a permanent trade-off in any system that captures more information than it needs to display immediately.
content/blog/2026-07-29-a-philosophy-for-editing-photographs.md

markdown
---
title: A Philosophy for Editing Photographs
date: 2026-07-29
author: kphoto-team
summary: Editing is not cheating, and it's not the whole job either. Here's a way to think about where the line sits, for you.
tags:
  - photography-fundamentals
  - editing
series: Photography Fundamentals
episode: 17
---

**TL;DR:** Every photograph has always involved decisions after the shutter clicks — darkroom chemists made them for a century before software did. The honest question isn't "should I edit," it's "what am I trying to be truthful about."

## Editing has never been optional

From the earliest darkrooms, photographers chose paper, exposure time, chemical development, dodging and burning specific areas of a print — all editorial decisions made after the shutter closed. The idea that a "pure" photograph exists untouched by any post-capture decision has never actually been true; the tools have simply changed.

## A useful distinction: correcting versus inventing

Adjusting exposure, contrast, and color to match what a scene actually felt like, or to compensate for a sensor's limitations, is a correction — bringing the image closer to a truth the camera couldn't fully capture on its own. Adding elements that were never present, or removing ones that were, to change what actually happened is a different act entirely, and it's worth being honest with yourself, and with your audience, about which one you're doing.

## Editing with restraint

A common trap is over-processing simply because a tool makes it easy — oversaturating color, oversharpening detail, or excessive noise reduction that erases fine texture. A useful habit: make your edit, then dial the strength of every adjustment back by a fixed amount before finishing. Restraint tends to age far better than intensity.

## Why this question never resolves and doesn't need to

Every generation of tools reopens the debate about how much editing is "too much." That's fine — it means the question is a live judgment call for every photographer, not a rule to memorize once.
content/blog/2026-07-30-finding-your-own-style.md

markdown
---
title: Finding Your Own Style
date: 2026-07-30
author: kphoto-team
summary: Style isn't a filter preset — it's the accumulated result of the choices you keep making without deciding to. Here's how to notice yours.
tags:
  - photography-fundamentals
  - style
series: Photography Fundamentals
episode: 18
---

**TL;DR:** Personal style isn't something you invent — it's a pattern you eventually notice in choices you were already making: what you photograph, how you frame it, how you edit it. The fastest way to find it is to make a lot of photographs and then look back for the repeats.

## Style is a byproduct, not a starting point

Trying to invent a style directly, before you've made much work, usually just produces an imitation of someone else's. Style more often emerges backward — you look at a body of your own work and notice you keep gravitating toward certain subjects, certain kinds of light, certain compositions or color choices, without having planned to.

## Where to actually look for the pattern

- What subjects do you keep returning to, even without meaning to?
- What time of day, or type of light, shows up again and again in your favorite shots?
- What do you tend to *include* — and what do you tend to leave out of the frame?
- When you edit, what do you always seem to push toward — warmer, cooler, higher contrast, quieter?

## Influence isn't the enemy

Studying photographers you admire and deliberately trying their techniques is a normal, useful part of developing your own eye — nobody starts from nothing. The influence becomes a problem only if you stop there; the goal is to absorb enough different influences that what comes out the other side is a blend nobody else has, rather than a copy of just one.

## Why this doesn't change with the tools

Cameras and software change what's easy to do. They don't change what you're drawn to look at. Style lives in that attention, which is exactly the part no tool can hand you.
content/blog/2026-07-31-sharing-your-work-ethically.md

markdown
---
title: Sharing Your Work Ethically
date: 2026-07-31
author: kphoto-team
summary: The moment you share a photograph, it stops being just yours — subjects, viewers, and platforms are all affected by choices you made behind the camera. A few habits worth building now.
tags:
  - photography-fundamentals
  - ethics
series: Photography Fundamentals
episode: 19
---

**TL;DR:** Sharing a photograph affects the people in it, not just the people who see it. Get comfortable asking "who does this photo serve, and who might it harm" before you post — a habit that outlasts any specific platform.

## Context travels with an image, or gets stripped from it

A photograph taken in one context — a private moment, a vulnerable circumstance, a specific cultural setting — can be seen entirely out of that context by a stranger scrolling past it. Before sharing, especially images of identifiable people, it's worth asking whether the image still tells the truth once the original context is gone.

## Consent isn't just a legal question

In many places, photographing people in public spaces is legal without asking first. Legal is not the same as respectful. Especially for images that show someone in a difficult or unflattering moment, consider whether you'd want that photograph of yourself shared without being asked, and let that answer guide you.

## Attribution and honesty about editing

If a photograph has been significantly altered — composited, heavily retouched, elements added or removed — being transparent about that, especially in contexts like photojournalism or documentary work where the audience assumes a photo represents reality, is a basic form of respect for your viewers.

## Why this doesn't depend on which platform you use

Whatever comes after today's photo-sharing platforms, the underlying relationship — a photographer, a subject, and an audience who trusts what they're looking at — stays the same. The ethics don't reset with each new app.
content/blog/2026-08-01-how-to-keep-getting-better.md

markdown
---
title: How to Keep Getting Better
date: 2026-08-01
author: kphoto-team
summary: The last lesson in this series isn't a technique — it's a habit for improving indefinitely, long after every tip here has become second nature.
tags:
  - photography-fundamentals
  - practice
series: Photography Fundamentals
episode: 20
---

**TL;DR:** Improvement in photography comes less from learning new techniques and more from regularly reviewing your own work with an honest, specific eye. Shoot often, review deliberately, and let the gap between what you meant and what you got teach you.

## Volume, then reflection

Shooting often matters, but shooting often *without* reviewing the results critically just repeats the same habits at higher volume. The improvement happens in the gap between intention and result — looking back at a photograph and asking specifically what you meant to capture, and specifically where the photo falls short of that, rather than a vague "I don't love this one."

## Study work you didn't make

Looking closely at photographs you admire — and asking concrete questions about *why* they work (where the light is coming from, what's excluded from the frame, what draws your eye first) — trains your eye faster than technique tutorials alone. Copying a photographer's specific approach on purpose, as an exercise, is a legitimate and fast way to internalize a new skill.

## Constraints accelerate learning

Deliberately limiting yourself — one focal length for a month, only black and white for a week, only available light for a project — removes decisions and forces you to solve problems within a smaller space, which tends to sharpen judgment faster than unlimited freedom does.

## The thread through this whole series

Every episode in *Photography Fundamentals* has pointed at the same idea from a different angle: light, composition, and intention matter more than equipment, and none of that changes as tools improve. That's the actual foundation — not any single technique, but the habit of seeing deliberately. Keep that habit, and you'll keep improving no matter what camera ends up in your hand.
That's the full 20-part Photography Fundamentals series, 2026-07-13 through 2026-08-01, all authored by kphoto-team, all sharing the exact series string Photography Fundamentals so the build's series-consistency check passes cleanly. Drop them straight into content/blog/ — no other files need to change since kphoto-team already exists as an author.

One thing worth flagging: this is a lot of same-day-adjacent content landing on the home page's "latest posts" all at once. If you'd rather stagger the publish dates (e.g. weekly instead of daily) say so and I'll regenerate the filenames/frontmatter dates — the content itself doesn't need to change.



Want to be notified when Claude responds?






Claude is AI and can make mistakes. Please double-check responses.




33
54
83

can you please give me them as downloadable files? with the proper file names? 
