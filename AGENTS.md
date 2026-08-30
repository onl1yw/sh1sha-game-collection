# Agent contribution guide

This file is the shortest reliable contract for coding agents working in this
repository. Human contributors should start with `CONTRIBUTING.md`.

## Project intent

- Build a modular collection of mobile, pass-and-play party games.
- Keep every game independently replaceable and lazy-loaded.
- Accept small improvements, new theme packs, and complete new games through
  pull requests.
- Treat the repository as source-available under the PolyForm Noncommercial
  License 1.0.0. Preserve `LICENSE`, `NOTICE`, and third-party notices.

Repository documentation, code comments, commit messages, issues, and pull
request descriptions should be written in English. User-facing game copy may
use the locale intentionally supported by that game.

## Start here

1. Read `README.md` and `CONTRIBUTING.md`.
2. For a new game, read `docs/adding-a-game.md` and run:

   ```bash
   npm run create:game -- --id my-game --title "My Game"
   ```

3. For a Spy theme, read `docs/adding-a-theme.md`.
4. For a first pull request, follow `docs/first-contribution.md`.

The generator creates a real module under `src/games/`. It does not create or
register sample games until somebody explicitly runs it.

## Architecture contract

- `src/app/` owns the host, game contract, registry, storage isolation, and
  error boundaries. It must not import a concrete game.
- `src/features/` contains platform screens. It must not import a concrete
  game.
- `src/shared/` contains reusable UI and utilities. It must not import platform
  features or games.
- `src/games/<game-id>/` owns one game. A game must not import another game.
- Each game exposes exactly one `gameModule.ts` descriptor and exactly one
  local dynamic import from that descriptor.
- Game domain code must not import React, UI, infrastructure, or browser APIs.
- Game UI must not import concrete infrastructure.
- Games receive namespaced storage and host callbacks through `GameHostProps`.
  Do not access `localStorage` or `sessionStorage` directly.
- Game styles must use CSS modules and may not use `:global`.
- Do not add a game to a central list. `src/app/gameRegistry.ts` discovers it.

`npm run check:architecture` enforces these boundaries. Do not weaken the
checker to make a feature pass.

## Change discipline

- Keep every source, test, style, script, and documentation file at or below
  300 lines. Split by responsibility before reaching the limit.
- Reuse components from `src/shared/ui/` before inventing game-local variants.
- Keep unrelated refactors out of a focused pull request.
- Never commit secrets, local theme packs, build output, browser recordings, or
  copied commercial word lists and artwork.
- Add or update tests for behavior changes. Test domain rules without React
  when possible; use focused component tests for interaction and accessibility.
- Update the relevant English documentation when a contract or workflow
  changes.

## Required workflow

```bash
npm ci
npm run check
```

During development, run the narrowest relevant test first. Before handing work
back, `npm run check` must pass. Report any check you could not run and why.

## Definition of done

A contribution is ready when:

- it respects the module boundaries above;
- it has focused tests and accessible controls;
- it contains no proprietary or unlicensed content;
- relevant documentation is current;
- all changed files stay within 300 lines;
- `npm run check` succeeds; and
- the pull request template is completed honestly.
