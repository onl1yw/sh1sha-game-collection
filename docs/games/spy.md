# Spy

Spy is the collection's first game module and the reference implementation for
platform integration. It runs locally on one phone: players reveal their cards
in sequence, then ask one another questions and try to identify the spy.

## Modes

- **Spy knows their role** (`Шпион знает свою роль`): non-spies see one
  object, while the spy sees only their role.
- **Spy receives a different word** (`Шпион получает другое слово`):
  non-spies see one object, while the spy sees a different object from the same
  group and does not know that their word differs.

The game supports multiple spies, first-player selection, and assignment that
accounts for recent history so that one person does not receive the same role
too frequently.

## Module structure

```text
src/games/spy/
  gameModule.ts       metadata and lazy entry
  SpyGame.tsx         composition root
  domain/             pure rules
  app/                state, commands, and ports
  infrastructure/     storage, randomness, and theme loading
  features/           game screens
```

`gameModule.ts` is the platform's only discovery point. Spy's rules are not
exported to other games.

## Data and persistence

The theme catalog lives in `public/games/spy/themes` and is controlled by its
manifest. Its format is described in the
[shared theme document](../theme-format.md).

New data is stored through the platform-supplied scoped storage under the
`sh1sha-games:spy` namespace. The module adapter migrates compatible sessions
from the legacy `spy-game:*` keys once, so an upgrade does not discard the
current game.

## Validation

Unit tests cover the domain, reducer, recovery, browser adapters, screens,
catalog content, and icons. Run the complete gate with `npm run check`.
