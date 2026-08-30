# Platform architecture

## Goal

`sh1sha's game collection` is a static, mobile-first platform for local games
played on one device. Each game ships as its own compile-time module, while the
platform is responsible only for the catalog, shared preferences, and visual
primitives.

The application does not load remote plugins at runtime. Keeping every module in
the build makes the static artifact predictable and lets CI validate every
contribution before release.

## Dependency map

```text
app + platform features ──> GameModule contract <── games/* module boundary
          │                                            │
          v                                            v
      shared/ui                              game app -> game domain
                                                    ^
                                                    │
                                          game infrastructure
```

```text
src/
  app/                       platform shell and registry
  features/
    game-collection/         game catalog
    settings/                shared preferences
  games/
    spy/
      gameModule.ts          small descriptor
      SpyGame.tsx            root and lazy entry point
      app/                   state, commands, ports, and router
      domain/                pure game rules
      features/              game screens
      infrastructure/        storage, randomness, and theme loading
  shared/ui/                 shared visual primitives
```

## Platform

`src/app/gameModule.ts` defines the stable module API. A descriptor contains an
ID, catalog-card copy, a Lucide icon, optional resume state, and an asynchronous
`load` function for the root component.

`src/app/gameRegistry.ts` discovers `src/games/*/gameModule.ts`
automatically and validates the API version, the match between module ID and
directory name, and ID uniqueness. The game implementation itself is loaded
lazily in a separate chunk.

A new module is not registered manually in `App.tsx`. This reduces conflicts
between concurrent pull requests.

## Game boundary

A game owns all of its concepts:

- rules and round types;
- screen state machine and commands;
- DTOs, migrations, and storage keys;
- game content and its schemas;
- screens and game-specific messages.

The platform passes only `GameHostProps`: shared preferences, a return action,
and an action that opens settings. It does not inspect the game's internal
state.

Games do not import one another. Even if Alias and Spy both use concepts such as
players or rounds, their models remain separate until real repeated use proves a
shared contract.

## Layers inside a game

### `domain`

Pure TypeScript rules with no React, DOM, `fetch`, or `localStorage`. This
layer can be tested in Node without a browser environment.

### `app`

State, reducer or state machine, commands, and ports for external dependencies.
This layer depends on its own domain but does not instantiate browser adapters.

### `infrastructure`

Port implementations for persistence, migrations, JSON loading, and
randomness. Concrete implementations are assembled only in the game's provider
or composition root.

### `features`

Screens and small UI components. They receive data and callbacks through props,
use `shared/ui`, and do not access infrastructure directly.

## Shared UI

`src/shared/ui` contains universal visual primitives only. Shared code does
not import the platform or any game, and knows nothing about roles, themes, or
rounds. Component contracts are documented in
`docs/ui-components.md`.

## Spy content

Public JSON themes live in `public/games/spy/themes`. Catalog metadata
(`enabled`, `sensitive`) is separate from the strict game-theme model. An
invalid file is excluded without breaking the remaining themes.

Schemas live in `schemas/games/spy`. Local packs in `.local-themes` are
excluded from Git and from the production build.

## Persistence

The platform gives each game scoped storage and automatically prefixes its keys
with `sh1sha-games:<game-id>`. A game sees relative keys only, so it cannot
accidentally overwrite another module's state.

Spy stores its session and fair-assignment history separately. Its single
legacy adapter migrates old `spy-game:*` keys into the new namespace. CI
forbids direct access to browser storage from game code. Migrations must be
covered by round-trip tests. Infrastructure adapters handle quota and access
errors. A revealed secret role is never persisted as revealed.

## Automated boundaries

`npm run check:architecture` parses static and dynamic imports with the
TypeScript AST and verifies that:

- the platform does not import concrete games;
- `shared` does not import the platform or games;
- games do not import neighboring games;
- a game's domain does not depend on React, UI, application, or infrastructure;
- game UI does not import infrastructure;
- concrete adapters are created only in a composition root;
- `gameModule.ts` does not import UI eagerly and has one dynamic entry point;
- games use only the scoped storage supplied by the platform;
- game styles use CSS Modules without `:global` and do not leak into the shell;
- every game directory contains exactly one `gameModule.ts`.

In addition, `npm run check:size` rejects files longer than 300 lines.

## Extending the platform

- new game: `docs/adding-a-game.md`;
- new Spy theme: `docs/adding-a-theme.md`;
- first contribution or agent-assisted workflow: `docs/first-contribution.md`
  and `AGENTS.md`;
- shared-component rules: `docs/ui-components.md`.

Every extension must pass `npm run check` before a pull request is opened.
