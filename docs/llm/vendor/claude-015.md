04
66

I have two new files in my repo now 
/home/kushal/src/ts/kphoto/public/fonts/regular.ttf
/home/kushal/src/ts/kphoto/public/fonts/regular.woff2
they are both the same font 
it is a custom handwriting font 
I want to give my users the option to switch to this font 
and keep a local storage or something in their browser to remember their choice 
Can you please make this change 
also please update any and all dependencies that have an update available in the stable channel 
I know typescript 7.1 isn't ready in stable yet so if there is an unstable update for this 
lets take that as well 
please review all the project files thoroughly and come up with a perfect solution 
the dump and the terminal text files in the project are up to date as well. 
this repository is public and available free of cost 
at https://github.com/kphoto/kphoto.github.io
replace the readme file with a better version when delivering changes 
always make sure this readme is up to date with the latest code changes where possible 
Use your best judgment
If only a few files (under five or there about) need to change, give me the full path of the files that need to change and the FULL file 
if there are a lot of files that need to change 
    Delivery
    Whole project as one tar.gz, unambiguous file placement
    ONLY files that change need to be included in the tar zip
    as I will put it on top of the existing repository
    Any files to delete on updates called out explicitly
No bespoke sed/patch scripts — full files only for anything that changes
Docs updated alongside code changes
Low verbosity, no code comments
I can't emphasize this 
NO CODE COMMENTS 



































































Source matches the dump. Now let me read the core files thoroughly.

Now check the registry for latest versions.

Now the components.

I ran out of tool budget before I could package anything, so there's **no tar.gz yet**. Applying a partial set would leave the docs, ADRs and tests out of sync, so please don't apply anything from this turn. Reply "continue" and I'll finish and deliver the full archive. The work so far is real and verified in a sandbox clone of `main` (4c49213, same source as your dump).

## Dependency updates (verified)

These pass format, lint, both typechecks, all unit tests and the build. Each version is the newest that clears your 72-hour `npmMinimalAgeGate`:

| Package | From | To |
|---|---|---|
| vite | 8.3.5 | 8.3.8 |
| vitest + @vitest/coverage-v8 | 5.0.5 | 5.1.0 |
| eslint | 10.13.0 | 10.15.0 |
| typescript-eslint | 8.72.0 | 8.72.2 |
| prettier | 3.9.10 | 3.10.1 (no reformatting needed) |
| @types/node | 26.6.5 | 26.6.6 |
| typescript-native-next | 7.1.0-beta | 7.1.0-dev.20261114.1 |

- **TypeScript 7.1:** there is no 7.1 RC, so the newest unstable build is a nightly. Taking it reverses the ADR 0032 amendment that preferred milestones, so that ADR gets a new amendment. TypeScript 7.0.2 is still the latest stable.
- **typescript-eslint 8.73.0** came out yesterday, so the gate blocks it until Nov 19.
- **Playwright stays at 1.64.1.** 1.65.1 is out, but its image digest is needed by ADR 0040 and `versionSync.test.ts`, and my sandbox can't reach mcr.microsoft.com. If you paste the output of `podman pull mcr.microsoft.com/playwright:v1.65.1-noble`, I'll include that bump too.
- **No changes needed** for Yarn 4.18.1, corepack 0.36.0, Node 26, or any GitHub Actions; all are already latest.
- **yarn.lock** has been regenerated and will be in the archive.

## Font option (built, not yet finished)

- **Setting:** `font: 'standard' | 'handwriting'` is stored in the existing `kphoto:settings:v1` key and validated like the theme.
- **No flash on load:** the same inline script that applies the theme also sets `data-font`. It preloads the font only for readers who chose handwriting.
- **Styling:** `@font-face` uses woff2 only. `[data-font='handwriting']` swaps the body text font. Code and the monospace labels stay as they are.
- **Picker:** a `<kp-font-picker>` sits next to the theme picker, labelled in English and Spanish. Both pickers now share one rendering component and one client element.
- **Tests written:** `font.test.ts`, plus expanded storage and init-script tests.

**Still to do:** component and route test updates, an e2e test for picking the font and reloading, a new ADR 0042, amendments to ADRs 0013 and 0032, `architecture.md`, CHANGELOG, a new README, both About pages, and a full `check.sh` run.

## Things you should know about the font

