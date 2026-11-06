00
43

We have a problem 
verify / e2e is broken on github 
Run corepack enable
  corepack enable
  shell: sh -e {0}
  env:
    HOME: /root
WARNING: Error loading config file: open /root/.docker/config.json: permission denied
/__w/_temp/158927e3-a983-4ba5-a3b2-f3ed2bd53ee8.sh: 1: corepack: not found
Error: Process completed with exit code 127.
And this was completely undetected on my local environment if you look at `terminal.txt` 
I have temporarily attached `docs/llm/vendor/claude-014-logs.md` to the project as well 
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


































































Claude
/
We have a problem 
verify / e2e is broken on github 
Run corepack enable
  corepack enable
  shell: sh -e {0}
  env:
    HOME: /root
WARNING: Error loading config file: open /root/.docker/config.json: permission denied
/__w/_temp/158927e3-a983-4ba5-a3b2-f3ed2bd53ee8.sh: 1: corepack: not found
Error: Process completed with exit code 127.
And this was completely undetected on my local environment if you look at terminal.txt 
I have temporarily attached docs/llm/vendor/claude-014-logs.md to the project as well 
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

Ran 43 commands, read memory, searched the web
Let me extract the dump into a working tree.
Checking how the preview server finds its yarn binary.
Checking which files the extractor missed.
Fixing the parser that skipped files after the listing.
Checking the actual repository for changes.
Checking current tool versions and a Node release source.
Running the shell tests and formatting checks.
Tracing the corepack cache setup in the workflows.
Checking amendment format against other ADRs.
Checking whether the docker warning claim holds.
Now the README and CHANGELOG.
Checking how the cache path resolves on CI runners.
Root cause
Two separate problems combined to cause this.

The image changed under the same tag. Microsoft republished mcr.microsoft.com/playwright:v1.64.1-noble on 2026-11-01. The old digest was sha256:47b510dd… and ran Node 24. The new one is sha256:2f05f8a7… and runs Node 26.13. Node 25 and later no longer include corepack, so the job’s first step failed with corepack: not found. Your CI log shows it pulling exactly 2f05f8a7…. Other projects hit the same break the same week.
Your local run never saw the new image. Podman doesn’t pull a tag it already has, so ./check.sh kept using your cached Node 24 copy. ADR 0017’s “local and CI are the same image” stopped being true without anything saying so. You can confirm this with podman image inspect mcr.microsoft.com/playwright:v1.64.1-noble --format '{{.Digest}}', which should print 47b510dd….
There were also two hidden problems:

The checks and deploy jobs only worked because the runner’s preinstalled Node still had corepack. They would break the same way once the runner image moves to Node 26.
lib.sh skipped corepack whenever any yarn was on PATH. The image ships classic Yarn 1 at /usr/bin/yarn, so classic Yarn would have been picked.
Fix
ADR 0039: the scripts provide Yarn themselves and never rely on a corepack bundled with Node.
scripts/lib.sh pins corepack 0.36.0 and installs it once into ~/.cache/kphoto/ without root.
It shims the packageManager Yarn first on PATH, which also hides classic Yarn.
No workflow, compose service or README step runs corepack enable any more.
ADR 0040: the image is pinned by tag and digest in both compose.yaml and verify.yml. A stale local tag can’t hide a republish again, because podman pulls by digest.
ADR 0041: a new .node-version file (26) drives the runner-hosted jobs. The e2e job uses the image’s own Node, with no setup-node step. Caching now uses actions/cache@v6, since setup-node’s yarn cache needs a Yarn before the scripts run.
Regression tests in src/versionSync.test.ts check:
every image reference has a digest and the references are identical;
nothing calls corepack directly;
the Yarn and corepack versions are exact pins;
the .node-version rules hold.
I tested this here: the full unit suite passes (528 → 536 tests), lint and Prettier are clean, and the typecheck passes. In a simulated environment with a fake classic Yarn on PATH and a fresh HOME, yarn --version returns 4.18.1, and a second run does no reinstall. I couldn’t run the GitHub container itself.

Delivery
Extract it at the repo root: kphoto-corepack-fix.tar.gz. It keeps the executable bit on scripts/lib.sh.

Files in the archive:

.node-version (new)
.github/workflows/verify.yml
.github/workflows/deploy.yml
compose.yaml
scripts/lib.sh
src/versionSync.test.ts
README.md
CHANGELOG.md
docs/adr/0011-…, 0014-…, 0017-…, 0019-… (amended)
docs/adr/0039-yarn-without-bundled-corepack.md, 0040-playwright-image-pinned-by-digest.md, 0041-node-version-file.md (new)
Files to delete: none.

