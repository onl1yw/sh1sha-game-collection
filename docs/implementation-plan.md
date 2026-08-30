# Platform implementation status

The first game module and the platform foundation are complete. This document
remains a checklist for future work.

## 1. Tooling and quality control

- [x] set up React, TypeScript, and Vite;
- [x] add ESLint and type checking;
- [x] add an automated 300-line file limit;
- [x] make Vitest and the production build required checks.

## 2. Domain

- [x] define player, settings, theme, and round types;
- [x] implement selection of real and alternative objects;
- [x] implement fair assignment of one or more spies;
- [x] implement selection of the first player;
- [x] cover the rules with unit tests.

## 3. Data

- [x] implement the manifest and JSON theme loader;
- [x] add validation and error messages;
- [x] populate the initial themes;
- [x] avoid immediate repeats of recently played objects.

## 4. Persistence

- [x] persist settings and the current session;
- [x] persist role-assignment history separately;
- [x] restore a game after a page reload;
- [x] always restore role reveal in the hidden state;
- [x] add an action to reset local assignment history.

## 5. Interface

- [x] theme selection;
- [x] player count and names;
- [x] spy count and mode;
- [x] sequential phone handoff and card reveal;
- [x] round-start and active-round screens with theme and elapsed time;
- [x] results and replay.

## 6. Prototype validation

- [x] complete flows with one and multiple spies;
- [x] verify both modes;
- [x] verify a page reload while a role is revealed;
- [x] verify mobile layouts at 360×640 and 390×844;
- [x] verify that no file exceeds 300 lines;
- [x] build a fully static production site.

## 7. Platform and contributions

- [x] move Spy into the independent `src/games/spy` directory;
- [x] define the versioned `GameModule` contract;
- [x] discover game modules without central-registry edits;
- [x] load the selected game's code in a separate lazy chunk;
- [x] reject cross-game imports in the architecture check;
- [x] document how to add games and JSON themes;
- [x] add CI, issue and PR templates, and contribution rules;
- [x] add agent instructions, a first-contribution guide, and an explicit game
      module generator;
- [x] adopt a source-available license with required attribution.

## Next steps

- calibrate the word catalogs through real play sessions;
- consider importing user-provided JSON packs;
- accept a second game module and verify the contract against a real example;
- add an automated availability check for the deployed site.
