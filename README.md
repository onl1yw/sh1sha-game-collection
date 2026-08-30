# sh1sha's game collection

[![CI](https://github.com/onl1yw/sh1sha-game-collection/actions/workflows/ci.yml/badge.svg)](https://github.com/onl1yw/sh1sha-game-collection/actions/workflows/ci.yml)
[![PolyForm Noncommercial](https://img.shields.io/badge/license-PolyForm%20Noncommercial-yellow.svg)](LICENSE)

A mobile-first collection of local pass-and-play games for groups sharing one
phone. No registration, server, or in-game advertising.

**Demo:** <https://onl1yw.github.io/sh1sha-game-collection/>

The collection currently includes Spy, with classic and alternative-word modes,
multiple spies, fair role assignment, session recovery after a reload, and an
extensible theme catalog.

Repository and contributor documentation is in English. The current Spy
interface and bundled theme content intentionally remain in Russian; every
future game owns its player-facing locale.

## Why this repository exists

This project is designed as a contribution-friendly platform for small party
games. Each game lives in an independent module with its own rules, state,
storage, and interface. The platform discovers these modules automatically and
displays them in a shared catalog.

```text
src/games/spy/       self-contained Spy module
src/app/             shell, settings, and game registry
src/shared/ui/       reusable UI primitives
public/games/spy/    Spy theme catalogs in JSON
```

Adding a game means adding its own directory; the central router and menu do not
need to change. The selected game is loaded lazily in a separate chunk.

## Getting started

Requires Node.js 22.13+ and npm 10+.

```bash
npm ci
npm run dev
```

Run the full validation gate before opening a pull request:

```bash
npm run check
```

It checks architecture boundaries, the 300-line file limit, theme catalogs,
ESLint, the unit test suite, TypeScript, and the production build.

## Contributing

We welcome:

- bug fixes and accessibility improvements;
- new self-contained games;
- new themes and edits to existing catalogs;
- reusable UI components;
- tests and documentation.

Start with [CONTRIBUTING.md](CONTRIBUTING.md). For a substantial new game, open
an issue from the provided template first so that its game loop and module
boundaries can be agreed on before implementation.

Agent-assisted contributions are welcome. Give the agent [AGENTS.md](AGENTS.md)
as its repository contract and follow the
[first-contribution walkthrough](docs/first-contribution.md). A minimal new game
module can be created explicitly with:

```bash
npm run create:game -- --id alias --title "Alias"
```

The repository does not ship a sample or test game in the catalog. The command
creates a real module only when a contributor runs it.

- [Adding a game](docs/adding-a-game.md)
- [Adding a theme](docs/adding-a-theme.md)
- [Your first contribution](docs/first-contribution.md)
- [Architecture](docs/architecture.md)
- [UI components](docs/ui-components.md)
- [Theme format](docs/theme-format.md)
- [UI guidelines](docs/ui-guidelines.md)

## Core guarantees

- a game's domain does not depend on React or browser APIs;
- games do not import one another's internals;
- the platform does not import specific games;
- each game has its own storage namespace and schema version;
- JSON themes are validated before the build;
- one invalid catalog cannot break every other catalog;
- a recovered secret role is never restored in a revealed state;
- the interface respects `prefers-reduced-motion`.

## License

The code is available under the
[PolyForm Noncommercial License 1.0.0](LICENSE). Noncommercial use, copying,
modification, and distribution are permitted as long as the license and the
attribution statement in [NOTICE](NOTICE) are preserved.

Runtime dependency licenses are listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). All three files are included
in production artifacts automatically.

Commercial use is prohibited. Different terms require permission from every
rights holder whose code or content would be affected.

Because of this restriction, the project is **source-available**, not open
source under the formal Open Source Definition. The original author is
**sh1sha**.