- **It has no Spanish accents.** It contains 106 characters: basic ASCII plus some punctuation, with no á é í ó ú ñ ¿ ¡. On `/es/` pages, those letters will show in the system font in the middle of handwritten words. Adding them in Ductus would fix it.
- **It runs small.** It's narrow with a low x-height, so I'm using `size-adjust: 115%` to make it readable.
- **Please delete `public/fonts/regular.ttf`.** Every current browser loads the woff2, so the 79 KiB TTF would just ship on every deploy unused. Keep a copy outside `public/` if it's your source file.
- **License:** the font's metadata says "My Hand — made with Ductus". I'll describe it as your own handwriting under the repo's license unless you tell me otherwise.

18
67





















































Please continue 
the accent marks missing is a real problem 
the thing is the tool I used to generate the font didn't give an option for accent marks 
as it is a tiny proof of concept. 
once you start adding code points 
there are probably thousands you need to do and it becomes overwhelming
so what you had to do is fine 
as long as users can switch back to the default font it should be ok 
kushal@fedora:~/src/ts/kphoto$ time podman pull mcr.microsoft.com/playwright:v1.65.1-noble
Trying to pull mcr.microsoft.com/playwright:v1.65.1-noble...
Getting image source signatures
Copying blob 47752f912df1 done   | 
Copying blob 26538842dfbf done   | 
Copying blob 16013128adc1 done   | 
Copying blob 9e0eed0efbea done   | 
Copying blob 6802dea8d812 done   | 
Copying blob a41e11046077 done   | 
Copying blob 80e9d9e1b5bb done   | 
Copying config 12708c20bc done   | 
Writing manifest to image destination
12708c20bc005b7ecc920dd23b27079baa55359fd2739c7f0f3070c47cf263e9

real	1m27.262s
user	0m28.309s
sys	0m11.467s
kushal@fedora:~/src/ts/kphoto$ 










































































Now the docs, ADRs and about pages.

Now the README.

The archive has 31 files. Extract it at the repo root with `tar -xzf kphoto-handwriting-font.tar.gz`.

**Delete:** `public/fonts/regular.ttf`. Nothing references it, and everything in `public/` ships with every deploy.

In my sandbox, format, lint, both typechecks, all 568 unit tests (up from 524), `yarn install --immutable` and the build passed. I couldn't run the e2e suite there because the browser downloads are blocked, so `./check.sh` is the first real e2e run. The new e2e tests are in `tests/e2e/site.spec.ts`.

**What readers get:**
- **The picker:** a font picker in the header, next to the theme picker, with "Standard font" and "Handwriting font" (Spanish: "Letra estándar" / "Letra manuscrita"). Standard is the default and is always one click away.
- **Remembered choice:** it's stored as `font` in `kphoto:settings:v1` and applied before the first frame, so a reload doesn't flash the wrong font.
- **Loading:** only readers who pick the handwriting font download it. After that, every page preloads it.
- **What changes:** only body text uses the handwriting font. Code and labels stay monospace. I scaled it up 15% because it renders small.
- **Accents:** letters the font doesn't have, like accents, `ñ`, `¿` and `¡`, show in the system font. This is written up in ADR 0042, the README and the Spanish About page.

**Dependencies:** the stable updates are Vite 8.3.8, Vitest and coverage 5.1.0, ESLint 10.15.0, typescript-eslint 8.72.2, Prettier 3.10.1 and @types/node 26.6.6. For TypeScript 7.1 I took the newest unstable build, the nightly `7.1.0-dev.20261114.1`, since no release candidate exists yet. `yarn.lock` is regenerated. typescript-eslint 8.73.0 is still blocked by the 72-hour gate until Nov 19.

**Playwright is still at 1.64.1.** The hash `podman pull` printed is the local image ID, and the pin needs the manifest digest, which is a different hash. ADR 0040 claimed `podman pull` prints it, so I amended it. This command gives the right value:

```
skopeo inspect --format '{{.Digest}}' docker://mcr.microsoft.com/playwright:v1.65.1-noble
```

Paste that output and I'll send the bump for `package.json`, `yarn.lock`, `compose.yaml` and `.github/workflows/verify.yml`.

**Docs:** there's a new ADR 0042, and ADRs 0008, 0013, 0032 and 0040 are amended. `docs/architecture.md`, `CHANGELOG.md`, `README.md` and both About pages are updated.

22
68





































































kushal@fedora:~/src/ts/kphoto$ skopeo inspect --format '{{.Digest}}' docker://mcr.microsoft.com/playwright:v1.65.1-noble
sha256:1507cbfc550a63a6b7396791ca4f00df17beb56342d2447b3f106c306f525579
kushal@fedora:~/src/ts/kphoto$ 