After extracting, run ./check.sh. Podman will pull the pinned digest, and this time your local run uses the same Node 26 image as CI. Your old global corepack setup is no longer needed, but it does no harm.

Presented file
Presented file
The fix is in kphoto-corepack-fix.tar.gz; extract it at the repo root and run ./check.sh. Podman will pull the pinned image this time, so your local run should match CI.

Kphoto corepack fix.tar
GZ



Claude is AI and can make mistakes. Please double-check cited sources.






Claude finished the response






























































































Let me extract the dump into a working tree.

Now the README and CHANGELOG.

## Root cause

Two separate problems combined to cause this.

1. **The image changed under the same tag.** Microsoft republished `mcr.microsoft.com/playwright:v1.64.1-noble` on 2026-11-01. The old digest was `sha256:47b510dd…` and ran Node 24. The new one is `sha256:2f05f8a7…` and runs Node 26.13. Node 25 and later no longer include corepack, so the job's first step failed with `corepack: not found`. Your CI log shows it pulling exactly `2f05f8a7…`. Other projects hit the same break the same week.
2. **Your local run never saw the new image.** Podman doesn't pull a tag it already has, so `./check.sh` kept using your cached Node 24 copy. ADR 0017's "local and CI are the same image" stopped being true without anything saying so. You can confirm this with `podman image inspect mcr.microsoft.com/playwright:v1.64.1-noble --format '{{.Digest}}'`, which should print `47b510dd…`.

There were also two hidden problems:
- The `checks` and `deploy` jobs only worked because the runner's preinstalled Node still had corepack. They would break the same way once the runner image moves to Node 26.
- `lib.sh` skipped corepack whenever *any* `yarn` was on `PATH`. The image ships classic Yarn 1 at `/usr/bin/yarn`, so classic Yarn would have been picked.

## Fix

- **ADR 0039:** the scripts provide Yarn themselves and never rely on a corepack bundled with Node.
  - `scripts/lib.sh` pins corepack 0.36.0 and installs it once into `~/.cache/kphoto/` without root.
  - It shims the `packageManager` Yarn first on `PATH`, which also hides classic Yarn.
  - No workflow, compose service or README step runs `corepack enable` any more.
- **ADR 0040:** the image is pinned by tag and digest in both `compose.yaml` and `verify.yml`. A stale local tag can't hide a republish again, because podman pulls by digest.
- **ADR 0041:** a new `.node-version` file (`26`) drives the runner-hosted jobs. The e2e job uses the image's own Node, with no setup-node step. Caching now uses `actions/cache@v6`, since setup-node's yarn cache needs a Yarn before the scripts run.
- **Regression tests** in `src/versionSync.test.ts` check:
  - every image reference has a digest and the references are identical;
  - nothing calls corepack directly;
  - the Yarn and corepack versions are exact pins;
  - the `.node-version` rules hold.

I tested this here: the full unit suite passes (528 → 536 tests), lint and Prettier are clean, and the typecheck passes. In a simulated environment with a fake classic Yarn on `PATH` and a fresh `HOME`, `yarn --version` returns 4.18.1, and a second run does no reinstall. I couldn't run the GitHub container itself.

## Delivery

Extract it at the repo root: `kphoto-corepack-fix.tar.gz`. It keeps the executable bit on `scripts/lib.sh`.

Files in the archive:
- `.node-version` (new)
- `.github/workflows/verify.yml`
- `.github/workflows/deploy.yml`
- `compose.yaml`
- `scripts/lib.sh`
- `src/versionSync.test.ts`
- `README.md`
- `CHANGELOG.md`
- `docs/adr/0011-…`, `0014-…`, `0017-…`, `0019-…` (amended)
- `docs/adr/0039-yarn-without-bundled-corepack.md`, `0040-playwright-image-pinned-by-digest.md`, `0041-node-version-file.md` (new)

**Files to delete:** none.

After extracting, run `./check.sh`. Podman will pull the pinned digest, and this time your local run uses the same Node 26 image as CI. Your old global corepack setup is no longer needed, but it does no harm.

The fix is in `kphoto-corepack-fix.tar.gz`; extract it at the repo root and run `./check.sh`. Podman will pull the pinned image this time, so your local run should match CI.

