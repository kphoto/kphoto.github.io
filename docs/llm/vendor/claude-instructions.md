a blog

repository is public at https://github.com/kphoto/kphoto.github.io

when using github API, use the following PAT so you avoid rate limits when reading public endpoints. you should not attempt to write to other people's repositories and this token doesn't allow you any write access anyways 

[redacted]

it is ok to have this pat in the instructions. I won't include it in the public github repo. don't worry about it. 

it is critical for you to give me FULL files for all files that need to change
as well as the path for the file 
because sometimes the same file name exists in multiple places 

review `dump.txt`, if it exists, for full source code as it exists now

kphoto — standing instructions

Purpose: a demonstration of what is possible with typescript 7 and the modern web. 
Public: https://github.com/kphoto/kphoto.github.io

- Licensing: AGPL-3.0-or-later. Every dependency must be free, permit commercial
  use, be AGPL-compatible, and have no nagware; 
- Always latest: toolchain, crates, GitHub Actions versions, base images.
- CI: keep GitHub Actions as SLIM as possible — only checkout + cache + call bash
  scripts in scripts/, which hold all real logic (so it runs identically locally).
- Engineering: SOLID, dependency inversion, pure/time-injected logic, as many
  unit tests as possible.
- Docs discipline: update README + docs/ + docs/adr/ (ADRs, adr.github.io style)
  + CHANGELOG.md in the SAME change as any code change.
- Disclosure: README must clearly state the project is developed with substantial
  AI/LLM assistance (over-communicate; not just "LLM assisted").
- DELIVERY RULE: always provide FULL file contents plus the full relative path for
  every file that changes (same filename may exist in multiple dirs). For a large
  multi-file drop, deliver a zip and say which files to delete.
- export.sh dumps tracked files to docs/llm/dump.txt for LLM context; 
  contents of docs/llm/ will NOT bein the dump. 
  Review dump.txt for current source at the start of a session.
- use yarn 
- always add FULL unit tests 
- github actions should deploy to github pages after every push to main
- we should also have full suite of github actions, everything from build 
  to test to everything
- add support for playwright testing as well as vitest
- get rid of the boiletplate code that is here in the beginning 
- do not use a framework such as react or anything like that
- keep dependencies to a minimum
- use the absolute latest version of all dependencies 
- we only support the latest evergreen version of web browsers 
  we don't care if it doesn't support web browsers that are even three months old 
  this is a showcase of what is possible without legacy code
- create and reuse components such as header, navbar, and footer
- each component should have its own scoped css somehow 
- do not use any css framework 
- do not use any external dependency at all, no outside resource   
- add developer experience things such as `.vscode/settings.json` typescript-eslint config `eslint.config.ts` and `.prettierrc.json` 
  you can assume developer uses visual studio code 
- Adopt TypeScript 6's deprecation warnings as errors now 
- Keep your tsconfig.json minimal and modern (see §4) — the fewer deprecated options you rely on, the less migration work every future release costs you.
- Use tools (Vite, Vitest, ESLint's typescript-eslint) that have already announced or shipped native-compiler compatibility, rather than ones still tied exclusively to the legacy API.
- ADR files should live inside docs folder, CHANGELOG.md should live at root of the repo with README.md
- include a new bash script that runs all the build and tests and runs export.sh as well that lives at the root of the repo so I can test before pushing to github actions
- for the beginning you can assume I am on fedora linux 43 on an acer swift go 14 with amd 8845hs
- website should have a blog, about us page, contact us page, home page that showcases the blog
- each blog post is a markdown file and has a header
  the summary and the tags show in the list view as well as the detail view 
  each blog post has its own url 
  blog post url include the date stamp to make sure they are unique
  for example there could be multiple good morning but only one per day
```markdown content/blog/2026-03-22-good-morning.md
---
title: Good morning!
date: 2026-03-22
author: kphoto-team
summary: In which I say Good morning to you
tags:
  - introductions
---

## Good morning 

It is almost eleven in the morning eastern time as I type this. 
Hope you are doing well. 


```
- each author file will be a yaml file as well for example the default one is 
```yaml content/authors/kphoto-team.yml
name: kphoto team
email: hello@mkphoto.example
bio: The team behind Merciful Potato Magazine — building free, open-source tools with .NET 10 and Blazor WebAssembly.
avatar: images/authors/kphoto-team.png
socials:
  github: kphoto
```
- website should be fully responsive and have multiple theme options such as light mode, dark mode, solarized light, solarzied dark, etc 
- website should highlight the github repository in the footer
- website should be fully accessible
- website should use browser features such as local storage to the max to remember user settings 
