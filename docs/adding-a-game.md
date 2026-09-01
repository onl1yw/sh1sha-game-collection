# Adding a game

Games are integrated as local compile-time modules. The platform discovers
`src/games/*/gameModule.ts` through `import.meta.glob`, so adding a game does
not require changes to the central menu, router, or registry.

## Create the scaffold

From the repository root, run:

```bash
npm run create:game -- --id alias --title "Alias"
```

You may also pass `--description "Explain words to your team"`. The generator
validates the `kebab-case` ID, refuses to overwrite any existing target, and
creates the descriptor, lazy root screen, scoped styles, documentation, and a
smoke test. It does not edit a central registry.

The scaffold is intentionally a connected placeholder rather than a demo game.
Replace it with a playable implementation before opening a pull request. No
sample module appears in the collection unless a contributor explicitly runs
the command and commits the resulting game.

## Generated structure

```text
src/games/alias/
  gameModule.ts
  AliasGame.tsx
  AliasGame.module.css

docs/games/alias.md
tests/unit/games/alias.test.tsx
```

The directory name and `gameModule.id` must match and use `kebab-case`.
As the implementation grows, split rules, state, screens, and adapters into
`domain/`, `app/`, `features/`, and `infrastructure/` inside the game directory.
Direct imports between separate directories in `src/games` are prohibited.

## Module descriptor

```ts
import { MessagesSquare } from "lucide-react";

import {
  GAME_MODULE_API_VERSION,
  defineGame,
} from "../../app/gameModule";

export const gameModule = defineGame({
  apiVersion: GAME_MODULE_API_VERSION,
  id: "alias",
  title: "Alias",
  description: "Объясняйте слова своей команде",
  continueDescription: "Продолжить игру",
  Icon: MessagesSquare,
  order: 20,
  getCatalogState: ({ storage }) => ({
    hasSavedSession: storage?.getItem("session:v1") !== null,
  }),
  load: () => import("./AliasGame"),
});
```

`gameModule.ts` is loaded with the catalog, so keep it small. It must not
instantiate providers, fetch content, or write to storage. The game itself is
loaded lazily through `load` and must have a default export.

## Root component

```tsx
import type { GameHostProps } from "../../app/gameModule";

export default function AliasGame({
  paused,
  preferences,
  storage,
  onExit,
  onOpenSettings,
}: GameHostProps) {
  // Assemble the provider and suspend timed interactions while paused.
  return null;
}
```

The platform supplies shared preferences, isolated storage, a paused flag, and
navigation commands. Timed interactions must suspend while `paused` is true.
The platform must not know about a particular game's rounds, teams, roles, or
other rules.

## Responsibility boundaries

- `domain` contains pure rules with no React, DOM, `fetch`, or
  `localStorage`;
- `app` or `application` contains state, commands, and ports;
- `infrastructure` implements adapters over the supplied storage and loaders;
- `features` or `ui` contains screens and uses `src/shared/ui`;
- game styles live only in `*.module.css` files and do not use `:global`;
- only the composition root or provider instantiates concrete adapters;
- one game never imports code from another game;
- a component becomes shared only after its universality is demonstrated.

Do not introduce universal `GameState`, `Round`, or `Settings` types:
identically named concepts in different games usually have different semantics.

## Persistence

The `storage` field in `GameHostProps` is already scoped to the current
game's namespace. Pass relative keys:

```text
storage.setItem("session:v1", serializedSession)
storage.setItem("history:v1", serializedHistory)
```

In the browser, the platform stores them as
`sh1sha-games:alias:session:v1` and `sh1sha-games:alias:history:v1`. The
architecture check rejects direct access to `localStorage` or
`sessionStorage` from game code, preventing accidental collisions with other
games.

Persisted formats must be versioned. A schema change requires a migration and a
test that restores the previous version. A storage failure must not crash the
entire game. The methods mirror browser Storage and may throw when access is
denied or the quota is full; an infrastructure adapter must turn that failure
into a controlled result or warning.

## Required validation

A new module must include:

- unit tests for its rules;
- a reducer or state-machine test;
- a storage recovery test when persistence is used;
- a smoke test for the root component;
- concise documentation in `docs/games/<id>.md`.

Before opening a pull request, run:

```bash
npm run check
```

The command validates types, tests, the 300-line limit, the production build,
and the absence of cross-game or reverse dependencies.
